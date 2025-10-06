import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../stores';
import { COLORS } from '../theme/colors';

export default function Home() {
  const router = useRouter();
  const { user } = useUserStore();

  useEffect(() => {
    // Redirect based on auth state
    if (user) {
      // User is logged in, check onboarding status
      if (user.preferences?.topics && user.preferences.topics.length > 0) {
        router.replace('/topics');
      } else {
        router.replace('/onboarding');
      }
    } else {
      // User not logged in, redirect to login
      router.replace('/login');
    }
  }, [user, router]);

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background.primary,
    }}>
      <ActivityIndicator size="large" color={COLORS.primary[500]} />
    </View>
  );
}
