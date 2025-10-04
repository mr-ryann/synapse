import { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { account } from '../lib/appwrite';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EmailVerified() {
  const router = useRouter();
  const { userId, secret } = useLocalSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await account.updateVerification(userId as string, secret as string);
        Alert.alert('Success', 'Your email has been verified!', [
          {
            text: 'OK',
            onPress: () => router.push('/topics')
          }
        ]);
      } catch (e) {
        Alert.alert('Error', (e as Error).message, [
          {
            text: 'OK',
            onPress: () => router.push('/verify-email')
          }
        ]);
      }
    };

    if (userId && secret) {
      verifyEmail();
    }
  }, [userId, secret]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 20 }}>Verifying your email...</Text>
    </View>
  );
}
