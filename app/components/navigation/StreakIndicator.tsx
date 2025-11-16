import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useUserStore } from '../../stores/useUserStore';
import { COLORS, FONTS } from '../../theme';

export const StreakIndicator = React.memo(() => {
  const user = useUserStore((state) => state.user);
  const currentStreak = user?.currentStreak ?? 0;

  if (currentStreak === 0) return null;

  return (
    <View style={styles.container}>
      <Flame size={16} color={COLORS.background.primary} />
      <Text style={styles.text}>{currentStreak}</Text>
    </View>
  );
});

StreakIndicator.displayName = 'StreakIndicator';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    gap: 4,
  },
  text: {
    color: COLORS.background.primary,
    fontWeight: '700',
    fontFamily: FONTS.body,
    fontSize: 14,
  },
});
