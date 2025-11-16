import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FunctionDiagnostics } from '../components/FunctionDiagnostics';

export default function DiagnosticsScreen() {
  return (
    <View style={styles.container}>
      <FunctionDiagnostics />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
