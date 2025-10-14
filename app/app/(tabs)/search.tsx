import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS } from '../../theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.heading}>Search</Text>
          <TextInput
            style={styles.input}
            placeholder="Search challenges..."
            placeholderTextColor={COLORS.text.secondary}
            value={query}
            onChangeText={setQuery}
          />
          {/* Search results will go here */}
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
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.elevated,
  },
  helperText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});
