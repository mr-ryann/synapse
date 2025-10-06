import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

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
      style={{
        padding: 16,
        margin: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
      }}
      onPress={() => router.push(`/challenge-player?id=${item.id}`)}
    >
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
      <Text>{item.topic} {item.subcategory && `- ${item.subcategory}`}</Text>
      <Text>Difficulty: {item.difficulty} | XP: {item.xpReward}</Text>
      <Text>Type: {item.type}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Challenges
      </Text>
      <FlatList
        data={mockChallenges}
        renderItem={renderChallenge}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
