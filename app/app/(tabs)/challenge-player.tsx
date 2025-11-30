import React, { useState, useEffect, useRef } from 'react';
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
  Keyboard,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lightbulb, Send, X, PenLine } from 'lucide-react-native';

import { databases, functions, account } from '../../lib/appwrite';
import { useChallengeStore } from '../../stores/useChallengeStore';
import { useUserStore } from '../../stores/useUserStore';
import { ThinkingTimer } from '../../components/challenge/ThinkingTimer';
import { HintModal } from '../../components/challenge/HintModal';
import { COLORS, FONTS } from '../../theme';

interface Challenge {
  id: string;
  title: string;
  questions: string[];
  topic: string;
  topicID: string;
  estimatedTime: number;
  difficulty: number;
  archetype?: string;
  mutator?: string;
  source?: string;
  mode?: string;
}

export default function ChallengePlayer() {
  const router = useRouter();
  const params = useLocalSearchParams();
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
  
  // Multi-step question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [allQuestions, setAllQuestions] = useState<string[]>([]);
  
  // Collected responses (stored locally until challenge complete)
  const [collectedResponses, setCollectedResponses] = useState<Array<{
    questionIndex: number;
    questionText: string;
    responseText: string;
    thinkingTime: number;
  }>>([]); 
  
  // Ref for TextInput to handle keyboard dismissal
  const textInputRef = useRef<TextInput>(null);
  const lastScrollY = useRef(0);
  const [isTextboxExpanded, setIsTextboxExpanded] = useState(false);

  // Load initial challenge
  useEffect(() => {
    loadChallenge();

    return () => {
      // Cleanup on unmount
      resetChallengeSession();
    };
  }, [params.challengeId]); // Reload when challengeId changes

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
      const challengeId = params.challengeId as string;
      
      // If challengeId is provided, load that specific challenge directly
      if (challengeId) {
        const challengeDoc = await databases.getDocument(
          'synapse',
          'challenges',
          challengeId
        );
        
        const challengeData: Challenge = {
          id: challengeDoc.$id,
          title: challengeDoc.title || challengeDoc.topicName,
          questions: challengeDoc.questions || [],
          topic: challengeDoc.topicName,
          topicID: challengeDoc.topicID,
          estimatedTime: challengeDoc.estimatedTime || 8,
          difficulty: challengeDoc.difficulty || 1,
          archetype: challengeDoc.archetype,
          mutator: challengeDoc.mutator,
        };
        
        setCurrentChallenge(challengeData);
        setAllQuestions(challengeDoc.questions || []);
        setCurrentQuestionIndex(0);
        setQuestionStartTime(Date.now());
        setCollectedResponses([]);
        setLoading(false);
        return;
      }
      
      // Otherwise, get a recommended challenge from the function
      const execution = await functions.createExecution(
        'getChallengeForUser',
        JSON.stringify({ userId: user.$id, mode: 'recommended' })
      );

      // Check if function execution failed
      if (execution.status === 'failed') {
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
      } catch (parseError) {
        throw new Error(`Failed to parse response: ${execution.responseBody.substring(0, 100)}...`);
      }

      if (result.success) {
        const challengeData: Challenge = {
          id: result.data.id,
          title: result.data.title || result.data.topic,
          questions: result.data.questions || [],
          topic: result.data.topic,
          topicID: result.data.topicID,
          estimatedTime: result.data.estimatedTime || 8,
          difficulty: result.data.difficulty || 1,
          archetype: result.data.archetype,
          mutator: result.data.mutator,
          source: result.data.source,
          mode: result.data.mode,
        };
        
        setCurrentChallenge(challengeData);
        setAllQuestions(result.data.questions || []);
        setCurrentQuestionIndex(0);
        setQuestionStartTime(Date.now());
        setCollectedResponses([]);
      } else {
        throw new Error(result.error || 'Failed to load challenge');
      }
    } catch (error: any) {
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
      Alert.alert('Error', 'Failed to get AI hint. Please try again.');
    } finally {
      setLoadingHint(false);
    }
  };

  /**
   * WIRING: Submit Question Response (Multi-Step)
   * Collects responses locally and submits all at once when challenge is complete
   */
  const handleNextQuestion = async () => {
    if (!currentChallenge || !user || !responseText.trim()) {
      return;
    }
    if (allQuestions.length === 0) {
      return;
    }

    const currentQuestion = allQuestions[currentQuestionIndex];
    const questionThinkingTime = Math.floor((Date.now() - questionStartTime) / 1000);
    const isLastQuestion = currentQuestionIndex >= allQuestions.length - 1;

    // Store this response locally
    const newResponse = {
      questionIndex: currentQuestionIndex,
      questionText: currentQuestion,
      responseText: responseText,
      thinkingTime: questionThinkingTime,
    };
    
    const updatedResponses = [...collectedResponses, newResponse];
    setCollectedResponses(updatedResponses);

    if (isLastQuestion) {
      // All questions answered - submit to backend
      setLoading(true);
      try {
        const totalThinkingTime = updatedResponses.reduce((sum, r) => sum + r.thinkingTime, 0);
        
        const payload = {
          userId: user.$id,
          challengeId: currentChallenge.id,
          responses: updatedResponses,
          totalThinkingTime: totalThinkingTime,
        };
        
        const execution = await functions.createExecution(
          'submit-challenge',
          JSON.stringify(payload)
        );

        if (execution.status === 'failed') {
          throw new Error('Function execution failed. Check Appwrite console for logs.');
        }

        if (!execution.responseBody || execution.responseBody.trim() === '') {
          throw new Error('Function returned empty response. Check environment variables.');
        }

        const result = JSON.parse(execution.responseBody);

        if (result.success) {
          const { data } = result;
          
          // Challenge completed - show total results
          Alert.alert(
            '🎉 Challenge Complete!',
            `Amazing work! You earned ${data.totalXpEarned} XP!\n\n` +
            `Questions answered: ${data.questionsAnswered}/${data.totalQuestions}\n` +
            `Level: ${data.level}\n` +
            `Streak: ${data.streak} 🔥`,
            [
              {
                text: 'Next Challenge',
                onPress: () => {
                  resetChallengeSession();
                  setResponseText('');
                  setCurrentQuestionIndex(0);
                  setAllQuestions([]);
                  setCollectedResponses([]);
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
          // Remove the failed response from collected
          setCollectedResponses(collectedResponses);
          throw new Error(result.error || 'Failed to submit challenge');
        }
      } catch (error: any) {
        let errorMessage = 'Failed to submit your challenge. Please try again.';
        if (error.message) {
          errorMessage += `\n\nDetails: ${error.message}`;
        }
        // Revert the collected response on error
        setCollectedResponses(collectedResponses);
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // Move to next question (no API call, just local state update)
      setCurrentQuestionIndex(prev => prev + 1);
      setResponseText('');
      setQuestionStartTime(Date.now());
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

  // Handle scroll to dismiss keyboard when scrolling past textbox
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    // If scrolling down and moved more than 50px, dismiss keyboard
    if (currentScrollY > lastScrollY.current + 50) {
      Keyboard.dismiss();
    }
    lastScrollY.current = currentScrollY;
  };

  return (
    <View style={styles.container}>
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
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Challenge Title & Topic - Left aligned above nodes */}
          <View style={styles.challengeHeaderSection}>
            <Text style={styles.challengeTitle}>{currentChallenge.title}</Text>
            <Text style={styles.challengeTopic}>{currentChallenge.topic}</Text>
          </View>

          {/* Node Progress Indicator - Jagged Pulse Style */}
          {allQuestions.length > 0 && (
            <View style={styles.nodeProgressContainer}>
              <View style={styles.nodeRow}>
                {allQuestions.map((_, index) => (
                  <View key={index} style={styles.nodeWrapper}>
                    <View 
                      style={[
                        styles.node,
                        index < currentQuestionIndex && styles.nodeCompleted,
                        index === currentQuestionIndex && styles.nodeCurrent,
                        index > currentQuestionIndex && styles.nodeUpcoming,
                        // Alternate vertical position for jagged effect
                        index % 2 === 1 && styles.nodeOffset,
                      ]}
                    />
                    {index < allQuestions.length - 1 && (
                      <View style={styles.connectorWrapper}>
                        <View 
                          style={[
                            styles.nodeConnectorDiagonal,
                            index % 2 === 0 ? styles.connectorDown : styles.connectorUp,
                            index < currentQuestionIndex && styles.connectorCompleted,
                          ]}
                        />
                      </View>
                    )}
                  </View>
                ))}
              </View>
              <Text style={styles.nodeCounter}>
                Node {currentQuestionIndex + 1} of {allQuestions.length}
              </Text>
            </View>
          )}

          {/* Question Text */}
          <View style={styles.section}>
            {allQuestions.length > 0 && (
              <Text style={styles.questionText}>
                {allQuestions[currentQuestionIndex]}
              </Text>
            )}
          </View>

          {/* Hidden Thinking Timer - runs in background, not visible */}
          <View style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
            <ThinkingTimer
              isActive={isThinking}
              time={thinkingTime}
              onTimeUpdate={setThinkingTime}
            />
          </View>

          {/* Compact Text Input - Expands on click */}
          <Pressable 
            style={styles.compactInputContainer}
            onPress={() => setIsTextboxExpanded(true)}
          >
            <PenLine size={18} color={COLORS.text.muted} />
            <Text 
              style={[
                styles.compactInputText,
                responseText && styles.compactInputTextFilled
              ]}
              numberOfLines={2}
            >
              {responseText || 'Tap to write your thoughts...'}
            </Text>
          </Pressable>

          {/* Action Buttons - Redesigned */}
          <View style={styles.buttonContainer}>
            {/* Submit/Next Button - Pill shaped, left-center aligned */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!responseText.trim() || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleNextQuestion}
              disabled={!responseText.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.background.primary} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    {currentQuestionIndex === allQuestions.length - 1
                      ? 'Complete'
                      : 'Next'}
                  </Text>
                  <Send size={16} color={COLORS.background.primary} />
                </>
              )}
            </TouchableOpacity>

            {/* Hint Button - Circular, right aligned */}
            <View style={styles.hintButtonWrapper}>
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
                  <Lightbulb size={22} color={COLORS.accent.secondary} />
                )}
              </TouchableOpacity>
              <Text style={styles.hintButtonLabel}>Hint</Text>
            </View>
          </View>
        </ScrollView>

        {/* Floating Expanded Textbox Modal */}
        <Modal
          visible={isTextboxExpanded}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsTextboxExpanded(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.expandedModalContainer}
          >
            <Pressable 
              style={styles.expandedModalBackdrop}
              onPress={() => {
                Keyboard.dismiss();
                setIsTextboxExpanded(false);
              }}
            />
            <View style={styles.expandedTextboxWrapper}>
              <View style={styles.expandedHeader}>
                <Text style={styles.expandedTitle}>Your Thoughts</Text>
                <TouchableOpacity 
                  onPress={() => setIsTextboxExpanded(false)}
                  style={styles.closeButton}
                >
                  <X size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>
              <TextInput
                ref={textInputRef}
                style={styles.expandedTextarea}
                placeholder="Write your thoughts here..."
                placeholderTextColor={COLORS.text.muted}
                value={responseText}
                onChangeText={setResponseText}
                onFocus={() => setIsThinking(true)}
                onBlur={() => setIsThinking(false)}
                multiline
                autoFocus
                autoCapitalize="sentences"
                textAlignVertical="top"
              />
              <TouchableOpacity 
                style={styles.expandedDoneButton}
                onPress={() => setIsTextboxExpanded(false)}
              >
                <Text style={styles.expandedDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

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
    paddingTop: 0,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  nodeProgressContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
  },
  nodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  node: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border.default,
    zIndex: 1,
  },
  nodeOffset: {
    marginTop: 14,
  },
  nodeCompleted: {
    backgroundColor: COLORS.accent.primary,
  },
  nodeCurrent: {
    backgroundColor: COLORS.accent.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.accent.secondary,
  },
  nodeUpcoming: {
    backgroundColor: COLORS.border.default,
  },
  connectorWrapper: {
    width: 16,
    height: 28,
    justifyContent: 'center',
  },
  nodeConnectorDiagonal: {
    width: 18,
    height: 2,
    backgroundColor: COLORS.border.default,
    position: 'absolute',
  },
  connectorDown: {
    transform: [{ rotate: '35deg' }],
    top: 6,
  },
  connectorUp: {
    transform: [{ rotate: '-35deg' }],
    bottom: 6,
  },
  connectorCompleted: {
    backgroundColor: COLORS.accent.primary,
  },
  nodeCounter: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.text.muted,
    marginTop: 8,
  },
  challengeHeaderSection: {
    marginBottom: 24,
    paddingTop: 20,
  },
  challengeTitle: {
    fontSize: 26,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  challengeTopic: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 18,
    fontFamily: FONTS.body,
    fontWeight: '500',
    color: COLORS.text.secondary,
    lineHeight: 28,
    marginTop: 8,
  },
  compactInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    backgroundColor: COLORS.background.elevated,
    marginBottom: 20,
  },
  compactInputText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.body,
    color: COLORS.text.muted,
  },
  compactInputTextFilled: {
    color: COLORS.text.primary,
  },
  expandedModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  expandedTextboxWrapper: {
    width: Dimensions.get('window').width - 40,
    maxHeight: Dimensions.get('window').height * 0.6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  expandedTitle: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  expandedTextarea: {
    borderWidth: 2,
    borderColor: COLORS.accent.primary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.elevated,
    minHeight: 200,
    maxHeight: 300,
    textAlignVertical: 'top',
  },
  expandedDoneButton: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 12,
    backgroundColor: COLORS.accent.primary,
    borderRadius: 20,
  },
  expandedDoneText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.background.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  hintButtonWrapper: {
    alignItems: 'center',
  },
  hintButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.elevated,
    borderWidth: 2,
    borderColor: COLORS.accent.secondary,
  },
  hintButtonLabel: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: FONTS.body,
    color: COLORS.accent.secondary,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    backgroundColor: COLORS.accent.primary,
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: COLORS.background.primary,
    fontSize: 15,
    fontFamily: FONTS.body,
    fontWeight: '600',
    letterSpacing: 0.3,
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
