import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../stores/useUserStore';
import { functions } from '../../lib/appwrite';
import { ChallengeCard } from '../../components/cards/ChallengeCard';
import { COLORS, FONTS } from '../../theme';

export default function LibraryScreen() {
  const { user } = useUserStore();
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllChallenges();
    }
  }, [user]);

  const fetchAllChallenges = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const execution = await functions.createExecution(
        'getChallengeForUser',
        JSON.stringify({ userId: user.$id, mode: 'all' })
      );
      
      if (!execution.responseBody || execution.responseBody.trim() === '') {
        console.warn('Empty response from getChallengeForUser');
        return;
      }
      
      const result = JSON.parse(execution.responseBody);
      
      if (result.success) {
        setChallenges([{
          $id: result.data.id,
          promptText: result.data.promptText,
          topicName: result.data.topic,
          topicID: result.data.topicID,
          estimatedTime: result.data.estimatedTime,
          difficulty: result.data.difficulty,
          archetype: result.data.archetype,
          mutator: result.data.mutator,
        }]);
      } else {
        console.log('No challenges available:', result.error);
      }
    } catch (error) {
      console.error('Error fetching library challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToChallenge = (challengeId: string) => {
    router.push(`/challenge-player?challengeId=${challengeId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent.primary} />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.heading}>Library</Text>
          <Text style={styles.description}>
            Explore all available challenges across different topics
          </Text>
          
          {challenges.length > 0 ? (
            <View style={styles.challengesContainer}>
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.$id}
                  challenge={challenge}
                  onPress={() => navigateToChallenge(challenge.$id)}
                  buttonText="Start Challenge"
                  isFeatured={false}
                />
              ))}
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                No challenges available at the moment.
                Please check back later or select topics.
              </Text>
              <TouchableOpacity
                style={styles.selectTopicsButton}
                onPress={() => router.push('/topics')}
              >
                <Text style={styles.selectTopicsButtonText}>Select Topics</Text>
              </TouchableOpacity>
            </View>
          )}
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
  content: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  heading: {
    fontSize: 30,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    marginBottom: 8,
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
  challengesContainer: {
    gap: 16,
    marginTop: 8,
  },
  placeholder: {
    backgroundColor: COLORS.background.elevated,
    padding: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    marginTop: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  selectTopicsButton: {
    backgroundColor: COLORS.accent.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  selectTopicsButtonText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.background.primary,
  },
});
