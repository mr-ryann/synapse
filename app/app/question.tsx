import { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { functions, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { BackgroundPaths, ShimmerButton, TypewriterText, SkeletonLoader, RippleEffect, FloatingActionButton } from '../components/ui';
import { THEME } from '../theme';
import { useToast } from '../hooks/useToast';

export default function Question() {
  const [question, setQuestion] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [showHintModal, setShowHintModal] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const router = useRouter();
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

  const getQuestion = async () => {
    if (!user) return;
    try {
      const res = await functions.createExecution('get-question', JSON.stringify({ userId: user.$id }));
      const data = JSON.parse(res.responseBody);
      if (data.success) {
        setQuestion(data.question);
        setHint(null); // Reset hint for new question
        setFeedbackGiven(false); // Reset feedback state
        
        // Record question view for history tracking
        try {
          await functions.createExecution(
            'record-question-view', 
            JSON.stringify({ userId: user.$id, questionId: data.question.$id })
          );
        } catch (historyErr) {
          console.error('Failed to record question view:', historyErr);
        }
      } else {
        if (data.code === 'NO_MORE_QUESTIONS') {
          showToast('You\'ve completed all available questions! Try selecting more topics.', 'info');
          setTimeout(() => router.push('/topics'), 2000);
        } else {
          showToast(data.error || 'Failed to load question', 'error');
        }
      }
    } catch (e) {
      showToast((e as Error).message || 'Failed to load question', 'error');
    }
  };

  const getHint = async () => {
    if (!question) return;
    setLoadingHint(true);
    try {
      const res = await functions.createExecution(
        'get-ai-hint',
        JSON.stringify({ 
          questionText: question.questionText,
          userId: user.$id 
        })
      );
      const data = JSON.parse(res.responseBody);
      if (data.success) {
        setHint(data.hint);
        setShowHintModal(true);
      } else {
        showToast(data.error || 'Failed to get hint', 'error');
      }
    } catch (e) {
      showToast((e as Error).message || 'Failed to get hint', 'error');
    } finally {
      setLoadingHint(false);
    }
  };

  const submitFeedback = async (feedbackType: 'like' | 'dislike') => {
    if (!question || !user) return;
    try {
      const res = await functions.createExecution(
        'submit-feedback',
        JSON.stringify({
          userId: user.$id,
          questionId: question.$id,
          feedbackType: feedbackType
        })
      );
      const data = JSON.parse(res.responseBody);
      if (data.success) {
        setFeedbackGiven(true);
        showToast(`Thanks! Your ${feedbackType} feedback has been recorded. 👍`, 'success');
      } else {
        showToast(data.error || 'Failed to submit feedback', 'error');
      }
    } catch (e) {
      showToast((e as Error).message || 'Failed to submit feedback', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Background */}
      <BackgroundPaths opacity={0.08} />

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {question ? (
          <View style={styles.questionContainer}>
            {/* Question Card */}
            <View style={styles.questionCard}>
              <Text style={styles.questionTitle}>Question</Text>
              <Text style={styles.questionText}>{question.questionText}</Text>
            </View>

            {/* Feedback Section */}
            {!feedbackGiven ? (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackLabel}>Rate this question:</Text>
                <View style={styles.feedbackButtons}>
                  <RippleEffect onPress={() => submitFeedback('like')}>
                    <View style={styles.feedbackButton}>
                      <Text style={styles.feedbackEmoji}>👍</Text>
                      <Text style={styles.feedbackText}>Like</Text>
                    </View>
                  </RippleEffect>
                  <RippleEffect onPress={() => submitFeedback('dislike')}>
                    <View style={styles.feedbackButton}>
                      <Text style={styles.feedbackEmoji}>👎</Text>
                      <Text style={styles.feedbackText}>Dislike</Text>
                    </View>
                  </RippleEffect>
                </View>
              </View>
            ) : (
              <View style={styles.feedbackConfirm}>
                <Text style={styles.feedbackConfirmText}>✓ Feedback recorded</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <ShimmerButton
                onPress={getHint}
                disabled={loadingHint}
                variant="secondary"
                style={styles.hintButton}
              >
                {loadingHint ? 'Loading Hint...' : '💡 Get AI Hint'}
              </ShimmerButton>

              <ShimmerButton
                onPress={() => router.push('/response?questionId=' + question.$id)}
                variant="primary"
              >
                Submit Response
              </ShimmerButton>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Ready for a Challenge?</Text>
            <Text style={styles.emptySubtitle}>
              Get a curated question based on your interests
            </Text>
            <ShimmerButton onPress={getQuestion} variant="primary">
              Get Question
            </ShimmerButton>
          </View>
        )}

        {/* Analytics Button */}
        <TouchableOpacity
          onPress={() => router.push('/analytics')}
          style={styles.analyticsButton}
        >
          <Text style={styles.analyticsButtonText}>📊 View Analytics</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Hint Modal */}
      <Modal
        visible={showHintModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHintModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💡 AI Hint</Text>
            <ScrollView style={styles.modalScroll}>
              {hint && (
                <TypewriterText
                  text={hint}
                  speed={30}
                  style={styles.modalText}
                  showCursor={false}
                />
              )}
            </ScrollView>
            <ShimmerButton
              onPress={() => setShowHintModal(false)}
              variant="primary"
              style={styles.modalButton}
            >
              Got it!
            </ShimmerButton>
          </View>
        </View>
      </Modal>
      
      {/* Floating Action Button for quick "Next Question" */}
      {question && (
        <FloatingActionButton
          icon="→"
          onPress={getQuestion}
          position="bottom-right"
        />
      )}
      
      {ToastComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.dark.bg,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  questionContainer: {
    flex: 1,
  },
  questionCard: {
    backgroundColor: `${THEME.neutral[900]}`,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${THEME.primary[500]}30`,
  },
  questionTitle: {
    fontSize: 14,
    color: THEME.primary[400],
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 20,
    color: THEME.neutral.white,
    lineHeight: 30,
    fontWeight: '600',
  },
  feedbackContainer: {
    backgroundColor: `${THEME.neutral[800]}`,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: THEME.neutral[300],
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  feedbackButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: `${THEME.neutral[700]}`,
    borderRadius: 12,
    flex: 1,
  },
  feedbackEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  feedbackText: {
    fontSize: 13,
    color: THEME.neutral[300],
    fontWeight: '600',
  },
  feedbackConfirm: {
    backgroundColor: `${THEME.success[500]}20`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  feedbackConfirmText: {
    color: THEME.success[400],
    fontWeight: '700',
    fontSize: 15,
  },
  actions: {
    gap: 12,
  },
  hintButton: {
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.neutral.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: THEME.neutral[400],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 40,
  },
  analyticsButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: `${THEME.neutral[800]}`,
    alignItems: 'center',
  },
  analyticsButtonText: {
    color: THEME.neutral[300],
    fontSize: 15,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.dark.surface,
    padding: 24,
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: `${THEME.primary[500]}40`,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
    color: THEME.neutral.white,
  },
  modalScroll: {
    maxHeight: 300,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 26,
    color: THEME.neutral[200],
  },
  modalButton: {
    marginTop: 8,
  },
});
