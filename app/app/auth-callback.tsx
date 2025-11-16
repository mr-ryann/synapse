import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { account, databases, functions } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { useUserStore } from '../stores';
import { COLORS } from '../theme';

export default function AuthCallback() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('Getting user info...');
        
        // Get current user after OAuth
        const user = await account.get();
        const session = await account.getSession('current');
        
        setStatus('Setting up your profile...');
        
        // Call oauth-callback function to create/update user profile
        try {
          const result = await functions.createExecution(
            'oauth-callback',
            JSON.stringify({
              userId: user.$id,
              session: session.$id
            })
          );
          
          const response = JSON.parse(result.responseBody);
          
          if (response.success) {
            const profile = response.data.profile;
            const isNewUser = response.data.isNewUser;
            
            // Set user data in store
            const userData = {
              $id: user.$id,
              email: profile.email || user.email,
              name: profile.username || user.name || '',
              selectedTopics: profile.selectedTopics || [],
              level: profile.level || 1,
              xp: profile.xp || 0,
              currentStreak: profile.currentStreak || 0,
              longestStreak: profile.longestStreak || 0,
              totalChallengesCompleted: profile.totalChallengesCompleted || 0,
              onboardingCompleted: profile.onboardingCompleted || false,
            };
            setUser(userData);
            
            setStatus('Redirecting...');
            
            // Navigate based on profile status
            if (isNewUser || !profile.onboardingCompleted || userData.selectedTopics.length === 0) {
              router.replace('/onboarding');
            } else {
              router.replace('/topics');
            }
          } else {
            throw new Error(response.error || 'Failed to setup profile');
          }
        } catch (funcErr) {
          console.error('OAuth callback function error:', funcErr);
          
          // Fallback: try to get user document directly
          try {
            const userDoc = await databases.getDocument('synapse', 'users', user.$id);
            const userData = {
              $id: user.$id,
              email: userDoc.email || user.email,
              name: userDoc.username || user.name || '',
              selectedTopics: userDoc.selectedTopics || [],
              level: userDoc.level || 1,
              xp: userDoc.xp || 0,
              currentStreak: userDoc.currentStreak || 0,
              longestStreak: userDoc.longestStreak || 0,
              totalChallengesCompleted: userDoc.totalChallengesCompleted || 0,
              onboardingCompleted: userDoc.onboardingCompleted || false,
            };
            setUser(userData);
            
            const hasSelectedTopics = userData.selectedTopics.length > 0;
            router.replace(hasSelectedTopics ? '/topics' : '/onboarding');
          } catch (dbErr) {
            // User document doesn't exist, redirect to onboarding
            setUser({
              $id: user.$id,
              email: user.email,
              name: user.name || '',
              selectedTopics: [],
              level: 1,
              xp: 0,
              currentStreak: 0,
              longestStreak: 0,
              totalChallengesCompleted: 0,
              onboardingCompleted: false,
            });
            router.replace('/onboarding');
          }
        }
      } catch (e) {
        console.error('Auth callback error:', e);
        Alert.alert('Authentication Error', 'Failed to complete sign in. Please try again.');
        router.replace('/login');
      }
    };

    handleAuthCallback();
  }, [router, setUser]);

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background.primary,
    }}>
  <ActivityIndicator size="large" color={COLORS.accent.primary} />
      <Text style={{
        marginTop: 20,
        color: COLORS.text.primary,
      }}>
        {status}
      </Text>
    </View>
  );
}
