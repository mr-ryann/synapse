/**
 * ToastNotification Component
 * 
 * Slide-in toast notification with auto-dismiss
 * Resource-efficient: Single animation instance
 * 
 * Usage: <ToastNotification message="Success!" type="success" visible={show} />
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { SUCCESS, ERROR, WARNING, INFO, NEUTRAL } from '../../theme';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastNotificationProps {
  message: string;
  type?: ToastType;
  visible?: boolean;
  duration?: number;
  onHide?: () => void;
}

export const ToastNotification = React.memo<ToastNotificationProps>(({ 
  message, 
  type = 'info',
  visible = false,
  duration = 3000,
  onHide 
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: -100,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onHide) onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, translateY, opacity, duration, onHide]);

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: SUCCESS[500], text: NEUTRAL.white };
      case 'error':
        return { bg: ERROR[500], text: NEUTRAL.white };
      case 'warning':
        return { bg: WARNING[500], text: NEUTRAL.white };
      default:
        return { bg: INFO[500], text: NEUTRAL.white };
    }
  };

  const colors = getColors();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Text style={[styles.message, { color: colors.text }]}>
        {message}
      </Text>
    </Animated.View>
  );
});

ToastNotification.displayName = 'ToastNotification';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
