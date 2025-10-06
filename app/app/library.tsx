import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TopHeader } from '../components/navigation/TopHeader';

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <TopHeader />
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
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 24,
  },
  placeholder: {
    backgroundColor: '#1a1a1a',
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
