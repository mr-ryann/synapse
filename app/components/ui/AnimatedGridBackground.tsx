/**
 * AnimatedGridBackground Component
 * 
 * Subtle animated grid that creates depth without overwhelming the content
 * Resource-efficient: Uses CSS transforms instead of JS animations
 * 
 * Usage: <AnimatedGridBackground />
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { PRIMARY } from '../../theme';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 40;

interface AnimatedGridBackgroundProps {
  color?: string;
  opacity?: number;
  animated?: boolean;
}

export const AnimatedGridBackground = React.memo<AnimatedGridBackgroundProps>(({ 
  color = PRIMARY[500], 
  opacity = 0.05,
  animated = true 
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animated, animValue]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -GRID_SIZE],
  });

  const renderGridLines = () => {
    const verticalLines = Math.ceil(width / GRID_SIZE) + 1;
    const horizontalLines = Math.ceil(height / GRID_SIZE) + 2;

    return (
      <Animated.View
        style={[
          styles.gridContainer,
          animated && { transform: [{ translateY }] },
        ]}
      >
        {/* Vertical Lines */}
        {Array.from({ length: verticalLines }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.verticalLine,
              {
                left: i * GRID_SIZE,
                backgroundColor: color,
                opacity,
              },
            ]}
          />
        ))}

        {/* Horizontal Lines */}
        {Array.from({ length: horizontalLines }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.horizontalLine,
              {
                top: i * GRID_SIZE,
                backgroundColor: color,
                opacity,
              },
            ]}
          />
        ))}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {renderGridLines()}
    </View>
  );
});

AnimatedGridBackground.displayName = 'AnimatedGridBackground';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gridContainer: {
    width: width,
    height: height + GRID_SIZE,
  },
  verticalLine: {
    position: 'absolute',
    width: 1,
    height: height + GRID_SIZE,
  },
  horizontalLine: {
    position: 'absolute',
    width: width,
    height: 1,
  },
});
