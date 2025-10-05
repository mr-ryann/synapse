/**
 * SelectableCard Component
 * 
 * Card with smooth selection animation and glassmorphic effect
 * Resource-efficient: Uses optimized spring animations
 * 
 * Usage: <SelectableCard title="Topic" selected={selected} onSelect={handleSelect} />
 */

import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet, View } from 'react-native';
import { PRIMARY, NEUTRAL } from '../../theme';

interface SelectableCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

export const SelectableCard = React.memo<SelectableCardProps>(({ 
  title, 
  description, 
  icon, 
  selected = false, 
  onSelect,
  disabled = false 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const bgAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(borderAnim, {
        toValue: selected ? 1 : 0,
        useNativeDriver: false,
        tension: 100,
        friction: 7,
      }),
      Animated.spring(bgAnim, {
        toValue: selected ? 1 : 0,
        useNativeDriver: false,
        tension: 100,
        friction: 7,
      }),
    ]).start();
  }, [selected, borderAnim, bgAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', PRIMARY[500]],
  });

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.03)', `${PRIMARY[500]}20`],
  });

  return (
    <TouchableOpacity
      onPress={onSelect}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
            borderColor,
            backgroundColor,
          },
          disabled && styles.disabled,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>

        {/* Selection indicator */}
        {selected && (
          <Animated.View style={styles.checkmarkContainer}>
            <View style={styles.checkmark} />
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

SelectableCard.displayName = 'SelectableCard';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: NEUTRAL.white,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: NEUTRAL[400],
    fontWeight: '500',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PRIMARY[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 8,
    height: 12,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#ffffff',
    transform: [{ rotate: '45deg' }, { translateY: -2 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
