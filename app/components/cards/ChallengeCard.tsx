import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { COLORS, FONTS } from '../../theme';

interface ChallengeCardProps {
  challenge: {
    $id: string;
    title: string;
    coreProvocation: string;
    topicName?: string;
    xpReward?: number;
  };
  onPress: () => void;
  buttonText?: string;
  isFeatured?: boolean;
}

export const ChallengeCard = React.memo<ChallengeCardProps>(({
  challenge,
  onPress,
  buttonText = 'Start Challenge',
  isFeatured = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        isFeatured && styles.featuredContainer,
      ]}
    >
      {isFeatured && (
        <View style={styles.featuredBadge}>
          <Sparkles size={16} color={COLORS.accent.primary} />
          <Text style={styles.featuredText}>Daily Provocation</Text>
        </View>
      )}
      
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.provocation} numberOfLines={3}>
        {challenge.coreProvocation}
      </Text>

      <View style={styles.footer}>
        {challenge.topicName && (
          <Text style={styles.topic}>{challenge.topicName}</Text>
        )}
        {challenge.xpReward && (
          <Text style={styles.xp}>+{challenge.xpReward} XP</Text>
        )}
      </View>

      <View style={styles.button}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </View>
    </TouchableOpacity>
  );
});

ChallengeCard.displayName = 'ChallengeCard';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.elevated,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredContainer: {
    borderColor: COLORS.accent.primary,
    borderWidth: 2,
    backgroundColor: COLORS.background.secondary,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent.primary,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  provocation: {
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  topic: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text.muted,
  },
  xp: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent.secondary,
  },
  button: {
    backgroundColor: COLORS.accent.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: FONTS.body,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.background.primary,
  },
});
