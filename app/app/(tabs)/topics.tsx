import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { databases, account } from '../../lib/appwrite';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../../theme';

interface Topic {
  name: string;
  topicID: string;
  count: number;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75; // 75% of screen width for carousel effect

export default function Topics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        
        // Fetch all challenges and group by topicName to get unique topics with counts
        const challengesResponse = await databases.listDocuments('synapse', 'challenges');
        const challenges = challengesResponse.documents;
        
        // Group challenges by topicName and topicID, count them
        const topicMap = new Map<string, { topicID: string; count: number }>();
        challenges.forEach((challenge: any) => {
          const topicName = challenge.topicName;
          const topicID = challenge.topicID;
          if (topicName && topicID) {
            const existing = topicMap.get(topicName);
            topicMap.set(topicName, {
              topicID,
              count: (existing?.count || 0) + 1,
            });
          }
        });
        
        // Convert to Topic array
        const derivedTopics: Topic[] = Array.from(topicMap.entries()).map(([name, data]) => ({
          name,
          topicID: data.topicID,
          count: data.count,
        }));
        
        setTopics(derivedTopics);
      } catch (e) {
        Alert.alert('Error', 'Failed to load topics');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const selectTopicForChallenge = async (topicName: string, topicID: string) => {
    try {
      // Fetch all challenges for this topic
      const challengesResponse = await databases.listDocuments('synapse', 'challenges');
      const topicChallenges = challengesResponse.documents.filter(
        (c: any) => c.topicID === topicID
      );
      
      if (topicChallenges.length === 0) {
        Alert.alert('No Challenges', `No challenges available for ${topicName}.`);
        return;
      }
      
      // Pick a random challenge from this topic
      const randomChallenge = topicChallenges[Math.floor(Math.random() * topicChallenges.length)];
      
      // Navigate to challenge player with the challenge ID
      router.push(`/challenge-player?challengeId=${randomChallenge.$id}`);
    } catch (err) {
      console.error('Error loading challenge:', err);
      Alert.alert('Error', 'Failed to load challenge. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent.primary} />
        <Text style={styles.loadingText}>Loading topics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.heading}>Explore All Topics</Text>
          <Text style={styles.subtitle}>
            Browse challenges across different subjects and discover new ways of thinking
          </Text>
        </View>
        
        <View style={styles.carouselSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
          >
            {topics.map((item) => (
              <TouchableOpacity
                key={item.name}
                onPress={() => selectTopicForChallenge(item.name, item.topicID)}
                activeOpacity={0.85}
                style={styles.topicCard}
              >
                <Text style={styles.topicName}>
                  {item.name}
                </Text>
                <Text style={styles.topicCount}>
                  {item.count} {item.count === 1 ? 'challenge' : 'challenges'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    gap: 16,
  },
  loadingText: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 32,
    color: COLORS.text.primary,
    fontFamily: FONTS.heading,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontFamily: FONTS.body,
    lineHeight: 22,
  },
  carouselSection: {
    minHeight: 400,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingBottom: 100, // Extra space for bottom tab bar
  },
  carouselContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  topicCard: {
    width: CARD_WIDTH,
    padding: 32,
    backgroundColor: COLORS.background.elevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    gap: 16,
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 180,
    justifyContent: 'center',
  },
  topicName: {
    fontSize: 28,
    color: COLORS.text.primary,
    fontFamily: FONTS.heading,
    fontWeight: '600',
  },
  topicCount: {
    fontSize: 18,
    color: COLORS.text.secondary,
    fontFamily: FONTS.body,
  },
});
