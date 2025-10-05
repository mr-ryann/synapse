/**
 * RippleEffect Component
 * 
 * Touch ripple effect wrapper for any component
 * Resource-efficient: Uses single animation value
 * 
 * Usage: <RippleEffect onPress={handlePress}><YourComponent /></RippleEffect>
 */

import React, { useRef, useState } from 'react';
import { TouchableWithoutFeedback, Animated, View, StyleSheet, ViewStyle, LayoutChangeEvent } from 'react-native';
import { PRIMARY } from '../../theme';

interface RippleEffectProps {
  onPress?: () => void;
  children: React.ReactNode;
  rippleColor?: string;
  rippleDuration?: number;
  style?: ViewStyle;
}

export const RippleEffect = React.memo<RippleEffectProps>(({ 
  onPress, 
  children,
  rippleColor = PRIMARY[500],
  rippleDuration = 600,
  style 
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const handlePress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    setRipplePosition({ x: locationX, y: locationY });

    scaleAnim.setValue(0);
    opacityAnim.setValue(0.5);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: rippleDuration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: rippleDuration,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) onPress();
  };

  const rippleSize = Math.max(dimensions.width, dimensions.height) * 2;

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={[styles.container, style]} onLayout={handleLayout}>
        {children}
        <Animated.View
          style={[
            styles.ripple,
            {
              width: rippleSize,
              height: rippleSize,
              borderRadius: rippleSize / 2,
              backgroundColor: rippleColor,
              top: ripplePosition.y - rippleSize / 2,
              left: ripplePosition.x - rippleSize / 2,
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
      </View>
    </TouchableWithoutFeedback>
  );
});

RippleEffect.displayName = 'RippleEffect';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
  },
});
