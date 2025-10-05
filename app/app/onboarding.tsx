import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { databases, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { SelectableCard, ShimmerButton, StaggeredTextReveal, AnimatedCounter } from '../components/ui';
import { THEME } from '../theme';
import { useToast } from '../hooks/useToast';

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
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        
        // Fetch topics
        const res = await databases.listDocuments('synapse', 'topics');
        setTopics(res.documents as unknown as Topic[]);
      } catch (e) {
        showToast((e as Error).message || 'Failed to load topics', 'error');
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
      showToast('Please select at least one topic', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Update user profile with selected topics
      await databases.updateDocument('synapse', 'users', user.$id, {
        selectedTopics
      });
      
      showToast('Your preferences have been saved! 🎉', 'success');
      router.push('/topics');
    } catch (e) {
      showToast((e as Error).message || 'Failed to save preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <StaggeredTextReveal 
          text="Choose Your Interests" 
          style={styles.title}
          staggerDelay={80}
        />
        <Text style={styles.subtitle}>
          Select topics that spark your curiosity. You can change these later.
        </Text>
        <View style={styles.counterContainer}>
          <AnimatedCounter 
            value={selectedTopics.length} 
            style={styles.counterNumber}
          />
          <Text style={styles.counterLabel}> selected</Text>
        </View>
      </View>

      <FlatList
        data={topics}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selectedTopics.includes(item.$id);
          return (
            <SelectableCard
              title={item.name}
              description={item.description}
              selected={isSelected}
              onSelect={() => toggleTopic(item.$id)}
            />
          );
        }}
      />

      <View style={styles.footer}>
        <ShimmerButton
          onPress={handleContinue}
          disabled={loading || selectedTopics.length === 0}
          variant="primary"
        >
          {loading ? 'Saving...' : 'Continue'}
        </ShimmerButton>
      </View>
      
      {ToastComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.dark.bg,
  },
  header: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.neutral.white,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: THEME.neutral[400],
    marginBottom: 16,
    lineHeight: 22,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.primary[500],
  },
  counterLabel: {
    fontSize: 16,
    color: THEME.neutral[500],
    fontWeight: '600',
  },
  list: {
    padding: 24,
    paddingTop: 8,
  },
  footer: {
    padding: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
});
