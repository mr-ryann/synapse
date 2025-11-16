import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Lightbulb, Send } from 'lucide-react-native';

import { databases, functions, account } from '../../lib/appwrite';
import { useChallengeStore } from '../../stores/useChallengeStore';
import { useUserStore } from '../../stores/useUserStore';
import { AppHeader } from '../../components/navigation/AppHeader';
import { ThinkingTimer } from '../../components/challenge/ThinkingTimer';
import { HintModal } from '../../components/challenge/HintModal';
import { COLORS, FONTS } from '../../theme';

interface Challenge {
  id: string;
  promptText: string;  // Changed from coreProvocation
  topic: string;
  topicID: string;  // Matches Appwrite schema
  estimatedTime: number;
  difficulty: number;
  archetype?: string;
  mutator?: string;
  source?: string;
  mode?: string;
}

export default function ChallengePlayer() {
  const router = useRouter();
  const { user } = useUserStore();
  const {
    currentChallenge,
    setCurrentChallenge,
    thinkingTime,
    setThinkingTime,
    currentHint,
    setCurrentHint,
    resetChallengeSession,
  } = useChallengeStore();

  // Local state
  const [responseText, setResponseText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [challengeStartTime] = useState(Date.now());

  // Load initial challenge
  useEffect(() => {
    loadChallenge();

    return () => {
      // Cleanup on unmount
      resetChallengeSession();
    };
  }, []);

  /**
   * WIRING: Get Challenge from Backend
   */
  const loadChallenge = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to continue');
      router.replace('/login');
      return;
    }

    setLoading(true);
    try {
      console.log('🔵 Loading challenge for user:', user.$id);
      
      const execution = await functions.createExecution(
        'getChallengeForUser',
        JSON.stringify({ userId: user.$id, mode: 'recommended' })
      );

      console.log('🔵 Function execution response:', execution);
      console.log('🔵 Response status:', execution.status);
      console.log('🔵 Response body:', execution.responseBody);
      console.log('🔵 Response body length:', execution.responseBody?.length);

      // Check if function execution failed
      if (execution.status === 'failed') {
        console.error('❌ Function execution failed');
        throw new Error(
          'Function execution failed.\n\n' +
          'Possible causes:\n' +
          '• Missing environment variables (API keys)\n' +
          '• Function not deployed\n' +
          '• Database permissions issue\n\n' +
          'Please check Appwrite Console → Functions → Get Challenge For User → Executions for detailed logs.'
        );
      }

      // Check for empty response
      if (!execution.responseBody || execution.responseBody.trim() === '') {
        console.error('❌ Empty response body');
        console.error('❌ Execution status:', execution.status);
        
        throw new Error(
          'Function returned empty response.\n\n' +
          'This usually means:\n' +
          '• Function is missing environment variables\n' +
          '• Function timed out (check timeout settings)\n' +
          '• Python dependencies not installed\n\n' +
          'Check: Appwrite Console → Functions → Get Challenge For User → Settings → Variables\n' +
          'Required: APPWRITE_DATABASES_API_KEY, GEMINI_API_KEY'
        );
      }

      // Try to parse JSON
      let result;
      try {
        result = JSON.parse(execution.responseBody);
        console.log('🔵 Parsed result:', result);
      } catch (parseError) {
        console.error('❌ JSON Parse error:', parseError);
        console.error('❌ Response body was:', execution.responseBody);
        throw new Error(`Failed to parse response: ${execution.responseBody.substring(0, 100)}...`);
      }

      if (result.success) {
        const challengeData: Challenge = {
          id: result.data.id,
          promptText: result.data.promptText,
          topic: result.data.topic,
          topicID: result.data.topicID,
          estimatedTime: result.data.estimatedTime || 8,
          difficulty: result.data.difficulty || 1,
          archetype: result.data.archetype,
          mutator: result.data.mutator,
          source: result.data.source,
          mode: result.data.mode,
        };
        
        console.log('✅ Challenge loaded successfully:', challengeData);
        setCurrentChallenge(challengeData);
      } else {
        console.error('❌ Function returned error:', result.error);
        throw new Error(result.error || 'Failed to load challenge');
      }
    } catch (error: any) {
      console.error('❌ Error loading challenge:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      let errorMessage = 'Failed to load challenge. Please try again.';
      if (error.message) {
        errorMessage += `\n\nDetails: ${error.message}`;
      }
      
      Alert.alert('Error', errorMessage, [
        { text: 'Retry', onPress: loadChallenge },
        { text: 'Go Back', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * WIRING: Get AI Hint
   */
  const handleGetHint = async () => {
    if (!currentChallenge) return;

    setLoadingHint(true);
    try {
      const execution = await functions.createExecution(
        'get-ai-hint',
        JSON.stringify({
          questionId: currentChallenge.id,
          userQuery: responseText || 'I need a hint',
        })
      );

      const result = JSON.parse(execution.responseBody);

      if (result.success) {
        setCurrentHint(result.data.hint);
        setShowHintModal(true);
      } else {
        throw new Error(result.error || 'Failed to get hint');
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      Alert.alert('Error', 'Failed to get AI hint. Please try again.');
    } finally {
      setLoadingHint(false);
    }
  };

  /**
   * WIRING: Submit Challenge Response
   */
  const handleSubmitThoughts = async () => {
    if (!currentChallenge || !user || !responseText.trim()) return;

    const totalThinkingTime = Math.floor((Date.now() - challengeStartTime) / 1000);

    setLoading(true);
    try {
      const execution = await functions.createExecution(
        'submit-challenge-step',
        JSON.stringify({
          userId: user.$id,
          challengeId: currentChallenge.id,
          responseText: responseText,
          thinkingTime: totalThinkingTime,
        })
      );

      const result = JSON.parse(execution.responseBody);

      if (result.success) {
        const minutes = Math.floor(totalThinkingTime / 60);
        const seconds = totalThinkingTime % 60;
        const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

        // Show success feedback
        Alert.alert(
          'Great Thinking! 🧠',
          `You earned ${result.data.xpEarned} XP!\n\nThinking Time: ${timeStr}`,
          [
            {
              text: 'Next Challenge',
              onPress: () => {
                resetChallengeSession();
                setResponseText('');
                setIsThinking(false);
                loadChallenge();
              },
            },
            {
              text: 'Go Home',
              onPress: () => router.push('/home'),
              style: 'cancel',
            },
          ]
        );
      } else {
        throw new Error(result.error || 'Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      Alert.alert('Error', 'Failed to submit your thoughts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentChallenge) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent.primary} />
        <Text style={styles.loadingText}>Loading your challenge...</Text>
      </View>
    );
  }

  if (!currentChallenge) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No challenge available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadChallenge}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader 
        title={currentChallenge.topic}
        subtitle={`~${currentChallenge.estimatedTime} min • Difficulty ${currentChallenge.difficulty}`}
        showBackButton={true}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Challenge Section */}
          <View style={styles.section}>
            <Text style={styles.challengeTitle}>{currentChallenge.topic}</Text>
            <Text style={styles.challengeProvocation}>
              {currentChallenge.promptText}
            </Text>
          </View>

          {/* Thinking Timer */}
          <View style={styles.timerContainer}>
            <ThinkingTimer
              isActive={isThinking}
              time={thinkingTime}
              onTimeUpdate={setThinkingTime}
            />
          </View>

          {/* Blank Canvas */}
          <View style={styles.section}>
            <Text style={styles.canvasLabel}>Your Thoughts</Text>
            <Text style={styles.canvasSubtitle}>
              Take your time. There's no rush. Write whatever comes to mind.
            </Text>
            <TextInput
              style={[
                styles.textarea,
                isThinking && styles.textareaFocused,
              ]}
              placeholder="Start writing your thoughts here..."
              placeholderTextColor={COLORS.text.muted}
              value={responseText}
              onChangeText={setResponseText}
              onFocus={() => setIsThinking(true)}
              multiline
              autoCapitalize="sentences"
              textAlignVertical="top"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.hintButton,
                (loadingHint || loading) && styles.buttonDisabled,
              ]}
              onPress={handleGetHint}
              disabled={loadingHint || loading}
            >
              {loadingHint ? (
                <ActivityIndicator size="small" color={COLORS.accent.secondary} />
              ) : (
                <>
                  <Lightbulb size={20} color={COLORS.accent.secondary} />
                  <Text style={styles.hintButtonText}>Get a Hint</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!responseText.trim() || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitThoughts}
              disabled={!responseText.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.background.primary} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Submit Thoughts</Text>
                  <Send size={20} color={COLORS.background.primary} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Hint Modal */}
        {currentHint && (
          <HintModal
            isOpen={showHintModal}
            onClose={() => setShowHintModal(false)}
            hint={currentHint}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  challengeTitle: {
    fontSize: 28,
    fontFamily: FONTS.heading,
    fontWeight: '700',
    color: COLORS.text.primary,
    lineHeight: 36,
    marginBottom: 12,
  },
  challengeProvocation: {
    fontSize: 18,
    fontFamily: FONTS.body,
    color: COLORS.text.primary,
    lineHeight: 28,
  },
  timerContainer: {
    marginBottom: 24,
  },
  canvasLabel: {
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  canvasSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.muted,
    marginBottom: 12,
  },
  textarea: {
    borderWidth: 2,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.elevated,
    minHeight: 250,
    textAlignVertical: 'top',
  },
  textareaFocused: {
    borderColor: COLORS.accent.primary,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.background.elevated,
    borderWidth: 2,
    borderColor: COLORS.accent.secondary,
  },
  hintButtonText: {
    color: COLORS.accent.secondary,
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.accent.primary,
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonText: {
    color: COLORS.background.primary,
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border.default,
    shadowOpacity: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: COLORS.accent.primary,
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.background.primary,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: COLORS.background.elevated,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});
