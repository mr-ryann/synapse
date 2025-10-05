/**
 * FloatingActionButton (FAB) Component
 * 
 * Floating action button with scale animation
 * Resource-efficient: Simple spring animations
 * 
 * Usage: <FloatingActionButton icon={<Icon />} onPress={handlePress} />
 */

import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, ViewStyle } from 'react-native';
import { PRIMARY, NEUTRAL } from '../../theme';

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  style?: ViewStyle;
}

export const FloatingActionButton = React.memo<FloatingActionButtonProps>(({ 
  icon, 
  onPress,
  position = 'bottom-right',
  style 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: 24, left: 24 };
      case 'top-right':
        return { top: 24, right: 24 };
      case 'top-left':
        return { top: 24, left: 24 };
      default:
        return { bottom: 24, right: 24 };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyle(),
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {icon}
      </TouchableOpacity>
    </Animated.View>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    shadowColor: PRIMARY[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
