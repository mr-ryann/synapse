import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useUserStore } from '../../stores/useUserStore';
import { useRouter } from 'expo-router';
import { databases, functions } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';

// Import components
import { ChallengeCard } from '../../components/cards/ChallengeCard';
import { COLORS, FONTS } from '../../theme';

export default function HomeScreen() {
  const { user } = useUserStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [inProgressChallenge, setInProgressChallenge] = useState<any>(null);
  const [dailyProvocation, setDailyProvocation] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHomeData();
    }
  }, [user]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      // Check for in-progress challenge
      try {
        const progressDocs = await databases.listDocuments(
          'synapse',
          'user_progress',
          [Query.equal('userId', user?.$id || ''), Query.limit(1)]
        );
        if (progressDocs.documents.length > 0) {
          const progressDoc = progressDocs.documents[0];
          const challengeDoc = await databases.getDocument(
            'synapse',
            'challenges',
            progressDoc.challengeId
          );
          setInProgressChallenge(challengeDoc);
        }
      } catch (err) {
        // No in-progress challenge
      }

      // Fetch recommended challenge from function
      try {
        const execution = await functions.createExecution(
          'getChallengeForUser',
          JSON.stringify({ userId: user?.$id, mode: 'recommended' })
        );
        
        if (!execution.responseBody || execution.responseBody.trim() === '') {
          return;
        }
        
        const result = JSON.parse(execution.responseBody);
        
        if (result.success) {
          const challengeData = {
            $id: result.data.id,
            promptText: result.data.promptText,
            topicName: result.data.topic,
            topicID: result.data.topicID,
            estimatedTime: result.data.estimatedTime,
            difficulty: result.data.difficulty,
          };
          setDailyProvocation(challengeData);
          
          // Check if user has already completed this challenge
          try {
            const historyCheck = await databases.listDocuments(
              'synapse',
              'user_challenge_history',
              [
                Query.equal('userId', user?.$id || ''),
                Query.equal('challengeId', result.data.id),
                Query.limit(1)
              ]
            );
            setIsCompleted(historyCheck.documents.length > 0);
          } catch {
            // Not completed
            setIsCompleted(false);
          }
        }
      } catch (err) {
        // Error fetching recommended challenge
      }

    } catch (error) {
      // Error fetching home data
    } finally {
      setLoading(false);
    }
  };

  const navigateToChallenge = (challengeId: string) => {
    router.push(`/challenge-player?challengeId=${challengeId}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Greeting */}
      <Text style={styles.greeting}>
        {getGreeting()}, {user?.name || 'Explorer'}.
      </Text>

      {/* Full-screen Challenge Card */}
      <View style={styles.challengeFullScreen}>
        {/* Priority: Show pending/in-progress challenge if exists */}
        {inProgressChallenge ? (
          <ChallengeCard
            challenge={inProgressChallenge}
            onPress={() => navigateToChallenge(inProgressChallenge.$id)}
            buttonText="Continue Thinking"
            isFeatured={true}
            fullScreen={true}
          />
        ) : (
          /* Otherwise show daily provocation */
          dailyProvocation && (
            <ChallengeCard
              challenge={dailyProvocation}
              onPress={() => navigateToChallenge(dailyProvocation.$id)}
              buttonText={isCompleted ? "Rethink This" : "Start Thinking"}
              isFeatured={true}
              fullScreen={true}
              isCompleted={isCompleted}
            />
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  greeting: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 16,
  },
  challengeFullScreen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
