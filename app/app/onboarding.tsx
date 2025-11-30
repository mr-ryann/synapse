import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { databases, account } from '../lib/appwrite';
import { Permission, Role, ID } from 'react-native-appwrite';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../theme';

interface Topic {
  $id: string;
  name: string;
  description: string;
}

export default function Onboarding() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        
        // Fetch topics
        const res = await databases.listDocuments('synapse', 'topics');
        setTopics(res.documents as unknown as Topic[]);
      } catch (e) {
        Alert.alert('Error', (e as Error).message);
        router.push('/login');
      }
    };
    init();
  }, []);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleContinue = async () => {
    if (selectedTopics.length === 0) {
      Alert.alert('Please select at least one topic');
      return;
    }

    setLoading(true);
    try {
      // Check if user profile document exists
      let userProfile;
      try {
        userProfile = await databases.getDocument('synapse', 'users', user.$id);
      } catch (e: any) {
        userProfile = null;
      }

      if (userProfile) {
        const updated = await databases.updateDocument('synapse', 'users', user.$id, {
          selectedTopics,
          lastActiveDate: new Date().toISOString()
        });
      } else {
        const permissions = [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id))
        ];
        
        const created = await databases.createDocument(
          'synapse',
          'users',
          user.$id, // Use auth user ID as document ID
          {
            email: user.email,
            selectedTopics,
            level: 0,
            xp: 0,
            streak: 0,
            completedChallenges: 0,
            lastActiveDate: new Date().toISOString()
          },
          permissions
        );
      }
      
      Alert.alert('Success', 'Your preferences have been saved!');
      router.push('/home');
    } catch (e: any) {
      Alert.alert('Error', `${e.message}\n\nCode: ${e.code || 'unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <FlatList
        data={topics}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={(
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Interests</Text>
            <Text style={styles.subtitle}>
              Select topics that spark your curiosity. You can change these later.
            </Text>
            <Text style={styles.counter}>
              {selectedTopics.length} selected
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isSelected = selectedTopics.includes(item.$id);
          return (
            <TouchableOpacity
              onPress={() => toggleTopic(item.$id)}
              style={[
                styles.topicCard,
                isSelected && styles.topicCardSelected
              ]}
            >
              <Text style={[
                styles.topicName,
                isSelected && styles.topicNameSelected
              ]}>
                {item.name}
              </Text>
              <Text style={[
                styles.topicDescription,
                isSelected && styles.topicDescriptionSelected
              ]}>
                {item.description}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={[
          styles.continueButton,
          selectedTopics.length === 0 && styles.continueButtonDisabled
        ]}
        onPress={handleContinue}
        disabled={loading || selectedTopics.length === 0}
      >
        <Text style={styles.continueButtonText}>
          {loading ? 'Saving...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  counter: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.accent.tertiary,
    letterSpacing: 1,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  topicCard: {
    flex: 1,
    margin: 6,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    backgroundColor: COLORS.background.elevated,
    minHeight: 140,
    gap: 8,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  topicCardSelected: {
    borderColor: COLORS.accent.primary,
    backgroundColor: COLORS.background.secondary,
    shadowColor: COLORS.accent.primary,
    shadowOpacity: 0.25,
  },
  topicName: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
  },
  topicNameSelected: {
    color: COLORS.accent.primary,
  },
  topicDescription: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  topicDescriptionSelected: {
    color: COLORS.text.primary,
  },
  continueButton: {
    backgroundColor: COLORS.accent.primary,
    paddingVertical: 20,
    paddingHorizontal: 24,
    margin: 24,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.border.subtle,
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontFamily: FONTS.heading,
    letterSpacing: 0.8,
  },
});
