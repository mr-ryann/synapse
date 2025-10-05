/**
 * BackgroundPaths Component
 * 
 * Animated SVG paths creating organic flowing background
 * Resource-efficient: Uses native driver for smooth 60fps animations
 * 
 * Usage: <BackgroundPaths />
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PRIMARY, ACCENT } from '../../theme';

const { width, height } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface BackgroundPathsProps {
  opacity?: number;
  animated?: boolean;
}

export const BackgroundPaths = React.memo<BackgroundPathsProps>(({ 
  opacity = 0.1,
  animated = true 
}) => {
  const animValue1 = useRef(new Animated.Value(0)).current;
  const animValue2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const anim1 = Animated.loop(
      Animated.timing(animValue1, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    );

    const anim2 = Animated.loop(
      Animated.timing(animValue2, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    );

    anim1.start();
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, [animated, animValue1, animValue2]);

  const translateX1 = animValue1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 20, 0],
  });

  const translateY1 = animValue1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -30, 0],
  });

  const translateX2 = animValue2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -15, 0],
  });

  const translateY2 = animValue2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 25, 0],
  });

  // Generate organic curve paths
  const path1 = `M 0,${height * 0.3} Q ${width * 0.25},${height * 0.2} ${width * 0.5},${height * 0.25} T ${width},${height * 0.3} L ${width},0 L 0,0 Z`;
  const path2 = `M 0,${height * 0.6} Q ${width * 0.3},${height * 0.5} ${width * 0.6},${height * 0.55} T ${width},${height * 0.6} L ${width},${height} L 0,${height} Z`;

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={width} height={height} style={styles.svg}>
        {/* Path 1 - Primary Color */}
        <AnimatedPath
          d={path1}
          fill={PRIMARY[500]}
          opacity={opacity}
          transform={[
            { translateX: translateX1 },
            { translateY: translateY1 },
          ]}
        />

        {/* Path 2 - Accent Color */}
        <AnimatedPath
          d={path2}
          fill={ACCENT[500]}
          opacity={opacity * 0.8}
          transform={[
            { translateX: translateX2 },
            { translateY: translateY2 },
          ]}
        />
      </Svg>
    </View>
  );
});

BackgroundPaths.displayName = 'BackgroundPaths';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
  },
});
