import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { COLORS, FONTS } from '../../theme';

interface ThinkingTimerProps {
  isActive: boolean;
  time: number;
  onTimeUpdate: (time: number) => void;
}

export const ThinkingTimer: React.FC<ThinkingTimerProps> = ({ 
  isActive, 
  time, 
  onTimeUpdate 
}) => {
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        onTimeUpdate(time + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, onTimeUpdate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Clock size={16} color={COLORS.text.secondary} />
      <Text style={styles.text}>
        Thinking Time: {formatTime(time)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background.elevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  text: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
});