/**
 * ShimmerButton Component
 * 
 * Animated shimmer effect on button hover/press
 * Resource-efficient: Uses transform animations with native driver
 * 
 * Usage: <ShimmerButton onPress={handleSubmit}>Submit</ShimmerButton>
 */

import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY } from '../../theme';

interface ShimmerButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ShimmerButton = React.memo<ShimmerButtonProps>(({ 
  onPress, 
  children, 
  variant = 'primary',
  disabled = false,
  style,
  textStyle 
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const getColors = (): readonly [string, string, string] => {
    switch (variant) {
      case 'secondary':
        return ['#a855f7', '#c084fc', '#a855f7'] as const;
      case 'accent':
        return ['#ec4899', '#f472b6', '#ec4899'] as const;
      default:
        return [PRIMARY[600], PRIMARY[500], PRIMARY[600]] as const;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      <Animated.View
        style={[
          styles.buttonContent,
          { transform: [{ scale: scaleAnim }] },
          disabled && styles.disabled,
        ]}
      >
        <LinearGradient
          colors={getColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Shimmer overlay */}
          <Animated.View
            style={[
              styles.shimmerOverlay,
              {
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          />

          <Text style={[styles.text, textStyle]}>
            {children}
          </Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
});

ShimmerButton.displayName = 'ShimmerButton';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  buttonContent: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 100,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
});
