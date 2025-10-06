import { useState, useEffect } from 'react';
import { View, Text, Button, Alert, Modal, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { functions, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../theme';

export default function Question() {
  const [question, setQuestion] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [showHintModal, setShowHintModal] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const router = useRouter();

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
          Alert.alert(
            'No More Questions',
            'You\'ve completed all available questions for your selected topics! Try selecting more topics or check back later for new challenges.',
            [{ text: 'Select More Topics', onPress: () => router.push('/topics') }]
          );
        } else {
          Alert.alert('Error', data.error);
        }
      }
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  const getHint = async () => {
    if (!question) return;
    setLoadingHint(true);
    try {
      const res = await functions.createExecution(
        'get-ai-hint',
        JSON.stringify({
          questionId: question.$id,
          userQuery: ''
        })
      );
      const data = JSON.parse(res.responseBody);
      if (data.success) {
        setHint(data.hint);
        setShowHintModal(true);
      } else {
        Alert.alert('Error', data.error || 'Failed to get hint');
      }
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
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
        Alert.alert('Thanks!', `Your ${feedbackType} feedback has been recorded.`);
      } else {
        Alert.alert('Error', data.error || 'Failed to submit feedback');
      }
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Question</Text>
      {question ? (
        <View>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>{question.questionText}</Text>
          
          {/* Feedback Buttons */}
          {!feedbackGiven && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackLabel}>Rate this question:</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity 
                  style={styles.feedbackButton}
                  onPress={() => submitFeedback('like')}
                >
                  <Text style={styles.feedbackEmoji}>👍</Text>
                  <Text style={styles.feedbackText}>Like</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.feedbackButton}
                  onPress={() => submitFeedback('dislike')}
                >
                  <Text style={styles.feedbackEmoji}>👎</Text>
                  <Text style={styles.feedbackText}>Dislike</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {feedbackGiven && (
            <Text style={styles.feedbackConfirm}>✓ Feedback recorded</Text>
          )}

          <View style={{ marginTop: 20, marginBottom: 10 }}>
            <Button 
              title={loadingHint ? "Loading Hint..." : "Get AI Hint"} 
              onPress={getHint}
              disabled={loadingHint}
            />
          </View>
          <Button 
            title="Submit Response" 
            onPress={() => router.push('/response?questionId=' + question.$id)} 
          />
        </View>
      ) : (
        <Button title="Get Question" onPress={getQuestion} />
      )}
      <Button title="Analytics" onPress={() => router.push('/analytics')} />

      {/* Hint Modal */}
      <Modal
        visible={showHintModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHintModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💡 AI Hint</Text>
            <Text style={styles.modalText}>{hint}</Text>
            <Button title="Close" onPress={() => setShowHintModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay.scrim,
  },
  modalContent: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 20,
    width: '86%',
    maxHeight: '72%',
    gap: 16,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
  },
  modalText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  feedbackContainer: {
    marginBottom: 20,
    padding: 18,
    backgroundColor: COLORS.background.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  feedbackLabel: {
    fontSize: 14,
    fontFamily: FONTS.body,
    marginBottom: 12,
    color: COLORS.text.primary,
    letterSpacing: 0.5,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  feedbackButton: {
    alignItems: 'center',
    padding: 10,
  },
  feedbackEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  feedbackText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  feedbackConfirm: {
    color: COLORS.semantic.success,
    fontFamily: FONTS.body,
    marginBottom: 15,
    textAlign: 'center',
  },
});
