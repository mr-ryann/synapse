import React, { useRef, useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Animated } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { COLORS, FONTS } from '../../theme';

interface TabButtonProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onPress?: () => void;
}

export const TabButton = React.memo<TabButtonProps>(({ 
  icon: Icon, 
  label, 
  isActive, 
  onPress 
}) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.9)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1 : 0.9,
      tension: 100,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [isActive, scaleAnim]);

  return (
    <Pressable
      onPress={onPress}
      disabled={isActive}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
      }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Icon
          size={24}
          color={isActive ? COLORS.accent.primary : COLORS.text.secondary}
        />
      </Animated.View>
      <Text
        style={{
          fontSize: 12,
          marginTop: 4,
          color: isActive ? COLORS.accent.primary : COLORS.text.secondary,
          fontFamily: FONTS.body,
          fontWeight: isActive ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
});

TabButton.displayName = 'TabButton';
