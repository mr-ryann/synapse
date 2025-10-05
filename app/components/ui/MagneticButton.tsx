/**
 * MagneticButton Component
 * 
 * Button with magnetic hover effect (follows touch)
 * Resource-efficient: Uses gesture responder with spring animations
 * 
 * Usage: <MagneticButton onPress={handlePress}>Click Me</MagneticButton>
 */

import React, { useRef } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet, ViewStyle, TextStyle, PanResponder } from 'react-native';
import { PRIMARY, NEUTRAL } from '../../theme';

interface MagneticButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  magneticStrength?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const MagneticButton = React.memo<MagneticButtonProps>(({ 
  onPress, 
  children,
  magneticStrength = 0.3,
  style,
  textStyle 
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Magnetic effect - button follows finger slightly
        translateX.setValue(gestureState.dx * magneticStrength);
        translateY.setValue(gestureState.dy * magneticStrength);
      },
      onPanResponderRelease: () => {
        // Spring back to center
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 7,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 7,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();

        if (onPress) onPress();
      },
      onPanResponderGrant: () => {
        Animated.spring(scale, {
          toValue: 0.95,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.button}
        activeOpacity={1}
      >
        <Text style={[styles.text, textStyle]}>{children}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

MagneticButton.displayName = 'MagneticButton';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
  },
  button: {
    backgroundColor: PRIMARY[500],
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: NEUTRAL.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
