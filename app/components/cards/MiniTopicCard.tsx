import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../theme';

interface MiniTopicCardProps {
  topic: {
    name: string;
    count: number;
  };
  onPress: () => void;
}

export const MiniTopicCard = React.memo<MiniTopicCardProps>(({ topic, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Text style={styles.name}>{topic.name}</Text>
      <Text style={styles.count}>{topic.count} challenges</Text>
    </TouchableOpacity>
  );
});

MiniTopicCard.displayName = 'MiniTopicCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.elevated,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  count: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.secondary,
  },
});
