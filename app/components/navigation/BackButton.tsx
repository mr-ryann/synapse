import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../../theme';

export const BackButton = React.memo(() => {
  const router = useRouter();

  return (
    <Pressable 
      onPress={() => router.back()}
      style={styles.button}
    >
      <ArrowLeft size={24} color={COLORS.text.primary} />
    </Pressable>
  );
});

BackButton.displayName = 'BackButton';

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
});
