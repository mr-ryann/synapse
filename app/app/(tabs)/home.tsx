import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useUserStore } from '../../stores/useUserStore';
import { useRouter } from 'expo-router';
import { databases, functions } from '../../lib/appwrite';
import { Query } from 'appwrite';

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

      // Fetch daily provocation (random challenge from user's topics)
      try {
        const selectedTopics = user?.selectedTopics || [];
        if (selectedTopics.length > 0) {
          const challengeDocs = await databases.listDocuments(
            'synapse',
            'challenges',
            [
              Query.equal('topicName', selectedTopics),
              Query.limit(1),
            ]
          );
          if (challengeDocs.documents.length > 0) {
            setDailyProvocation(challengeDocs.documents[0]);
          }
        }
      } catch (err) {
        // Error fetching daily provocation
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

        {/* Challenge Cards at Top */}
        <View style={styles.challengesContainer}>
          {/* Challenge of the Day */}
          {dailyProvocation && (
            <ChallengeCard
              challenge={dailyProvocation}
              onPress={() => navigateToChallenge(dailyProvocation.$id)}
              buttonText="Start Thinking"
              isFeatured={true}
            />
          )}

          {/* Resume Last Thought - Only if in progress challenge exists */}
          {inProgressChallenge && (
            <ChallengeCard
              challenge={inProgressChallenge}
              onPress={() => navigateToChallenge(inProgressChallenge.$id)}
              buttonText="Continue Thinking"
              isFeatured={false}
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
    padding: 16,
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
