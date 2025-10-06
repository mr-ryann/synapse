import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS } from '../theme';

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.heading}>Your Library</Text>
          <Text style={styles.description}>
            Completed challenges and saved responses
          </Text>
          {/* Library content will go here */}
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Your completed challenges will appear here
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  heading: {
    fontSize: 30,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  placeholder: {
    backgroundColor: COLORS.background.elevated,
    padding: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
