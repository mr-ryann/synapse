/**
 * SkeletonLoader Component
 * 
 * Loading skeleton with shimmer effect
 * Resource-efficient: Single gradient animation reused
 * 
 * Usage: <SkeletonLoader width={200} height={20} />
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NEUTRAL } from '../../theme';

interface SkeletonLoaderProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader = React.memo<SkeletonLoaderProps>(({ 
  width, 
  height = 20,
  borderRadius = 8,
  style 
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.05)',
            'rgba(255, 255, 255, 0.15)',
            'rgba(255, 255, 255, 0.05)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

const styles = StyleSheet.create({
  container: {
    backgroundColor: NEUTRAL[800],
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: 200,
  },
  gradient: {
    flex: 1,
    width: 200,
  },
});
