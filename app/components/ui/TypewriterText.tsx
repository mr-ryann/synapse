/**
 * TypewriterText Component
 * 
 * Text that types out letter by letter with cursor
 * Resource-efficient: Uses string slicing instead of character arrays
 * 
 * Usage: <TypewriterText text="AI Hint: Start with..." />
 */

import React, { useState, useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet, TextStyle } from 'react-native';
import { PRIMARY, NEUTRAL } from '../../theme';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character
  delay?: number; // initial delay
  style?: TextStyle;
  onComplete?: () => void;
  showCursor?: boolean;
}

export const TypewriterText = React.memo<TypewriterTextProps>(({ 
  text, 
  speed = 50,
  delay = 0,
  style,
  onComplete,
  showCursor = true 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // Typewriter effect
  useEffect(() => {
    if (currentIndex >= text.length) {
      setIsComplete(true);
      if (onComplete) onComplete();
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(text.slice(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, currentIndex === 0 ? delay : speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, delay, onComplete]);

  // Cursor blink animation
  useEffect(() => {
    if (!showCursor) return;

    const blinkAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    blinkAnim.start();

    return () => blinkAnim.stop();
  }, [showCursor, cursorOpacity]);

  return (
    <Text style={[styles.text, style]}>
      {displayedText}
      {showCursor && !isComplete && (
        <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
          |
        </Animated.Text>
      )}
    </Text>
  );
});

TypewriterText.displayName = 'TypewriterText';

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: NEUTRAL.white,
    fontWeight: '500',
  },
  cursor: {
    color: PRIMARY[500],
    fontWeight: '700',
  },
});
