import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { functions, account } from '../lib/appwrite';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BackgroundPaths, ShimmerButton, GlassmorphicInput, ConfettiCelebration } from '../components/ui';
import { THEME } from '../theme';
import { useToast } from '../hooks/useToast';

export default function Response() {
  const [responseText, setResponseText] = useState('');
  const [thinkingTime, setThinkingTime] = useState('60');
  const [user, setUser] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  const { questionId } = useLocalSearchParams();
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
      } catch (e) {
        router.push('/login');
      }
    };
    checkUser();
  }, []);

  const submitResponse = async () => {
    if (!user || !questionId) return;
    try {
      const res = await functions.createExecution('submit-response', JSON.stringify({
        userId: user.$id,
        questionId,
        responseText,
        thinkingTime: parseInt(thinkingTime)
      }));
      const data = JSON.parse(res.responseBody);
      if (data.success) {
        // Show confetti celebration
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
        
        showToast('Response submitted! 🎉', 'success');
        
        // Navigate after a short delay to let confetti play
        setTimeout(() => router.push('/question'), 1500);
      } else {
        showToast(data.error || 'Failed to submit response', 'error');
      }
    } catch (e) {
      showToast((e as Error).message || 'Failed to submit response', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Background */}
      <BackgroundPaths opacity={0.08} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Submit Your Response</Text>
            <Text style={styles.subtitle}>
              Share your thoughts and approach to the question
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Your Response</Text>
            <TextInput
              placeholder="Write your detailed response here..."
              value={responseText}
              onChangeText={setResponseText}
              multiline
              numberOfLines={8}
              style={styles.responseInput}
              placeholderTextColor={THEME.neutral[500]}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Thinking Time</Text>
            <GlassmorphicInput
              placeholder="Seconds spent thinking"
              value={thinkingTime}
              onChangeText={setThinkingTime}
              keyboardType="numeric"
              style={styles.timeInput}
            />

            <ShimmerButton
              onPress={submitResponse}
              variant="primary"
              style={styles.submitButton}
            >
              Submit Response
            </ShimmerButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {showConfetti && <ConfettiCelebration />}
      {ToastComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.dark.bg,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.neutral.white,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: THEME.neutral[400],
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.neutral[300],
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  responseInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginBottom: 24,
    fontSize: 16,
    color: THEME.neutral.white,
    fontWeight: '500',
    minHeight: 180,
  },
  timeInput: {
    marginBottom: 32,
  },
  submitButton: {
    marginTop: 'auto',
  },
});
