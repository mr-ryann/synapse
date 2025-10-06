import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export const BackButton = React.memo(() => {
  const router = useRouter();

  return (
    <Pressable 
      onPress={() => router.back()}
      style={styles.button}
    >
      <ArrowLeft size={24} color="#1f2937" />
    </Pressable>
  );
});

BackButton.displayName = 'BackButton';

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
});
