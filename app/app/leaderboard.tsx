import React from 'react';
import { View, Text, FlatList } from 'react-native';

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
    <View
      style={{
        flexDirection: 'row',
        padding: 16,
        margin: 4,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
      }}
    >
      <Text style={{ width: 30, fontWeight: 'bold' }}>#{index + 1}</Text>
      <Text style={{ flex: 1 }}>{item.name}</Text>
      <Text>XP: {item.xp}</Text>
      <Text>Lvl: {item.level}</Text>
      <Text>Streak: {item.streak}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Leaderboard
      </Text>
      <FlatList
        data={mockLeaderboard}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
