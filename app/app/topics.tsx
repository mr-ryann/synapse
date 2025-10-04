import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { databases, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';

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
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Select Topics</Text>
      <FlatList
        data={topics}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleTopic(item.$id)}
            style={{
              padding: 10,
              marginBottom: 10,
              backgroundColor: selectedTopics.includes(item.$id) ? 'lightblue' : 'white',
              borderWidth: 1
            }}
          >
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
            <Text>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        onPress={() => router.push('/question')}
        style={{ padding: 15, backgroundColor: 'blue', marginTop: 20 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Get Question</Text>
      </TouchableOpacity>
    </View>
  );
}
