import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { databases, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../theme';

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
  }, [router]);

  const toggleTopic = async (topicId: string) => {
    const newSelected = selectedTopics.includes(topicId)
      ? selectedTopics.filter(id => id !== topicId)
      : [...selectedTopics, topicId];
    setSelectedTopics(newSelected);

    try {
      if (!user) return;
      await databases.updateDocument('synapse', 'users', user.$id, {
        selectedTopics: newSelected,
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
              style={[styles.topicCard, isSelected && styles.topicCardSelected]}
            >
              <Text style={[styles.topicName, isSelected && styles.topicNameSelected]}>
                {topic.name}
              </Text>
              <Text
                style={[styles.topicDescription, isSelected && styles.topicDescriptionSelected]}
                numberOfLines={3}
              >
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
        <Text style={styles.counter}>{selectedTopics.length} selected</Text>
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
        disabled={loading}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
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
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 30,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    letterSpacing: 0.6,
  },
  counter: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.accent.tertiary,
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 28,
  },
  categorySection: {
    gap: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: -6,
  },
  topicCard: {
    width: '48%',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    backgroundColor: COLORS.background.secondary,
    minHeight: 130,
    gap: 8,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  topicCardSelected: {
    borderColor: COLORS.accent.primary,
    backgroundColor: COLORS.background.elevated,
    shadowColor: COLORS.accent.primary,
    shadowOpacity: 0.35,
  },
  topicName: {
    fontSize: 17,
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
    marginHorizontal: 24,
    marginBottom: 28,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
  },
  continueButtonText: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontFamily: FONTS.heading,
    letterSpacing: 0.8,
  },
});
