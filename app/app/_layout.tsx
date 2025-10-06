import { Stack } from 'expo-router';
import { AuthWrapper } from '../components/AuthWrapper';

export default function Layout() {
  return (
    <AuthWrapper>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="onboarding" options={{ title: 'Onboarding' }} />
        <Stack.Screen name="topics" options={{ title: 'Topics' }} />
        <Stack.Screen name="auth-callback" options={{ title: 'Loading...' }} />
        <Stack.Screen name="challenge-list" options={{ title: 'Challenges' }} />
        <Stack.Screen name="challenge-player" options={{ title: 'Challenge' }} />
        <Stack.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
      </Stack>
    </AuthWrapper>
  );
}
