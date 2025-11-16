import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { COLORS } from '../../theme/colors';
import { Challenge } from '../../types';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress: (challenge: Challenge) => void;
}

export const ChallengeCard = React.memo<ChallengeCardProps>(({
  challenge,
  onPress
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(challenge)}
      style={{
        backgroundColor: COLORS.background.primary,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: COLORS.accent.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: 8,
      }}>
        {challenge.title}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: COLORS.text.secondary }}>
          {challenge.topic} {challenge.subcategory && `• ${challenge.subcategory}`}
        </Text>
        <Text style={{ color: COLORS.accent.primary, fontWeight: '600' }}>
          +{challenge.xpReward} XP
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ color: COLORS.text.secondary }}>
          Difficulty: {challenge.difficulty}/5
        </Text>
        <Text style={{ color: COLORS.text.secondary }}>
          {challenge.estimatedTime} min
        </Text>
      </View>
    </TouchableOpacity>
  );
});
