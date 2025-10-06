import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { account } from '../lib/appwrite';
import { useUserStore } from '../stores';
import { useRouter } from 'expo-router';
import { COLORS } from '../theme/colors';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { setUser, clearUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await account.get();
        if (user) {
          // User is logged in, set user data
          const userData = {
            $id: user.$id,
            email: user.email,
            name: user.name || '',
            selectedTopics: [], // Will be loaded from database
            level: 1,
            xp: 0,
            streak: 0,
            preferences: {
              topics: [],
              difficulty: 1,
            },
          };
          setUser(userData);
        } else {
          clearUser();
        }
      } catch (error) {
        // No session, user not logged in
        clearUser();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
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

  return <>{children}</>;
};
