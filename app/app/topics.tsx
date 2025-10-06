import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { databases, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { TopHeader } from '../components/navigation/TopHeader';

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
    const checkUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        // Load selected topics from user profile
        const userDoc = await databases.getDocument('synapse', 'users', userData.$id);
        setSelectedTopics(userDoc.selectedTopics || []);
      } catch (e) {
        router.push('/login');
      }
    };
    checkUser();

    const fetchTopics = async () => {
      try {
        const res = await databases.listDocuments('synapse', 'topics');
        setTopics(res.documents as unknown as Topic[]);
      } catch (e) {
        Alert.alert('Error', (e as Error).message);
      }
    };
    fetchTopics();
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
      <TopHeader />
      <ScrollView style={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.heading}>Select Topics</Text>
          <Text style={styles.subtitle}>
            Choose topics you're interested in. You can change these anytime in settings.
          </Text>
          <View style={styles.topicsContainer}>
            {topics.map((item) => (
              <TouchableOpacity
                key={item.$id}
                onPress={() => toggleTopic(item.$id)}
                style={[
                  styles.topicCard,
                  selectedTopics.includes(item.$id) && styles.topicCardSelected
                ]}
              >
                <Text style={[
                  styles.topicName,
                  selectedTopics.includes(item.$id) && styles.topicNameSelected
                ]}>
                  {item.name}
                </Text>
                <Text style={[
                  styles.topicDescription,
                  selectedTopics.includes(item.$id) && styles.topicDescriptionSelected
                ]}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => router.push('/challenge-list')}
            style={styles.continueButton}
            disabled={selectedTopics.length === 0}
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
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  inner: {
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 24,
  },
  topicsContainer: {
    marginBottom: 24,
  },
  topicCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333333',
  },
  topicCardSelected: {
    backgroundColor: '#1e3a5f',
    borderColor: '#3b82f6',
  },
  topicName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  topicNameSelected: {
    color: '#60a5fa',
  },
  topicDescription: {
    fontSize: 14,
    color: '#999999',
  },
  topicDescriptionSelected: {
    color: '#93c5fd',
  },
  continueButton: {
    padding: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 32,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
