import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../theme';

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
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  heading: {
    fontSize: 30,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  listContent: {
    paddingVertical: 8,
    gap: 16,
  },
  challengeCard: {
    padding: 20,
    backgroundColor: COLORS.background.elevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    gap: 10,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeType: {
    fontSize: 12,
    fontFamily: FONTS.body,
    fontWeight: '700',
    color: COLORS.accent.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  xpBadge: {
    fontSize: 12,
    fontFamily: FONTS.body,
    fontWeight: '700',
    color: COLORS.semantic.success,
  },
  challengeTitle: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    lineHeight: 26,
  },
  challengeTopic: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  difficulty: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    letterSpacing: 0.8,
  },
});
