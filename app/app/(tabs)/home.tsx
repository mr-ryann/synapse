import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../stores/useUserStore';
import { useRouter } from 'expo-router';
import { databases, functions } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { Compass } from 'lucide-react-native';

// Import components
import { ChallengeCard } from '../../components/cards/ChallengeCard';
import { InfiniteMarquee } from '../../components/ui/InfiniteMarquee';
import { COLORS, FONTS } from '../../theme';

// Fallback topics for marquee
const FALLBACK_TOPICS = [
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
  const [topics, setTopics] = useState<string[]>(FALLBACK_TOPICS);

  useEffect(() => {
    if (user) {
      fetchHomeData();
      fetchTopics();
    }
  }, [user]);

  const fetchTopics = async () => {
    try {
      const topicsRes = await databases.listDocuments(
        'synapse',
        'topics',
        [Query.limit(80)]
      );
      
      if (topicsRes.documents.length > 0) {
        const topicNames = topicsRes.documents.map((doc: any) => doc.name);
        setTopics(topicNames);
        console.log('Fetched topics:', topicNames);
      }
    } catch (err) {
      console.log('Error fetching topics, using fallback:', err);
    }
  };

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      console.log('Fetching home data for user:', user?.$id);

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
        console.log('No in-progress challenge or error:', err);
      }

      // Fetch recommended challenge from function
      try {
        console.log('Calling getChallengeForUser function...');
        const execution = await functions.createExecution(
          'getChallengeForUser',
          JSON.stringify({ userId: user?.$id, mode: 'recommended' })
        );
        
        console.log('Function response:', execution.responseBody);
        
        if (!execution.responseBody || execution.responseBody.trim() === '') {
          console.log('Empty response from function, trying direct database fetch...');
          throw new Error('Empty response');
        }
        
        const result = JSON.parse(execution.responseBody);
        
        if (result.success) {
          const challengeData = {
            $id: result.data.id,
            title: result.data.title,
            promptText: result.data.promptText,
            topicName: result.data.topic,
            topicID: result.data.topicID,
            xpReward: result.data.xpReward || 15,
            estimatedTime: result.data.estimatedTime,
            difficulty: result.data.difficulty,
          };
          console.log('Challenge data:', challengeData);
          setDailyProvocation(challengeData);
          
          // Check if user has already completed this challenge
          try {
            const responseDoc = await databases.getDocument(
              'synapse',
              'responses',
              `${user?.$id}_${result.data.id}`
            );
            setIsCompleted(true);
            console.log('Challenge already completed');
          } catch {
            // Not completed
            setIsCompleted(false);
          }
        } else {
          console.log('Function returned error:', result.error);
          throw new Error(result.error);
        }
      } catch (err) {
        console.log('Function failed, fetching directly from database:', err);
        // Fallback: fetch a random challenge directly from database
        try {
          const challengesRes = await databases.listDocuments(
            'synapse',
            'challenges',
            [Query.limit(10)]
          );
          
          if (challengesRes.documents.length > 0) {
            const randomIndex = Math.floor(Math.random() * challengesRes.documents.length);
            const challenge = challengesRes.documents[randomIndex];
            console.log('Fetched challenge from DB:', challenge);
            
            const challengeData = {
              $id: challenge.$id,
              title: challenge.title,
              promptText: challenge.promptText,
              topicName: challenge.topicName,
              topicID: challenge.topicID,
              xpReward: challenge.xpReward || 15,
              difficulty: challenge.difficulty || 1,
            };
            setDailyProvocation(challengeData);
            
            // Check completion
            try {
              await databases.getDocument(
                'synapse',
                'responses',
                `${user?.$id}_${challenge.$id}`
              );
              setIsCompleted(true);
            } catch {
              setIsCompleted(false);
            }
          }
        } catch (dbErr) {
          console.log('Direct database fetch also failed:', dbErr);
        }
      }

    } catch (error) {
      console.log('Error fetching home data:', error);
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
              buttonText="Continue"
              isFeatured={true}
            />
          ) : (
            dailyProvocation && (
              <ChallengeCard
                challenge={dailyProvocation}
                onPress={() => navigateToChallenge(dailyProvocation.$id)}
                buttonText={isCompleted ? "Retry" : "Start"}
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
              <Compass size={16} color="#F0EEE7" strokeWidth={2.5} style={{ opacity: 0.8 }} />
              <Text style={styles.discoverLabel}>DISCOVER</Text>
            </View>
            <View style={styles.marqueeRows}>
              {/* Row 1 - Normal speed, left */}
              <InfiniteMarquee
                items={topics.slice(0, Math.ceil(topics.length / 2))}
                speed={18}
                reverse={false}
                fontSize={12}
              />
              {/* Row 2 - Slower, right (reverse) */}
              <InfiniteMarquee
                items={topics.slice(Math.ceil(topics.length / 2))}
                speed={15}
                reverse={true}
                fontSize={12}
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
    flex: 0.55,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 24,
    paddingBottom: 0,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  discoverySection: {
    flex: 0.45,
    paddingTop: 0,
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
    justifyContent: 'flex-start',
    paddingTop: 48,
    overflow: 'hidden',
  },
  discoverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 12,
    gap: 8,
  },
  discoverLabel: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    fontWeight: '700',
    color: '#F0EEE7',
    letterSpacing: 3,
    opacity: 0.8,
  },
  marqueeRows: {
    gap: 12,
  },
});
