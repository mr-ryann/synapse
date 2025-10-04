import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { databases, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';

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
      // Update user profile with selected topics
      await databases.updateDocument('synapse', 'users', user.$id, {
        selectedTopics
      });
      
      Alert.alert('Success', 'Your preferences have been saved!');
      router.push('/topics');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Interests</Text>
        <Text style={styles.subtitle}>
          Select topics that spark your curiosity. You can change these later.
        </Text>
        <Text style={styles.counter}>
          {selectedTopics.length} selected
        </Text>
      </View>

      <FlatList
        data={topics}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        contentContainerStyle={styles.grid}
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
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  counter: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  grid: {
    padding: 10,
  },
  topicCard: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    minHeight: 120,
  },
  topicCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  topicNameSelected: {
    color: '#007AFF',
  },
  topicDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  topicDescriptionSelected: {
    color: '#0066CC',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
