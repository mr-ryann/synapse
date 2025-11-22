import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { databases, account, safeDatabaseOperation } from '../lib/appwrite';
import { Permission, Role } from 'react-native-appwrite';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, BookOpen, Settings } from 'lucide-react-native';
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

const TabIcon = ({ icon: Icon, label, isActive, onPress }: any) => {
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon 
        size={24} 
        color={isActive ? COLORS.accent.primary : COLORS.text.muted} 
        strokeWidth={isActive ? 2.5 : 2}
      />
      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

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

        const userResult = await safeDatabaseOperation(
          () => databases.getDocument('synapse', 'users', userData.$id),
          'Failed to fetch user data'
        );

        if (userResult.success && userResult.data) {
          setSelectedTopics(userResult.data.selectedTopics || []);
        } else {
          Alert.alert('Error', userResult.error || 'Failed to load user data');
          if (userResult.error?.includes('Session expired') || userResult.error?.includes('No active session')) {
            router.push('/login');
          }
        }
      } catch (e) {
        console.error('Auth error:', e);
        router.push('/login');
      }
    };
    init();

    const fetchTopics = async () => {
      const result = await safeDatabaseOperation(
        () => databases.listDocuments('synapse', 'topics'),
        'Failed to fetch topics'
      );

      if (result.success && result.data) {
        const topicsList = result.data.documents as unknown as Topic[];
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
      } else {
        Alert.alert('Error', result.error || 'Failed to load topics');
        console.error('Error fetching topics:', result.error);
        if (result.error?.includes('Session expired') || result.error?.includes('No active session')) {
          router.push('/login');
        }
      }
    };
    fetchTopics();
  }, [router]);

  const toggleTopic = async (topicId: string) => {
    const newSelected = selectedTopics.includes(topicId)
      ? selectedTopics.filter(id => id !== topicId)
      : [...selectedTopics, topicId];
    setSelectedTopics(newSelected);

    if (!user) return;

    const result = await safeDatabaseOperation(
      async () => {
        // Check if user profile exists first
        try {
          await databases.getDocument('synapse', 'users', user.$id);
          // Profile exists, update it
          return databases.updateDocument('synapse', 'users', user.$id, {
            selectedTopics: newSelected,
            lastActiveDate: new Date().toISOString()
          });
        } catch (e: any) {
          if (e.code === 404) {
            // Profile doesn't exist, create it
            return databases.createDocument(
              'synapse',
              'users',
              user.$id,
              {
                email: user.email,
                selectedTopics: newSelected,
                level: 0,
                xp: 0,
                streak: 0,
                completedChallenges: 0,
                lastActiveDate: new Date().toISOString()
              },
              [
                Permission.read(Role.user(user.$id)),
                Permission.update(Role.user(user.$id)),
                Permission.delete(Role.user(user.$id))
              ]
            );
          }
          throw e;
        }
      },
      'Failed to update topics'
    );

    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to update topics');
      // Revert the selection on error
      setSelectedTopics(selectedTopics);
      if (result.error?.includes('Session expired') || result.error?.includes('No active session')) {
        router.push('/login');
      }
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

  const insets = useSafeAreaInsets();

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

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom }]}>
        <TabIcon 
          icon={Home} 
          label="Home" 
          isActive={false}
          onPress={() => router.push('/home')}
        />
        <TabIcon 
          icon={Search} 
          label="Search" 
          isActive={false}
          onPress={() => router.push('/search')}
        />
        <TabIcon 
          icon={BookOpen} 
          label="Library" 
          isActive={false}
          onPress={() => router.push('/library')}
        />
        <TabIcon 
          icon={Settings} 
          label="Settings" 
          isActive={false}
          onPress={() => router.push('/settings')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    backgroundColor: COLORS.background.secondary,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.heading,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  counter: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
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
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    paddingTop: 12,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.text.muted,
    marginTop: 4,
  },
  tabLabelActive: {
    color: COLORS.accent.primary,
    fontWeight: '600',
  },
});
