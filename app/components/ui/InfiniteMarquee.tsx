import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ViewStyle } from 'react-native';
import { FONTS, COLORS } from '../../theme';

interface InfiniteMarqueeProps {
  items: string[];
  speed?: number;
  reverse?: boolean;
  fontSize?: number;
  style?: ViewStyle;
}

export const InfiniteMarquee = React.memo<InfiniteMarqueeProps>(({
  items,
  speed = 25000,
  reverse = false,
  fontSize = 16,
  style,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items, ...items];

  // Estimate width of one set (for animation loop point)
  const estimatedItemWidth = fontSize * 8; // Approximate width per pill
  const oneSetWidth = items.length * estimatedItemWidth;

  useEffect(() => {
    // Start position
    const startValue = reverse ? -oneSetWidth : 0;
    // End position - move exactly one set width for seamless loop
    const endValue = reverse ? 0 : -oneSetWidth;
    
    translateX.setValue(startValue);

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: endValue,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    );
    
    animation.start();
    
    return () => animation.stop();
  }, [reverse, speed, oneSetWidth, translateX]);

  return (
    // @ts-expect-error - React 19 type compatibility issue with RN
    <View style={[styles.container, style]}>
      {/* @ts-expect-error - React 19 type compatibility issue */}
      <Animated.View style={[styles.marqueeContainer, { transform: [{ translateX }] }]}>
        {duplicatedItems.map((item, index) => (
          // @ts-expect-error - React 19 type compatibility issue
          <View key={`${item}-${index}`} style={styles.pill}>
            {/* @ts-expect-error - React 19 type compatibility issue */}
            <Text style={[styles.pillText, { fontSize }]}>
              {item.toUpperCase()}
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
    justifyContent: 'center',
  },
  marqueeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    backgroundColor: 'rgba(240, 238, 231, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(240, 238, 231, 0.15)',
  },
  pillText: {
    fontFamily: FONTS.heading,
    fontWeight: '600',
    color: '#F0EEE7',
    opacity: 0.7,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default InfiniteMarquee;
