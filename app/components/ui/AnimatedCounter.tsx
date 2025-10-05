/**
 * AnimatedCounter Component
 * 
 * Number that animates from 0 to target value
 * Resource-efficient: Uses interpolation for smooth counting
 * 
 * Usage: <AnimatedCounter value={85} suffix="%" />
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TextStyle } from 'react-native';
import { PRIMARY, NEUTRAL } from '../../theme';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
  decimals?: number;
}

export const AnimatedCounter = React.memo<AnimatedCounterProps>(({ 
  value, 
  duration = 1500,
  delay = 0,
  prefix = '',
  suffix = '',
  style,
  decimals = 0 
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.addListener(({ value: animValue }) => {
      setDisplayValue(animValue);
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      delay,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeAllListeners();
    };
  }, [value, duration, delay, animatedValue]);

  return (
    <Animated.Text
      style={[
        styles.text,
        style,
      ]}
    >
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </Animated.Text>
  );
});

AnimatedCounter.displayName = 'AnimatedCounter';

const styles = StyleSheet.create({
  text: {
    fontSize: 48,
    fontWeight: '800',
    color: PRIMARY[500],
    letterSpacing: -1,
  },
});
