import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../../theme/colors';

interface TimerWidgetProps {
  initialTime: number; // in seconds
  onTimeUp?: () => void;
  paused?: boolean;
}

export const TimerWidget = React.memo<TimerWidgetProps>(({
  initialTime,
  onTimeUp,
  paused = false
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (paused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, paused, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = () => {
    if (timeLeft < 60) return COLORS.semantic.error;
    if (timeLeft < 300) return COLORS.semantic.warning;
    return COLORS.accent.primary;
  };

  return (
    <View style={{
      backgroundColor: COLORS.background.elevated,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      alignSelf: 'center',
    }}>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: getColor(),
      }}>
        {formatTime(timeLeft)}
      </Text>
    </View>
  );
});
