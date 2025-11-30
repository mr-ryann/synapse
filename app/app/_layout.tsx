import React, { useEffect, useCallback } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState, usePathname } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Oswald_400Regular } from '@expo-google-fonts/oswald';
import { Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold } from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';
import { useUserStore } from '../stores/useUserStore';
import { TopHeader } from '../components/navigation/TopHeader';
import { AuthWrapper } from '../components/AuthWrapper';
import { COLORS } from '../theme';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

// Routes that should NOT show the TopHeader
const HIDE_TOP_HEADER_ROUTES = [
  '/login',
  '/signup',
  '/onboarding',
  '/auth-callback',
  '/verify-email',
  '/email-verified',
  '/reset-password',
  '/reset-password-confirm',
];

export default function RootLayout() {
  const { user } = useUserStore();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const pathname = usePathname();
  
  // Load Google Fonts
  const [fontsLoaded] = useFonts({
    Oswald_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });
  
  // Hide splash screen once fonts are loaded
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  
  // Check if we should show the TopHeader
  const shouldShowTopHeader = !HIDE_TOP_HEADER_ROUTES.some(route => pathname?.startsWith(route));

  useEffect(() => {
    // Don't run navigation logic until the root navigation is ready
    if (!navigationState?.key) return;

    // Core redirect logic for the entire app
    const hasCompletedOnboarding = user?.selectedTopics && user.selectedTopics.length > 0;
    const currentPath = `/${segments.filter(Boolean).join('/')}` || '/';
    const isAuthRoute = currentPath.startsWith('/login') || currentPath.startsWith('/signup');
    const isOnboardingRoute = currentPath.startsWith('/onboarding') || currentPath.startsWith('/topics');

    if (user) {
      // User is logged in
      if (!hasCompletedOnboarding && !isOnboardingRoute) {
        // New user: must complete onboarding
        if (currentPath !== '/onboarding') {
          setTimeout(() => router.replace('/onboarding'), 0);
        }
      } else if (hasCompletedOnboarding && isAuthRoute) {
        // Existing user on an auth screen: send them to home
        if (currentPath !== '/home') {
          setTimeout(() => router.replace('/home'), 0);
        }
      }
    } else {
      // User is not logged in
      if (!isAuthRoute && !currentPath.startsWith('/auth-callback') && !currentPath.startsWith('/verify-email') && !currentPath.startsWith('/reset-password')) {
        if (currentPath !== '/login') {
          setTimeout(() => router.replace('/login'), 0);
        }
      }
    }
  }, [user, segments, navigationState]);

  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.background.primary }} onLayout={onLayoutRootView}>
        <AuthWrapper>
          <View style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
            {shouldShowTopHeader && <TopHeader />}
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background.primary } }}>
              {/* The (tabs) group is now a single screen in the root stack */}
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              
              {/* Onboarding screens */}
              <Stack.Screen name="onboarding" options={{ title: 'Choose Your Interests' }} />
              <Stack.Screen name="topics" options={{ title: 'Your Topics' }} />
              <Stack.Screen name="topics-settings" options={{ title: 'Manage Topics' }} />
              
              {/* Auth screens */}
              <Stack.Screen name="login" options={{ title: 'Login' }} />
              <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
              <Stack.Screen name="auth-callback" options={{ title: 'Loading...' }} />
              <Stack.Screen name="verify-email" options={{ title: 'Verify Email' }} />
              <Stack.Screen name="email-verified" options={{ title: 'Email Verified' }} />
              <Stack.Screen name="reset-password" options={{ title: 'Reset Password' }} />
              <Stack.Screen name="reset-password-confirm" options={{ title: 'Confirm Password' }} />
              
              {/* Other screens */}
              <Stack.Screen name="challenge-list" options={{ title: 'Challenges' }} />
              <Stack.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
              <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
              <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
              <Stack.Screen name="response" options={{ title: 'Response' }} />
              <Stack.Screen name="pop-challenge" options={{ title: 'Pop Challenge' }} />
            </Stack>
          </View>
        </AuthWrapper>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
