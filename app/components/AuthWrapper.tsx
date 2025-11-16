import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { account, databases } from '../lib/appwrite';
import { useUserStore } from '../stores';
import { useRouter } from 'expo-router';
import { COLORS } from '../theme/colors';
import { ID, Permission, Role } from 'react-native-appwrite';

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
          // User is logged in, now fetch or create their database document
          try {
            // Try to get the user document from the database
            const userDoc = await databases.getDocument('synapse', 'users', user.$id);
            
            // User document exists, use it
            let parsedPreferences = { topics: [], difficulty: 1 };
            try {
              if (typeof userDoc.preferences === 'string') {
                parsedPreferences = JSON.parse(userDoc.preferences);
              } else if (typeof userDoc.preferences === 'object') {
                parsedPreferences = userDoc.preferences;
              }
            } catch (e) {
              // Error parsing preferences, using defaults
            }

            const userData = {
              $id: userDoc.$id,
              email: userDoc.email,
              name: user.name || '',
              selectedTopics: userDoc.selectedTopics || [],
              level: userDoc.level || 1,
              xp: userDoc.xp || 0,
              currentStreak: 0,
              longestStreak: 0,
              totalChallengesCompleted: 0,
              onboardingCompleted: (userDoc.selectedTopics && userDoc.selectedTopics.length > 0) || false,
              streak: userDoc.streak || 0,
              preferences: parsedPreferences,
            };
            setUser(userData);
          } catch (docError: any) {
            // Document doesn't exist (404), create it
            if (docError.code === 404) {
              const newUserDoc = await databases.createDocument(
                'synapse',
                'users',
                user.$id,
                {
                  email: user.email,
                  selectedTopics: [],
                  bio: '',
                  level: 1,
                  xp: 0,
                  streak: 0,
                  preferences: JSON.stringify({
                    topics: [],
                    difficulty: 1,
                  }),
                },
                [
                  Permission.read(Role.user(user.$id)),
                  Permission.update(Role.user(user.$id)),
                  Permission.delete(Role.user(user.$id)),
                ]
              );
              
              const userData = {
                $id: newUserDoc.$id,
                email: newUserDoc.email,
                name: user.name || '',
                selectedTopics: [],
                level: 1,
                xp: 0,
                currentStreak: 0,
                longestStreak: 0,
                totalChallengesCompleted: 0,
                onboardingCompleted: false,
                streak: 0,
                preferences: {
                  topics: [],
                  difficulty: 1,
                },
              };
              setUser(userData);
            } else {
              // Some other error occurred
              clearUser();
            }
          }
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

  return (
    <View style={styles.container}>
      {children}
      {isLoading && (
        <View style={[StyleSheet.absoluteFillObject, styles.overlay]}>
          <ActivityIndicator size="large" color={COLORS.accent.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
});
