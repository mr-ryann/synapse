import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../../theme/colors';

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
}

export const ProgressRing = React.memo<ProgressRingProps>(({
  progress,
  size = 100,
  strokeWidth = 8,
  showText = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <View style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: COLORS.border.default,
        position: 'absolute',
      }} />
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: COLORS.accent.primary,
        position: 'absolute',
        transform: [{ rotate: '-90deg' }],
        // For simplicity, use a basic view; in full implementation, use SVG or library for proper arc
      }} />
      {showText && (
        <Text style={{
          fontSize: size / 4,
          fontWeight: 'bold',
          color: COLORS.accent.primary,
        }}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  );
});
