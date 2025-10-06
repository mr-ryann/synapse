import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { TopHeader } from '../components/navigation/TopHeader';

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
      <TopHeader />
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
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  rank: {
    width: 40,
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    fontSize: 14,
    color: '#6b7280',
  },
});
