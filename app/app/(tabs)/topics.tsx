import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { databases, account } from '../../lib/appwrite';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../../theme';

interface Topic {
  name: string;
  count: number;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75; // 75% of screen width for carousel effect

export default function Topics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        // Load selected topics from user profile
        const userDoc = await databases.getDocument('synapse', 'users', userData.$id);
        setSelectedTopics(userDoc.selectedTopics || []);
        
        // Fetch all challenges and group by topicName to get unique topics with counts
        const challengesResponse = await databases.listDocuments('synapse', 'challenges');
        const challenges = challengesResponse.documents;
        
        // Group challenges by topicName and count them
        const topicMap = new Map<string, number>();
        challenges.forEach((challenge: any) => {
          const topicName = challenge.topicName;
          if (topicName) {
            topicMap.set(topicName, (topicMap.get(topicName) || 0) + 1);
          }
        });
        
        // Convert to Topic array
        const derivedTopics: Topic[] = Array.from(topicMap.entries()).map(([name, count]) => ({
          name,
          count,
        }));
        
        setTopics(derivedTopics);
      } catch (e) {
        router.push('/login');
      }
    };
    init();
  }, []);

  const toggleTopic = async (topicName: string) => {
    const newSelected = selectedTopics.includes(topicName)
      ? selectedTopics.filter(name => name !== topicName)
      : [...selectedTopics, topicName];
    setSelectedTopics(newSelected);
    try {
      await databases.updateDocument('synapse', 'users', user.$id, {
        selectedTopics: newSelected
      });
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  const selectTopicForChallenge = (topicName: string) => {
    // Navigate to challenge player with selected topic
    router.push({
      pathname: '/(tabs)/challenge-player',
      params: { topicName }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.heading}>Choose a Topic</Text>
          <Text style={styles.subtitle}>
            Select a topic to start your critical thinking challenge
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
                onPress={() => selectTopicForChallenge(item.name)}
                activeOpacity={0.85}
                style={styles.topicCard}
              >
                <Text style={styles.topicName}>
                  {item.name}
                </Text>
                <Text style={styles.topicCount}>
                  {item.count} challenges
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
