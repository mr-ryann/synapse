import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { databases, account, safeDatabaseOperation } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../theme';
import { Check } from 'lucide-react-native';

interface Topic {
  name: string;
  count: number;
}

export default function TopicsSettings() {
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
        
        // Load selected topics from user profile
        const userResult = await safeDatabaseOperation(
          () => databases.getDocument('synapse', 'users', userData.$id),
          'Failed to load user data'
        );

        if (!userResult.success || !userResult.data) {
          Alert.alert('Error', userResult.error || 'Failed to load user data');
          if (userResult.error?.includes('Session expired') || userResult.error?.includes('No active session')) {
            router.push('/login');
          }
          return;
        }

        setSelectedTopics(userResult.data.selectedTopics || []);
        
        // Fetch all challenges and group by topicName
        const challengesResult = await safeDatabaseOperation(
          () => databases.listDocuments('synapse', 'challenges'),
          'Failed to load challenges'
        );

        if (!challengesResult.success || !challengesResult.data) {
          Alert.alert('Error', challengesResult.error || 'Failed to load topics');
          if (challengesResult.error?.includes('Session expired') || challengesResult.error?.includes('No active session')) {
            router.push('/login');
          }
          return;
        }

        const challenges = challengesResult.data.documents;
        
        // Group challenges by topicName and count them
        const topicMap = new Map<string, number>();
        challenges.forEach((challenge: any) => {
          const topicName = challenge.topicName;
          if (topicName) {
            topicMap.set(topicName, (topicMap.get(topicName) || 0) + 1);
          }
        });
        
        // Convert to Topic array
        const derivedTopics: Topic[] = Array.from(topicMap.entries()).map(([name, count]) => ({
          name,
          count,
        }));
        
        setTopics(derivedTopics);
      } catch (e) {
        console.error('Error in init:', e);
        Alert.alert('Error', 'Failed to load topics');
        router.back();
      }
    };
    init();
  }, []);

  const toggleTopic = (topicName: string) => {
    const newSelected = selectedTopics.includes(topicName)
      ? selectedTopics.filter(name => name !== topicName)
      : [...selectedTopics, topicName];
    setSelectedTopics(newSelected);
  };

  const saveTopics = async () => {
    if (selectedTopics.length === 0) {
      Alert.alert('Error', 'Please select at least one topic');
      return;
    }

    setLoading(true);
    try {
      const result = await safeDatabaseOperation(
        () => databases.updateDocument('synapse', 'users', user.$id, {
          selectedTopics: selectedTopics
        }),
        'Failed to update topics'
      );

      if (result.success) {
        Alert.alert('Success', 'Topics updated successfully');
        router.back();
      } else {
        Alert.alert('Error', result.error || 'Failed to update topics');
        if (result.error?.includes('Session expired') || result.error?.includes('No active session')) {
          router.push('/login');
        }
      }
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.heading}>Select Your Topics</Text>
          <Text style={styles.subtitle}>
            Choose topics that interest you to personalize your challenges
          </Text>

          <View style={styles.topicsGrid}>
            {topics.map((topic) => {
              const isSelected = selectedTopics.includes(topic.name);
              return (
                <TouchableOpacity
                  key={topic.name}
                  onPress={() => toggleTopic(topic.name)}
                  activeOpacity={0.7}
                  style={[
                    styles.topicCard,
                    isSelected && styles.topicCardSelected,
                  ]}
                >
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Check size={20} color={COLORS.background.primary} />
                    </View>
                  )}
                  <Text style={[
                    styles.topicName,
                    isSelected && styles.topicNameSelected,
                  ]}>
                    {topic.name}
                  </Text>
                  <Text style={[
                    styles.topicCount,
                    isSelected && styles.topicCountSelected,
                  ]}>
                    {topic.count} challenges
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={saveTopics}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Topics'}
          </Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 28,
    color: COLORS.text.primary,
    fontFamily: FONTS.heading,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontFamily: FONTS.body,
    lineHeight: 22,
  },
  topicsGrid: {
    gap: 12,
    marginTop: 12,
  },
  topicCard: {
    padding: 20,
    backgroundColor: COLORS.background.elevated,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    position: 'relative',
  },
  topicCardSelected: {
    borderColor: COLORS.accent.primary,
    backgroundColor: COLORS.background.secondary,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicName: {
    fontSize: 20,
    color: COLORS.text.primary,
    fontFamily: FONTS.heading,
    fontWeight: '600',
    marginBottom: 6,
  },
  topicNameSelected: {
    color: COLORS.text.primary,
  },
  topicCount: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontFamily: FONTS.body,
  },
  topicCountSelected: {
    color: COLORS.text.secondary,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  saveButton: {
    backgroundColor: COLORS.accent.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.background.primary,
    fontFamily: FONTS.heading,
  },
});
