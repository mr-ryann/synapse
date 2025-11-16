import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Clock, Target } from 'lucide-react-native';
import { COLORS, FONTS } from '../../theme';

interface StatsCardProps {
  stats: {
    streak: number;
    thinkingTime: number;
    challengesCompleted: number;
  };
}

export const StatsCard = React.memo<StatsCardProps>(({ stats }) => {
  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Flame size={24} color={COLORS.accent.primary} />
        <Text style={styles.statValue}>{stats.streak}</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statItem}>
        <Clock size={24} color={COLORS.accent.secondary} />
        <Text style={styles.statValue}>{stats.thinkingTime}</Text>
        <Text style={styles.statLabel}>Thinking Time</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statItem}>
        <Target size={24} color={COLORS.accent.tertiary} />
        <Text style={styles.statValue}>{stats.challengesCompleted}</Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
    </View>
  );
});

StatsCard.displayName = 'StatsCard';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.elevated,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border.default,
    marginHorizontal: 12,
  },
});
