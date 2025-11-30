import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ViewStyle, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { FONTS } from '../../theme';

interface InfiniteMarqueeProps {
  items: string[];
  speed?: number; // pixels per second
  reverse?: boolean;
  fontSize?: number;
  style?: ViewStyle;
  onItemPress?: (item: string) => void;
}

export const InfiniteMarquee = React.memo<InfiniteMarqueeProps>(({
  items,
  speed = 50, // 50 pixels per second (slow, smooth scroll)
  reverse = false,
  fontSize = 16,
  style,
  onItemPress,
}) => {
  const router = useRouter();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [singleSetWidth, setSingleSetWidth] = useState(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Duplicate items twice for seamless infinite loop
  const duplicatedItems = [...items, ...items];

  // Handle pill press - navigate to library with topic expanded
  const handlePillPress = useCallback((topicName: string) => {
    if (onItemPress) {
      onItemPress(topicName);
    } else {
      router.push(`/(tabs)/library?expandTopic=${encodeURIComponent(topicName)}`);
    }
  }, [onItemPress, router]);

  // Stop any running animation
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  }, []);

  // Start continuous infinite scroll animation - smooth, no jerks
  const startInfiniteScroll = useCallback(() => {
    if (singleSetWidth <= 0) return;

    const startPos = reverse ? -singleSetWidth : 0;
    const endPos = reverse ? 0 : -singleSetWidth;
    
    // Calculate duration based on width and speed (pixels per second)
    // This ensures consistent scroll speed regardless of content width
    const duration = (singleSetWidth / speed) * 1000; // Convert to milliseconds

    // Reset to start position
    animatedValue.setValue(startPos);

    // Create seamless looping animation
    const animate = () => {
      animatedValue.setValue(startPos);
      
      animationRef.current = Animated.timing(animatedValue, {
        toValue: endPos,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      });

      animationRef.current.start(({ finished }) => {
        if (finished) {
          // Seamlessly loop - no delay, no jerk
          animate();
        }
      });
    };

    animate();
  }, [singleSetWidth, speed, reverse, animatedValue]);

  // Start animation when width is measured
  useEffect(() => {
    if (singleSetWidth > 0) {
      startInfiniteScroll();
      
      return () => {
        stopAnimation();
      };
    }
  }, [singleSetWidth, startInfiniteScroll, stopAnimation]);

  // Measure single set width
  const onContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    // Total width divided by 2 (we have 2 copies)
    const measuredWidth = width / 2;
    if (measuredWidth > 0 && measuredWidth !== singleSetWidth) {
      setSingleSetWidth(measuredWidth);
    }
  }, [singleSetWidth]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return (
    // @ts-expect-error - React 19 type compatibility issue with RN
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.scrollContent,
          {
            transform: [{ translateX: animatedValue }],
          },
        ]}
        onLayout={onContentLayout}
      >
        {duplicatedItems.map((item, index) => (
          // @ts-expect-error - React 19 type compatibility issue
          <TouchableOpacity
            key={`${item}-${index}`}
            style={styles.pill}
            onPress={() => handlePillPress(item)}
            activeOpacity={0.7}
          >
            {/* @ts-expect-error - React 19 type compatibility issue */}
            <Text style={[styles.pillText, { fontSize }]}>
              {item.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  scrollContent: {
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
