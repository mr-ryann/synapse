/**
 * StaggeredTextReveal Component
 * 
 * Text that reveals word by word with staggered animation
 * Resource-efficient: Uses simple opacity animation with memoization
 * 
 * Usage: <StaggeredTextReveal text="Welcome to Synapse" />
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, TextStyle } from 'react-native';
import { NEUTRAL } from '../../theme';

interface StaggeredTextRevealProps {
  text: string;
  delay?: number;
  staggerDelay?: number;
  style?: TextStyle;
}

export const StaggeredTextReveal = React.memo<StaggeredTextRevealProps>(({ 
  text, 
  delay = 0,
  staggerDelay = 100,
  style 
}) => {
  const words = text.split(' ');
  const animatedValues = useRef(
    words.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((animValue, index) =>
      Animated.timing(animValue, {
        toValue: 1,
        duration: 500,
        delay: delay + index * staggerDelay,
        useNativeDriver: true,
      })
    );

    Animated.stagger(staggerDelay, animations).start();
  }, [animatedValues, delay, staggerDelay]);

  return (
    <View style={styles.container}>
      {words.map((word, index) => {
        const opacity = animatedValues[index];
        const translateY = animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        });

        return (
          <Animated.Text
            key={`${word}-${index}`}
            style={[
              styles.word,
              style,
              {
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            {word}{' '}
          </Animated.Text>
        );
      })}
    </View>
  );
});

StaggeredTextReveal.displayName = 'StaggeredTextReveal';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    fontSize: 24,
    fontWeight: '700',
    color: NEUTRAL.white,
  },
});
