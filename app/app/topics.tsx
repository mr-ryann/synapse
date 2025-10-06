import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { databases, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../theme';

interface Topic {
  $id: string;
  name: string;
  description: string;
}

export default function Topics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        // Load selected topics from user profile
        const userDoc = await databases.getDocument('synapse', 'users', userData.$id);
        setSelectedTopics(userDoc.selectedTopics || []);
        // Derive unique topics from challenges collection
        const res = await databases.listDocuments('synapse', 'challenges');
        const docs = res.documents as Array<any>;
        const uniqueNames = Array.from(new Set(docs.map(d => d.topicName)));
        const derivedTopics: Topic[] = uniqueNames.map(name => ({
          $id: name,
          name,
          description: '',
        }));
        setTopics(derivedTopics);
      } catch (e) {
        router.push('/login');
      }
    };
    init();
  }, []);

  const toggleTopic = async (topicId: string) => {
    const newSelected = selectedTopics.includes(topicId)
      ? selectedTopics.filter(id => id !== topicId)
      : [...selectedTopics, topicId];
    setSelectedTopics(newSelected);
    try {
      await databases.updateDocument('synapse', 'users', user.$id, {
        selectedTopics: newSelected
      });
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.heading}>Select Topics</Text>
          <Text style={styles.subtitle}>
            Choose topics you're interested in. You can change these anytime in settings.
          </Text>
          <View style={styles.topicsContainer}>
            {topics.map((item) => {
              const isSelected = selectedTopics.includes(item.$id);
              return (
                <TouchableOpacity
                  key={item.$id}
                  onPress={() => toggleTopic(item.$id)}
                  activeOpacity={0.85}
                  style={[
                    styles.topicCard,
                    isSelected && styles.topicCardSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.topicName,
                      isSelected && styles.topicNameSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.topicDescription,
                      isSelected && styles.topicDescriptionSelected,
                    ]}
                  >
                    {item.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            onPress={() => router.push('/challenge-list')}
            style={[
              styles.continueButton,
              selectedTopics.length === 0 && styles.continueButtonDisabled,
            ]}
            disabled={selectedTopics.length === 0}
            activeOpacity={0.9}
          >
            <Text style={styles.continueButtonText}>
              Continue {selectedTopics.length > 0 && `(${selectedTopics.length} selected)`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
  },
  heading: {
    fontSize: 32,
    color: COLORS.text.primary,
    fontFamily: FONTS.heading,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontFamily: FONTS.body,
    lineHeight: 22,
  },
  topicsContainer: {
    gap: 16,
    marginTop: 8,
  },
  topicCard: {
    padding: 20,
    backgroundColor: COLORS.background.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    gap: 6,
  },
  topicCardSelected: {
    borderColor: COLORS.accent.primary,
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  topicName: {
    fontSize: 20,
    color: COLORS.text.primary,
    fontFamily: FONTS.heading,
  },
  topicNameSelected: {
    color: COLORS.accent.primary,
  },
  topicDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontFamily: FONTS.body,
    lineHeight: 20,
  },
  topicDescriptionSelected: {
    color: COLORS.text.primary,
  },
  continueButton: {
    paddingVertical: 18,
    borderRadius: 999,
    backgroundColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 32,
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.border.default,
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: COLORS.background.primary,
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
