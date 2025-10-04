import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { databases, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { Query } from 'appwrite';

interface Topic {
  $id: string;
  name: string;
  description: string;
  category?: string;
}

interface GroupedTopics {
  [category: string]: Topic[];
}

export default function TopicsWithCategories() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [groupedTopics, setGroupedTopics] = useState<GroupedTopics>({});
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
        const userDoc = await databases.getDocument('synapse', 'users', userData.$id);
        setSelectedTopics(userDoc.selectedTopics || []);
      } catch (e) {
        router.push('/login');
      }
    };
    init();

    const fetchTopics = async () => {
      try {
        const res = await databases.listDocuments('synapse', 'topics');
        const topicsList = res.documents as unknown as Topic[];
        setTopics(topicsList);
        
        // Group topics by category
        const grouped: GroupedTopics = {};
        topicsList.forEach(topic => {
          const category = topic.category || 'Uncategorized';
          if (!grouped[category]) {
            grouped[category] = [];
          }
          grouped[category].push(topic);
        });
        setGroupedTopics(grouped);
      } catch (e) {
        console.error('Error fetching topics:', e);
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
      console.error('Error updating topics:', e);
    }
  };

  const renderCategory = (category: string, categoryTopics: Topic[]) => (
    <View key={category} style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <View style={styles.topicsGrid}>
        {categoryTopics.map(topic => {
          const isSelected = selectedTopics.includes(topic.$id);
          return (
            <TouchableOpacity
              key={topic.$id}
              onPress={() => toggleTopic(topic.$id)}
              style={[
                styles.topicCard,
                isSelected && styles.topicCardSelected
              ]}
            >
              <Text style={[
                styles.topicName,
                isSelected && styles.topicNameSelected
              ]}>
                {topic.name}
              </Text>
              <Text style={[
                styles.topicDescription,
                isSelected && styles.topicDescriptionSelected
              ]}>
                {topic.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Topics</Text>
        <Text style={styles.counter}>
          {selectedTopics.length} selected
        </Text>
      </View>

      <FlatList
        data={Object.keys(groupedTopics)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => renderCategory(item, groupedTopics[item])}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => router.push('/question')}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  counter: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  topicCard: {
    width: '48%',
    margin: '1%',
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
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
