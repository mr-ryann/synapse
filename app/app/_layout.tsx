import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUserStore } from '../stores/useUserStore';
import { TopHeader } from '../components/navigation/TopHeader';
import { AuthWrapper } from '../components/AuthWrapper';
import { COLORS } from '../theme';

export default function RootLayout() {
  const { user } = useUserStore();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Don't run navigation logic until the root navigation is ready
    if (!navigationState?.key) return;

    // Core redirect logic for the entire app
    const hasCompletedOnboarding = user?.selectedTopics && user.selectedTopics.length > 0;
    const pathname = `/${segments.filter(Boolean).join('/')}` || '/';
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isOnboardingRoute = pathname.startsWith('/onboarding') || pathname.startsWith('/topics');

    if (user) {
      // User is logged in
      if (!hasCompletedOnboarding && !isOnboardingRoute) {
        // New user: must complete onboarding
        if (pathname !== '/onboarding') {
          setTimeout(() => router.replace('/onboarding'), 0);
        }
      } else if (hasCompletedOnboarding && isAuthRoute) {
        // Existing user on an auth screen: send them to home
        if (pathname !== '/home') {
          setTimeout(() => router.replace('/home'), 0);
        }
      }
    } else {
      // User is not logged in
      if (!isAuthRoute && !pathname.startsWith('/auth-callback') && !pathname.startsWith('/verify-email') && !pathname.startsWith('/reset-password')) {
        if (pathname !== '/login') {
          setTimeout(() => router.replace('/login'), 0);
        }
      }
    }
  }, [user, segments, navigationState]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
        <AuthWrapper>
          <View style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
            <TopHeader />
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
