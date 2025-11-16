import { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { functions } from '../lib/appwrite';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS } from '../theme';

export default function EmailVerified() {
  const router = useRouter();
  const { userId, secret } = useLocalSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!userId || !secret) {
        Alert.alert('Error', 'Invalid verification link', [
          {
            text: 'OK',
            onPress: () => router.push('/verify-email')
          }
        ]);
        return;
      }

      try {
        // Call verify-email serverless function
        const result = await functions.createExecution(
          'verify-email',
          JSON.stringify({
            userId: userId as string,
            secret: secret as string
          })
        );
        
        const response = JSON.parse(result.responseBody);
        
        if (response.success) {
          Alert.alert('Success', 'Your email has been verified!', [
            {
              text: 'OK',
              onPress: () => router.push('/topics')
            }
          ]);
        } else {
          Alert.alert('Error', response.error || 'Verification failed', [
            {
              text: 'OK',
              onPress: () => router.push('/verify-email')
            }
          ]);
        }
      } catch (e) {
        console.error('Email verification error:', e);
        Alert.alert('Error', 'Failed to verify email. The link may have expired.', [
          {
            text: 'OK',
            onPress: () => router.push('/verify-email')
          }
        ]);
      }
    };

    verifyEmail();
  }, [userId, secret, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.accent.primary} />
      <Text style={styles.status}>Verifying your email...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    padding: 24,
  },
  status: {
    marginTop: 24,
    color: COLORS.text.primary,
    fontFamily: FONTS.body,
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
