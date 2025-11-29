import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ViewStyle, TouchableOpacity, LayoutChangeEvent, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import { FONTS } from '../../theme';

interface InfiniteMarqueeProps {
  items: string[];
  speed?: number;
  reverse?: boolean;
  fontSize?: number;
  style?: ViewStyle;
  onItemPress?: (item: string) => void;
}

export const InfiniteMarquee = React.memo<InfiniteMarqueeProps>(({
  items,
  speed = 30000,
  reverse = false,
  fontSize = 16,
  style,
  onItemPress,
}) => {
  const router = useRouter();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [singleSetWidth, setSingleSetWidth] = useState(0);
  const currentPosition = useRef(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const isDragging = useRef(false);
  const dragStartPosition = useRef(0);

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

  // Start continuous infinite scroll animation
  const startInfiniteScroll = useCallback(() => {
    if (singleSetWidth <= 0 || isDragging.current) return;

    const startPos = currentPosition.current;
    
    // For normal direction: scroll from 0 to -singleSetWidth
    // For reverse direction: scroll from -singleSetWidth to 0
    const targetPos = reverse ? 0 : -singleSetWidth;
    
    // Calculate remaining distance for proportional timing
    const totalDistance = singleSetWidth;
    const remainingDistance = Math.abs(targetPos - startPos);
    const duration = (remainingDistance / totalDistance) * speed;

    if (duration < 50) {
      // Already at target, reset and restart
      const resetPos = reverse ? -singleSetWidth : 0;
      currentPosition.current = resetPos;
      animatedValue.setValue(resetPos);
      // Use requestAnimationFrame for smoother restart
      requestAnimationFrame(() => {
        if (!isDragging.current) {
          startInfiniteScroll();
        }
      });
      return;
    }

    animationRef.current = Animated.timing(animatedValue, {
      toValue: targetPos,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    animationRef.current.start(({ finished }) => {
      if (finished && !isDragging.current) {
        // Seamlessly reset to the beginning
        const resetPos = reverse ? -singleSetWidth : 0;
        currentPosition.current = resetPos;
        animatedValue.setValue(resetPos);
        // Immediately continue - no delay for seamless loop
        requestAnimationFrame(() => {
          if (!isDragging.current) {
            startInfiniteScroll();
          }
        });
      }
    });
  }, [singleSetWidth, speed, reverse, animatedValue]);

  // Track animated value position
  useEffect(() => {
    const listenerId = animatedValue.addListener(({ value }) => {
      currentPosition.current = value;
    });
    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [animatedValue]);

  // Start animation when width is measured
  useEffect(() => {
    if (singleSetWidth > 0 && !isDragging.current) {
      // Set initial position
      const initialPos = reverse ? -singleSetWidth : 0;
      currentPosition.current = initialPos;
      animatedValue.setValue(initialPos);
      
      // Start scrolling
      const timer = setTimeout(() => {
        startInfiniteScroll();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        stopAnimation();
      };
    }
  }, [singleSetWidth, reverse, startInfiniteScroll, stopAnimation, animatedValue]);

  // Pan responder for manual dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 8;
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        stopAnimation();
        dragStartPosition.current = currentPosition.current;
      },
      onPanResponderMove: (_, gestureState) => {
        let newPosition = dragStartPosition.current + gestureState.dx;
        
        // Wrap position for infinite feel
        if (singleSetWidth > 0) {
          while (newPosition > 0) {
            newPosition -= singleSetWidth;
            dragStartPosition.current -= singleSetWidth;
          }
          while (newPosition < -singleSetWidth) {
            newPosition += singleSetWidth;
            dragStartPosition.current += singleSetWidth;
          }
        }
        
        currentPosition.current = newPosition;
        animatedValue.setValue(newPosition);
      },
      onPanResponderRelease: (_, gestureState) => {
        isDragging.current = false;
        
        // Apply momentum
        const velocity = gestureState.vx;
        const momentumDistance = velocity * 150;
        let targetPosition = currentPosition.current + momentumDistance;
        
        // Normalize position
        if (singleSetWidth > 0) {
          while (targetPosition > 0) {
            targetPosition -= singleSetWidth;
          }
          while (targetPosition < -singleSetWidth) {
            targetPosition += singleSetWidth;
          }
        }
        
        Animated.timing(animatedValue, {
          toValue: targetPosition,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            currentPosition.current = targetPosition;
            setTimeout(() => {
              if (!isDragging.current) {
                startInfiniteScroll();
              }
            }, 800);
          }
        });
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        setTimeout(() => {
          if (!isDragging.current) {
            startInfiniteScroll();
          }
        }, 300);
      },
    })
  ).current;

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
    <View style={[styles.container, style]} {...panResponder.panHandlers}>
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
