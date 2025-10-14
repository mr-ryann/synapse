import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BackButton } from '../../components/navigation/BackButton';
import { databases, account, functions } from '../../lib/appwrite';
import { COLORS, FONTS } from '../../theme';

interface Challenge {
  $id: string;
  title: string;
  coreProvocation: string;
  aiSocraticHint: string;
  topicName: string;
}

export default function ChallengePlayer() {
  const router = useRouter();
  const { topicName } = useLocalSearchParams();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await account.get();
        setUser(userData);

        // Fetch challenges for the selected topic
        const challengesResponse = await databases.listDocuments('synapse', 'challenges');
        const allChallenges = challengesResponse.documents as any[];
        
        // Filter challenges by topicName
        const topicChallenges = allChallenges.filter((challenge: any) => 
          challenge.topicName === topicName
        );
        
        setChallenges(topicChallenges);
        setLoading(false);
      } catch (error) {
        console.error('Error loading challenges:', error);
        Alert.alert('Error', 'Failed to load challenges');
        router.back();
      }
    };
    
    if (topicName) {
      init();
    }
  }, [topicName]);

  const currentChallenge = challenges[currentChallengeIndex];

  const handleNext = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(currentChallengeIndex + 1);
      setUserAnswer('');
    } else {
      // All challenges completed
      Alert.alert('Congratulations!', 'You have completed all challenges for this topic.', [
        { text: 'Back to Topics', onPress: () => router.push('/topics') }
      ]);
    }
  };

  const handleHint = async () => {
    if (!currentChallenge) return;

    try {
      const hintResponse = await functions.createExecution('get-ai-hint', JSON.stringify({
        questionId: currentChallenge.$id,
        userQuery: userAnswer || 'I need a hint'
      }));
      
      const result = JSON.parse(hintResponse.responseBody);
      if (result.success) {
        Alert.alert('AI Hint', result.data.hint);
      } else {
        Alert.alert('Error', result.error || 'Failed to get hint');
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      Alert.alert('Error', 'Failed to get AI hint');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      </View>
    );
  }

  if (!currentChallenge) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No challenges found for this topic.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to Topics</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.progress}>
          Challenge {currentChallengeIndex + 1} of {challenges.length}
        </Text>
        <Text style={styles.topicLabel}>{topicName}</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.inner}>
          <View style={styles.challengeSection}>
            <Text style={styles.challengeTitle}>{currentChallenge.title}</Text>
            <Text style={styles.challengeContent}>{currentChallenge.coreProvocation}</Text>
            
            <TextInput
              style={styles.answerInput}
              placeholder="Write your answer here..."
              placeholderTextColor={COLORS.text.muted}
              value={userAnswer}
              onChangeText={setUserAnswer}
              multiline
              textAlignVertical="top"
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.hintButton} onPress={handleHint}>
                <Text style={styles.hintButtonText}>Get AI Hint</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.nextButton, !userAnswer.trim() && styles.nextButtonDisabled]} 
                onPress={handleNext}
                disabled={!userAnswer.trim()}
              >
                <Text style={styles.nextButtonText}>
                  {currentChallengeIndex < challenges.length - 1 ? 'Next Challenge' : 'Complete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    backgroundColor: COLORS.background.secondary,
  },
  progress: {
    fontSize: 14,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  topicLabel: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.accent.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: COLORS.background.elevated,
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  challengeSection: {
    gap: 20,
  },
  challengeTitle: {
    fontSize: 28,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    lineHeight: 34,
  },
  challengeContent: {
    fontSize: 18,
    fontFamily: FONTS.body,
    color: COLORS.text.primary,
    lineHeight: 26,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.elevated,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  hintButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.background.elevated,
    borderWidth: 1,
    borderColor: COLORS.accent.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintButtonText: {
    color: COLORS.accent.secondary,
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.border.default,
    shadowOpacity: 0,
  },
  nextButtonText: {
    color: COLORS.background.primary,
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
