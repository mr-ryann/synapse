/**
 * GlassmorphicInput Component
 * 
 * Frosted glass effect input with smooth focus animations
 * Resource-efficient: Uses backdrop blur and optimized re-renders
 * 
 * Usage: <GlassmorphicInput placeholder="Email" value={email} onChangeText={setEmail} />
 */

import React, { useRef, useState, useCallback } from 'react';
import { TextInput, Animated, View, StyleSheet, TextInputProps } from 'react-native';
import { PRIMARY, NEUTRAL } from '../../theme';

interface GlassmorphicInputProps extends TextInputProps {
  icon?: React.ReactNode;
}

export const GlassmorphicInput = React.memo<GlassmorphicInputProps>(({ 
  icon, 
  style, 
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 100,
      friction: 7,
    }).start();
  }, [focusAnim]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 100,
      friction: 7,
    }).start();
  }, [focusAnim]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', PRIMARY[500]],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor,
          shadowColor: PRIMARY[500],
          shadowOpacity,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={NEUTRAL[400]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    </Animated.View>
  );
});

GlassmorphicInput.displayName = 'GlassmorphicInput';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: NEUTRAL.white,
    fontWeight: '500',
  },
});
