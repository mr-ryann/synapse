import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { account, databases } from '../lib/appwrite';
import { useRouter } from 'expo-router';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Get current user
        const user = await account.get();
        
        // Check if user has completed onboarding (selected topics)
        try {
          const userDoc = await databases.getDocument('synapse', 'users', user.$id);
          const hasSelectedTopics = userDoc.selectedTopics && userDoc.selectedTopics.length > 0;
          
          if (hasSelectedTopics) {
            // User has already completed onboarding, go to topics
            router.replace('/topics');
          } else {
            // User needs to complete onboarding
            router.replace('/onboarding');
          }
        } catch (err) {
          // User document doesn't exist, redirect to onboarding
          router.replace('/onboarding');
        }
      } catch (e) {
        // Not logged in, redirect to login
        router.replace('/login');
      }
    };

    checkOnboardingStatus();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 20 }}>Loading...</Text>
    </View>
  );
}
