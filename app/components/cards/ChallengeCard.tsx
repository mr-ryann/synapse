import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Sparkles, Zap } from 'lucide-react-native';
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
  buttonText = 'Start',
  isFeatured = false,
  fullScreen = false,
  isCompleted = false,
}) => {
  const titleText = challenge.title || 'Daily Challenge';
  const topicText = challenge.topicName || 'General';
  const xpReward = challenge.xpReward || 15;

  return (
    <View
      style={[
        styles.container,
        isFeatured && styles.featuredContainer,
        fullScreen && styles.fullScreenContainer,
        isCompleted && styles.completedContainer,
      ]}
    >
      {/* Header - Today's Challenge */}
      <View style={styles.header}>
        <Sparkles size={18} color={isCompleted ? COLORS.accent.secondary : COLORS.accent.primary} />
        <Text style={[styles.headerText, isCompleted && styles.completedHeaderText]}>
          {isCompleted ? 'Completed' : "Today's Challenge"}
        </Text>
      </View>

      {/* Challenge Title */}
      <Text style={[styles.title, fullScreen && styles.fullScreenTitle]}>
        {titleText}
      </Text>

      {/* Topic */}
      <View style={styles.topicContainer}>
        <Text style={styles.topicLabel}>Topic:</Text>
        <Text style={styles.topicValue}>{topicText}</Text>
      </View>

      {/* XP Reward */}
      <View style={styles.xpContainer}>
        <Zap size={18} color={COLORS.accent.secondary} fill={COLORS.accent.secondary} />
        <Text style={styles.xpText}>+{xpReward} XP</Text>
      </View>

      {/* Start Button */}
      <TouchableOpacity 
        style={[styles.button, isCompleted && styles.completedButton]} 
        onPress={onPress} 
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, isCompleted && styles.completedButtonText]}>
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

ChallengeCard.displayName = 'ChallengeCard';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.elevated,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  featuredContainer: {
    borderColor: COLORS.accent.primary,
    borderWidth: 2,
    backgroundColor: COLORS.background.secondary,
  },
  completedContainer: {
    borderColor: COLORS.accent.secondary,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  fullScreenTitle: {
    fontSize: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent.primary,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  completedHeaderText: {
    color: COLORS.accent.secondary,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
    lineHeight: 32,
  },
  topicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicLabel: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text.muted,
    marginRight: 6,
  },
  topicValue: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  xpText: {
    fontFamily: FONTS.body,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent.secondary,
    marginLeft: 6,
  },
  button: {
    backgroundColor: COLORS.accent.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.accent.secondary,
  },
  buttonText: {
    fontFamily: FONTS.body,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.background.primary,
  },
  completedButtonText: {
    color: COLORS.accent.secondary,
  },
});
