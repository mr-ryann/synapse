import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TopHeader } from '../components/navigation/TopHeader';

interface Challenge {
  id: string;
  type: 'quest' | 'pop';
  title: string;
  topic: string;
  subcategory?: string;
  difficulty: number;
  xpReward: number;
}

// Mock data for testing
const mockChallenges: Challenge[] = [
  {
    id: '1',
    type: 'quest',
    title: 'Philosophy Quest: The Meaning of Life',
    topic: 'Philosophy',
    subcategory: 'Ethics',
    difficulty: 3,
    xpReward: 100,
  },
  {
    id: '2',
    type: 'pop',
    title: 'Quick Pop: Consciousness',
    topic: 'Philosophy',
    subcategory: 'Neuroscience',
    difficulty: 2,
    xpReward: 50,
  },
];

export default function ChallengeList() {
  const router = useRouter();

  const renderChallenge = ({ item }: { item: Challenge }) => (
    <TouchableOpacity
      style={styles.challengeCard}
      onPress={() => router.push(`/challenge-player?id=${item.id}`)}
    >
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeType}>{item.type.toUpperCase()}</Text>
        <Text style={styles.xpBadge}>+{item.xpReward} XP</Text>
      </View>
      <Text style={styles.challengeTitle}>{item.title}</Text>
      <Text style={styles.challengeTopic}>
        {item.topic} {item.subcategory && `• ${item.subcategory}`}
      </Text>
      <Text style={styles.difficulty}>
        {'⭐'.repeat(item.difficulty)} Difficulty: {item.difficulty}/5
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopHeader />
      <View style={styles.content}>
        <Text style={styles.heading}>Challenges</Text>
        <Text style={styles.subtitle}>Select a challenge to begin</Text>
        <FlatList
          data={mockChallenges}
          renderItem={renderChallenge}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  challengeCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3b82f6',
    textTransform: 'uppercase',
  },
  xpBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f97316',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  challengeTopic: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  difficulty: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
