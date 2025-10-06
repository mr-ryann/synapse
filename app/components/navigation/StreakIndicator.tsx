import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useUserStore } from '../../stores/useUserStore';

export const StreakIndicator = React.memo(() => {
  const user = useUserStore((state) => state.user);
  const currentStreak = user?.currentStreak ?? 0;

  if (currentStreak === 0) return null;

  return (
    <View style={styles.container}>
      <Flame size={16} color="#ffffff" />
      <Text style={styles.text}>{currentStreak}</Text>
    </View>
  );
});

StreakIndicator.displayName = 'StreakIndicator';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f97316',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    gap: 4,
  },
  text: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
