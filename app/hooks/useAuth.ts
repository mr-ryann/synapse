import { useState } from 'react';
import { Alert } from 'react-native';
import { account, databases } from '../lib/appwrite';
import { ID, OAuthProvider } from 'react-native-appwrite';
import { useRouter } from 'expo-router';
import { useUserStore } from '../stores';

/**
 * Custom hook for authentication operations
 * Handles login, signup, OAuth, and onboarding flow
 */
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser, clearUser } = useUserStore();

  /**
   * Check if user has completed onboarding (selected topics)
   * Returns true if topics are selected, false otherwise
   */
  const checkOnboardingStatus = async (userId: string): Promise<boolean> => {
    try {
      const userDoc = await databases.getDocument('synapse', 'users', userId);
      return userDoc.selectedTopics && userDoc.selectedTopics.length > 0;
    } catch (err) {
      // If user document doesn't exist, onboarding not complete
      return false;
    }
  };

  /**
   * Navigate user based on onboarding status
   * If topics selected -> /topics, otherwise -> /onboarding
   */
  const navigateAfterAuth = async (userId: string, userName?: string, userEmail?: string) => {
    try {
      const userDoc = await databases.getDocument('synapse', 'users', userId);
      const user = {
        $id: userId,
        email: userEmail || userDoc.email,
        name: userName || userDoc.username,
        selectedTopics: userDoc.selectedTopics || [],
        level: userDoc.level || 1,
        xp: userDoc.xp || 0,
        currentStreak: userDoc.currentStreak || 0,
        longestStreak: userDoc.longestStreak || 0,
        totalChallengesCompleted: userDoc.totalChallengesCompleted || 0,
        onboardingCompleted: userDoc.onboardingCompleted || false,
        lastActivityDate: userDoc.lastActivityDate,
        emailVerified: userDoc.emailVerified,
      };
      setUser(user);

      const hasSelectedTopics = user.selectedTopics.length > 0;
      
      Alert.alert('Success', `Welcome ${hasSelectedTopics ? 'back' : ''}, ${userName || userEmail}!`);
      
      if (hasSelectedTopics) {
        router.replace('/home');
      } else {
        router.replace('/onboarding');
      }
    } catch (err) {
      // If user document doesn't exist, onboarding not complete
      const user = {
        $id: userId,
        email: userEmail || '',
        name: userName,
        selectedTopics: [],
        level: 1,
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalChallengesCompleted: 0,
        onboardingCompleted: false,
      };
      setUser(user);
      router.replace('/onboarding');
    }
  };

  /**
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate password strength
   */
  const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' };
    }
    return { isValid: true };
  };

  /**
   * Handle email/password login
   */
  const loginWithEmail = async (email: string, password: string) => {
    // Validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Check if there's already an active session
      try {
        const existingUser = await account.get();
        if (existingUser) {
          // Delete existing session first
          await account.deleteSession('current');
          clearUser();
        }
      } catch (e) {
        // No existing session, continue with login
      }

      // Create new session
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      await navigateAfterAuth(user.$id, user.name, user.email);
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth login
   */
  const loginWithGoogle = async (successUrl: string, failureUrl: string) => {
    try {
      // Check if there's already an active session
      try {
        const existingUser = await account.get();
        if (existingUser) {
          // Delete existing session first
          await account.deleteSession('current');
          clearUser();
        }
      } catch (e) {
        // No existing session, continue with OAuth
      }

      // Note: OAuth in web will open in popup/redirect, not work perfectly in Expo web
      account.createOAuth2Session(
        OAuthProvider.Google,
        successUrl, // Will redirect to auth-callback to check onboarding
        failureUrl
      );
    } catch (e) {
      Alert.alert('Error', 'Google Sign-In is only available on mobile devices. Please use email/password login on web.');
    }
  };

  /**
   * Handle email/password signup
   */
  const signupWithEmail = async (
    email: string,
    password: string,
    confirmPassword: string,
    name: string
  ) => {
    // Validation
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert('Error', passwordValidation.error || 'Invalid password');
      return;
    }

    setLoading(true);
    try {
      // Check if there's already an active session
      try {
        const existingUser = await account.get();
        if (existingUser) {
          // Delete existing session first
          await account.deleteSession('current');
          clearUser();
        }
      } catch (e) {
        // No existing session, continue with signup
      }

      // Create account
      await account.create(ID.unique(), email, password, name);
      
      // Log in the user
      await account.createEmailPasswordSession(email, password);
      
      Alert.alert('Success', 'Account created successfully!');
      
      // Always navigate to onboarding for new users
      router.replace('/onboarding');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth signup
   */
  const signupWithGoogle = async (successUrl: string, failureUrl: string) => {
    try {
      account.createOAuth2Session(
        OAuthProvider.Google,
        successUrl, // Will redirect to auth-callback to check onboarding
        failureUrl
      );
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  /**
   * Handle logout
   */
  const logout = async () => {
    try {
      await account.deleteSession('current');
      clearUser();
      router.push('/login');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  return {
    loading,
    loginWithEmail,
    loginWithGoogle,
    signupWithEmail,
    signupWithGoogle,
    logout,
    checkOnboardingStatus,
    validateEmail,
    validatePassword,
  };
};
