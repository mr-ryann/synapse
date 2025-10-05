/**
 * ConfettiCelebration Component
 * 
 * Confetti burst animation for celebrations
 * Resource-efficient: Limited particle count, uses native driver
 * 
 * Usage: <ConfettiCelebration show={showConfetti} />
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { PRIMARY, ACCENT, SUCCESS, WARNING } from '../../theme';

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 40;
const COLORS = [PRIMARY[500], ACCENT[500], SUCCESS[500], WARNING[500]];

interface ConfettiParticle {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  color: string;
}

interface ConfettiCelebrationProps {
  show?: boolean;
  duration?: number;
}

export const ConfettiCelebration = React.memo<ConfettiCelebrationProps>(({ 
  show = false,
  duration = 2500 
}) => {
  const particles = useRef<ConfettiParticle[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(width / 2),
      y: new Animated.Value(height / 2),
      rotate: new Animated.Value(0),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
  ).current;

  useEffect(() => {
    if (!show) return;

    const animations = particles.map((particle) => {
      const randomX = (Math.random() - 0.5) * width;
      const randomY = Math.random() * height;
      const randomRotate = Math.random() * 720;

      return Animated.parallel([
        Animated.timing(particle.x, {
          toValue: width / 2 + randomX,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: randomY + height,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(particle.rotate, {
          toValue: randomRotate,
          duration,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      // Reset particles
      particles.forEach((particle) => {
        particle.x.setValue(width / 2);
        particle.y.setValue(height / 2);
        particle.rotate.setValue(0);
      });
    });
  }, [show, particles, duration]);

  if (!show) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle, index) => {
        const rotateZ = particle.rotate.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                backgroundColor: particle.color,
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  { rotate: rotateZ },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
});

ConfettiCelebration.displayName = 'ConfettiCelebration';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 12,
    borderRadius: 2,
  },
});
