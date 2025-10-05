/**
 * GradientBorderCard Component
 * 
 * Card with animated gradient border
 * Resource-efficient: Uses LinearGradient with rotation animation
 * 
 * Usage: <GradientBorderCard><Content /></GradientBorderCard>
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY, ACCENT, NEUTRAL } from '../../theme';

interface GradientBorderCardProps {
  children: React.ReactNode;
  borderWidth?: number;
  borderRadius?: number;
  animated?: boolean;
  style?: ViewStyle;
}

export const GradientBorderCard = React.memo<GradientBorderCardProps>(({ 
  children,
  borderWidth = 2,
  borderRadius = 16,
  animated = true,
  style 
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    rotate.start();
    return () => rotate.stop();
  }, [animated, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { borderRadius }, style]}>
      {/* Gradient border wrapper */}
      <Animated.View
        style={[
          styles.gradientWrapper,
          {
            borderRadius,
            transform: animated ? [{ rotate: rotation }] : [],
          },
        ]}
      >
        <LinearGradient
          colors={[PRIMARY[500], ACCENT[500], PRIMARY[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientBorder, { borderRadius }]}
        />
      </Animated.View>

      {/* Content wrapper */}
      <View
        style={[
          styles.content,
          {
            borderRadius: borderRadius - borderWidth,
            margin: borderWidth,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
});

GradientBorderCard.displayName = 'GradientBorderCard';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  gradientWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientBorder: {
    flex: 1,
  },
  content: {
    backgroundColor: NEUTRAL[900],
    padding: 16,
  },
});
