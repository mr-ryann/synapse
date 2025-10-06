import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../theme';

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
}

// Mock data for testing
const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', name: 'Alice', xp: 1500, level: 5, streak: 10 },
  { id: '2', name: 'Bob', xp: 1200, level: 4, streak: 8 },
  { id: '3', name: 'Charlie', xp: 1000, level: 3, streak: 5 },
];

export default function Leaderboard() {
  const renderEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <View style={styles.entryCard}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.stats}>
        <Text style={styles.stat}>XP: {item.xp}</Text>
        <Text style={styles.stat}>Lvl: {item.level}</Text>
        <Text style={styles.stat}>🔥 {item.streak}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Leaderboard</Text>
        <FlatList
          data={mockLeaderboard}
          renderItem={renderEntry}
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
    gap: 16,
  },
  heading: {
    fontSize: 30,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
  },
  listContent: {
    paddingVertical: 8,
    gap: 14,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background.elevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  rank: {
    width: 48,
    fontSize: 22,
    fontFamily: FONTS.heading,
    color: COLORS.accent.primary,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
});
