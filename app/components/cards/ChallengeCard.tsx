import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { COLORS, FONTS } from '../../theme';

interface ChallengeCardProps {
  challenge: {
    $id: string;
    title?: string;
    coreProvocation?: string;
    promptText?: string;
    topicName?: string;
    xpReward?: number;
  };
  onPress: () => void;
  buttonText?: string;
  isFeatured?: boolean;
  fullScreen?: boolean;
  isCompleted?: boolean;
}

export const ChallengeCard = React.memo<ChallengeCardProps>(({
  challenge,
  onPress,
  buttonText = 'Start Challenge',
  isFeatured = false,
  fullScreen = false,
  isCompleted = false,
}) => {
  // Support both coreProvocation and promptText for compatibility
  const provocationText = challenge.coreProvocation || challenge.promptText || '';
  const titleText = challenge.title || 'Daily Challenge';

  return (
    <View
      style={[
        styles.container,
        isFeatured && styles.featuredContainer,
        fullScreen && styles.fullScreenContainer,
        isCompleted && styles.completedContainer,
      ]}
    >
      {isFeatured && (
        <View style={styles.featuredBadge}>
          <Sparkles size={16} color={isCompleted ? COLORS.accent.secondary : COLORS.accent.primary} />
          <Text style={[styles.featuredText, isCompleted && styles.completedText]}>
            {isCompleted ? 'Completed ✓' : "Today's Cognitive Nudge"}
          </Text>
        </View>
      )}
      
      <Text style={[styles.title, fullScreen && styles.fullScreenTitle]}>{titleText}</Text>
      <Text style={[styles.provocation, fullScreen && styles.fullScreenProvocation]} numberOfLines={fullScreen ? undefined : 3}>
        {provocationText}
      </Text>

      <View style={styles.footer}>
        {challenge.topicName && (
          <Text style={styles.topic}>{challenge.topicName}</Text>
        )}
        {challenge.xpReward && (
          <Text style={styles.xp}>+{challenge.xpReward} XP</Text>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
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
  completedContainer: {
    borderColor: COLORS.accent.secondary,
  },
  completedText: {
    color: COLORS.accent.secondary,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  fullScreenTitle: {
    fontSize: 26,
    marginBottom: 16,
  },
  fullScreenProvocation: {
    fontSize: 18,
    lineHeight: 28,
    flex: 1,
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
