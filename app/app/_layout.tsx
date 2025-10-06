import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthWrapper } from '../components/AuthWrapper';
import { BottomTabBar } from '../components/navigation/BottomTabBar';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
        <AuthWrapper>
          <View style={{ flex: 1, backgroundColor: '#000000' }}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
              <Stack.Screen name="index" options={{ title: 'Home' }} />
              <Stack.Screen name="login" options={{ title: 'Login' }} />
              <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
              <Stack.Screen name="onboarding" options={{ title: 'Onboarding' }} />
              <Stack.Screen name="topics" options={{ title: 'Topics' }} />
              <Stack.Screen name="auth-callback" options={{ title: 'Loading...' }} />
              <Stack.Screen name="challenge-list" options={{ title: 'Challenges' }} />
              <Stack.Screen name="challenge-player" options={{ title: 'Challenge' }} />
              <Stack.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
              <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
              <Stack.Screen name="search" options={{ title: 'Search' }} />
              <Stack.Screen name="library" options={{ title: 'Library' }} />
              <Stack.Screen name="settings" options={{ title: 'Settings' }} />
              <Stack.Screen name="reset-password" options={{ title: 'Reset Password' }} />
              <Stack.Screen name="reset-password-confirm" options={{ title: 'Confirm Password' }} />
              <Stack.Screen name="verify-email" options={{ title: 'Verify Email' }} />
              <Stack.Screen name="email-verified" options={{ title: 'Email Verified' }} />
            </Stack>
            <BottomTabBar />
          </View>
        </AuthWrapper>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
