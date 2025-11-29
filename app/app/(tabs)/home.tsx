import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../stores/useUserStore';
import { useRouter } from 'expo-router';
import { databases, functions } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';

// Import components
import { ChallengeCard } from '../../components/cards/ChallengeCard';
import { InfiniteMarquee } from '../../components/ui/InfiniteMarquee';
import { COLORS, FONTS } from '../../theme';

// Fallback topics for marquee - can be fetched from backend later
const DISCOVERY_TOPICS = [
  'Systems Thinking',
  'Game Theory', 
  'Stoicism',
  'Logic',
  'Ethics',
  'Psychology',
  'Mental Models',
  'Fallacies',
  'Philosophy',
  'Bias Mitigation',
];

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
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.accent.primary} />
      </SafeAreaView>
    );
  }

  const hasPendingChallenge = !!inProgressChallenge;

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Hero Section - 65% */}
      <View style={styles.heroSection}>
        {/* Greeting */}
        <Text style={styles.greeting}>
          {getGreeting()}, {user?.name || 'Explorer'}.
        </Text>

        {/* Challenge Card - Centered */}
        <View style={styles.cardContainer}>
          {inProgressChallenge ? (
            <ChallengeCard
              challenge={inProgressChallenge}
              onPress={() => navigateToChallenge(inProgressChallenge.$id)}
              buttonText="Continue Thinking"
              isFeatured={true}
            />
          ) : (
            dailyProvocation && (
              <ChallengeCard
                challenge={dailyProvocation}
                onPress={() => navigateToChallenge(dailyProvocation.$id)}
                buttonText={isCompleted ? "Rethink This" : "Start Thinking"}
                isFeatured={true}
                isCompleted={isCompleted}
              />
            )
          )}
        </View>
      </View>

      {/* Discovery Section - 35% */}
      <View style={styles.discoverySection}>
        {hasPendingChallenge ? (
          /* User Stats when there's a pending challenge */
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.xp || 0}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.level || 1}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.streak || 0}</Text>
              <Text style={styles.statLabel}>Streak 🔥</Text>
            </View>
          </View>
        ) : (
          /* Infinite Marquee when no pending challenge */
          <View style={styles.marqueeContainer}>
            <View style={styles.discoverPill}>
              <Text style={styles.discoverLabel}>DISCOVER</Text>
            </View>
            <View style={styles.marqueeRows}>
              {/* Row 1 - Normal speed, left */}
              <InfiniteMarquee
                items={DISCOVERY_TOPICS.slice(0, 5)}
                speed={35000}
                reverse={false}
                fontSize={13}
              />
              {/* Row 2 - Slower, right (reverse) */}
              <InfiniteMarquee
                items={DISCOVERY_TOPICS.slice(5)}
                speed={40000}
                reverse={true}
                fontSize={13}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    paddingHorizontal: 8,
    marginTop: 0,
    marginBottom: 12,
  },
  heroSection: {
    flex: 0.65,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 24,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  discoverySection: {
    flex: 0.35,
    paddingTop: 16,
    // justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.background.secondary,
    marginHorizontal: 16,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.text.secondary,
    opacity: 0.3,
  },
  marqueeContainer: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  discoverPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(240, 238, 231, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(240, 238, 231, 0.15)',
  },
  discoverLabel: {
    fontFamily: FONTS.heading,
    fontSize: 11,
    fontWeight: '600',
    color: '#F0EEE7',
    letterSpacing: 3,
    opacity: 0.8,
  },
  marqueeRows: {
    gap: 12,
  },
});
