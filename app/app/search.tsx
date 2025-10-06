import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { TopHeader } from '../components/navigation/TopHeader';

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      <TopHeader />
      <ScrollView style={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.heading}>Search</Text>
          <TextInput
            style={styles.input}
            placeholder="Search challenges..."
            placeholderTextColor="#666666"
            value={query}
            onChangeText={setQuery}
          />
          <Text style={styles.helperText}>
            Search for challenges by topic, title, or keyword
          </Text>
          {/* Search results will go here */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  inner: {
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#cccccc',
  },
});
