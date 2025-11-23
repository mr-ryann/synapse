import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
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
  const [stats, setStats] = useState({ streak: 0, thinkingTime: 0, challengesCompleted: 0 });
  const [inProgressChallenge, setInProgressChallenge] = useState<any>(null);
  const [dailyProvocation, setDailyProvocation] = useState<any>(null);
  const [topics, setTopics] = useState<Array<{ name: string; count: number }>>([]);

  useEffect(() => {
    if (user) {
      fetchHomeData();
    }
  }, [user]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      // Fetch user stats (from database or analytics)
      const userStats = {
        streak: user?.streak || 0,
        thinkingTime: 120, // Mock data - calculate from responses
        challengesCompleted: 10, // Mock data - count from history
      };
      setStats(userStats);

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
        console.log('🔵 Fetching recommended challenge for user:', user?.$id);
        const execution = await functions.createExecution(
          'getChallengeForUser',
          JSON.stringify({ userId: user?.$id, mode: 'recommended' })
        );
        
        console.log('🔵 Function execution status:', execution.status);
        console.log('🔵 Function response body:', execution.responseBody);
        
        if (!execution.responseBody || execution.responseBody.trim() === '') {
          console.warn('⚠️ Empty response from getChallengeForUser');
          return;
        }
        
        const result = JSON.parse(execution.responseBody);
        console.log('🔵 Parsed result:', result);
        
        if (result.success) {
          console.log('✅ Recommended challenge loaded:', result.data);
          setDailyProvocation({
            $id: result.data.id,
            promptText: result.data.promptText,
            topicName: result.data.topic,
            topicID: result.data.topicID,
            estimatedTime: result.data.estimatedTime,
            difficulty: result.data.difficulty,
          });
        } else {
          console.warn('⚠️ Function returned error:', result.error);
        }
      } catch (err) {
        console.error('❌ Error fetching recommended challenge:', err);
        console.error('❌ Error details:', JSON.stringify(err, null, 2));
      }

      // Fetch topics with challenge counts
      try {
        const topicDocs = await databases.listDocuments('synapse', 'topics');
        const topicsWithCounts = await Promise.all(
          topicDocs.documents.slice(0, 5).map(async (topic: any) => {
            const challengeCount = await databases.listDocuments(
              'synapse',
              'challenges',
              [Query.equal('topicName', topic.name), Query.limit(1)]
            );
            return {
              name: topic.name,
              count: challengeCount.total || 0,
            };
          })
        );
        setTopics(topicsWithCounts);
      } catch (err) {
        // Error fetching topics
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

  const navigateToTopic = (topicName: string) => {
    router.push(`/search?topic=${topicName}`);
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Greeting */}
        <Text style={styles.greeting}>
          {getGreeting()}, {user?.name || 'Explorer'}.
        </Text>

        {/* Challenge Cards - Dynamic Layout */}
        <View style={styles.challengesContainer}>
          {/* Resume In-Progress Challenge (Priority) */}
          {inProgressChallenge && (
            <ChallengeCard
              challenge={inProgressChallenge}
              onPress={() => navigateToChallenge(inProgressChallenge.$id)}
              buttonText="Continue Thinking"
              isFeatured={true}
            />
          )}

          {/* Daily Provocation - Takes full space if no in-progress challenge */}
          {dailyProvocation && (
            <ChallengeCard
              challenge={dailyProvocation}
              onPress={() => navigateToChallenge(dailyProvocation.$id)}
              buttonText={inProgressChallenge ? "New Challenge" : "Start Thinking"}
              isFeatured={!inProgressChallenge}
            />
          )}
        </View>
      </ScrollView>

      {/* Explore More Topics Card at Bottom */}
      <TouchableOpacity
        style={styles.exploreCard}
        onPress={() => router.push('/topics')}
        activeOpacity={0.8}
      >
        <View style={styles.exploreContent}>
          <Text style={styles.exploreTitle}>Explore More Topics</Text>
          <Text style={styles.exploreSubtitle}>
            Discover new challenges across different subjects
          </Text>
        </View>
        <Text style={styles.exploreArrow}>→</Text>
      </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  greeting: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 24,
  },
  challengesContainer: {
    gap: 16,
  },
  exploreCard: {
    backgroundColor: COLORS.background.elevated,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border.default,
    margin: 16,
    marginTop: 0,
  },
  exploreContent: {
    flex: 1,
  },
  exploreTitle: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  exploreSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  exploreArrow: {
    fontSize: 32,
    color: COLORS.accent.primary,
    marginLeft: 16,
  },
});
