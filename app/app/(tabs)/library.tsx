import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { useUserStore } from '../../stores/useUserStore';
import { databases } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { COLORS, FONTS } from '../../theme';

interface Challenge {
  $id: string;
  title?: string;
  promptText?: string;
  topicName: string;
  topicId: string;
  estimatedTime: number;
  difficulty: number;
}

interface TopicGroup {
  topicName: string;
  topicId: string;
  challenges: Challenge[];
  isExpanded: boolean;
}

export default function LibraryScreen() {
  const { user } = useUserStore();
  const router = useRouter();
  const { expandTopic } = useLocalSearchParams<{ expandTopic?: string }>();
  const [topicGroups, setTopicGroups] = useState<TopicGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllChallenges();
    }
  }, [user]);

  // Handle expandTopic parameter - expand the specified topic
  useEffect(() => {
    if (expandTopic && topicGroups.length > 0) {
      const decodedTopic = decodeURIComponent(expandTopic);
      setTopicGroups(prev => prev.map(group => ({
        ...group,
        isExpanded: group.topicName.toLowerCase() === decodedTopic.toLowerCase(),
      })));
    }
  }, [expandTopic, topicGroups.length]);

  const fetchAllChallenges = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all topics first
      const topicsResponse = await databases.listDocuments(
        'synapse',
        'topics',
        [Query.limit(100)]
      );

      // Fetch all challenges
      const challengesResponse = await databases.listDocuments(
        'synapse',
        'challenges',
        [Query.limit(500)]
      );

      // Group challenges by topic
      const groupedByTopic: { [key: string]: TopicGroup } = {};

      // Initialize groups from topics
      topicsResponse.documents.forEach((topic: any) => {
        groupedByTopic[topic.name] = {
          topicName: topic.name,
          topicId: topic.$id,
          challenges: [],
          isExpanded: false,
        };
      });

      // Assign challenges to their topics
      challengesResponse.documents.forEach((challenge: any) => {
        const topicName = challenge.topicName || 'Uncategorized';
        
        if (!groupedByTopic[topicName]) {
          groupedByTopic[topicName] = {
            topicName: topicName,
            topicId: challenge.topicId || 'unknown',
            challenges: [],
            isExpanded: false,
          };
        }

        groupedByTopic[topicName].challenges.push({
          $id: challenge.$id,
          title: challenge.title || `Challenge ${challenge.$id.slice(-4)}`,
          promptText: challenge.promptText,
          topicName: challenge.topicName,
          topicId: challenge.topicId,
          estimatedTime: challenge.estimatedTime || 5,
          difficulty: challenge.difficulty || 1,
        });
      });

      // Convert to array and filter out empty topics, sort by name
      const topicGroupsArray = Object.values(groupedByTopic)
        .filter(group => group.challenges.length > 0)
        .sort((a, b) => a.topicName.localeCompare(b.topicName));

      // Expand first topic by default
      if (topicGroupsArray.length > 0) {
        topicGroupsArray[0].isExpanded = true;
      }

      setTopicGroups(topicGroupsArray);
    } catch (error) {
      // Error fetching challenges
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicName: string) => {
    // Animate the layout change smoothly
    LayoutAnimation.configureNext({
      duration: 250,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    
    setTopicGroups(prev => prev.map(group => 
      group.topicName === topicName 
        ? { ...group, isExpanded: !group.isExpanded }
        : { ...group, isExpanded: false } // Close all other dropdowns
    ));
  };

  const navigateToChallenge = (challengeId: string) => {
    router.push(`/challenge-player?challengeId=${challengeId}`);
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 1) return 'Easy';
    if (difficulty <= 2) return 'Medium';
    return 'Hard';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 1) return COLORS.accent.secondary;
    if (difficulty <= 2) return COLORS.accent.primary;
    return '#FF6B6B';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent.primary} />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <Text style={styles.heading}>Library</Text>
          <Text style={styles.description}>
            Explore all available challenges across different topics
          </Text>
          
          {topicGroups.length > 0 ? (
            <View style={styles.topicsContainer}>
              {topicGroups.map((group) => (
                <View key={group.topicName} style={styles.topicSection}>
                  {/* Topic Header - Expandable */}
                  <TouchableOpacity
                    style={styles.topicHeader}
                    onPress={() => toggleTopic(group.topicName)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.topicHeaderLeft}>
                      {group.isExpanded ? (
                        <ChevronDown size={24} color={COLORS.accent.primary} />
                      ) : (
                        <ChevronRight size={24} color={COLORS.text.secondary} />
                      )}
                      <Text style={[
                        styles.topicTitle,
                        group.isExpanded && styles.topicTitleExpanded
                      ]}>
                        {group.topicName}
                      </Text>
                    </View>
                    <View style={styles.challengeCountBadge}>
                      <Text style={styles.challengeCountText}>
                        {group.challenges.length}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Challenges List - Collapsible */}
                  {group.isExpanded && (
                    <View style={styles.challengesList}>
                      {group.challenges.map((challenge) => (
                        <TouchableOpacity
                          key={challenge.$id}
                          style={styles.challengeItem}
                          onPress={() => navigateToChallenge(challenge.$id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.challengeInfo}>
                            <Text style={styles.challengeTitle} numberOfLines={2}>
                              {challenge.title}
                            </Text>
                            <View style={styles.challengeMeta}>
                              <Text style={styles.challengeTime}>
                                ~{challenge.estimatedTime} min
                              </Text>
                              <View style={[
                                styles.difficultyBadge,
                                { backgroundColor: getDifficultyColor(challenge.difficulty) + '20' }
                              ]}>
                                <Text style={[
                                  styles.difficultyText,
                                  { color: getDifficultyColor(challenge.difficulty) }
                                ]}>
                                  {getDifficultyLabel(challenge.difficulty)}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <ChevronRight size={20} color={COLORS.text.muted} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                No challenges available at the moment.
                Please check back later.
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={fetchAllChallenges}
              >
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingBottom: 40,
  },
  heading: {
    fontSize: 30,
    fontFamily: FONTS.heading,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    marginTop: 4,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  topicsContainer: {
    gap: 12,
  },
  topicSection: {
    backgroundColor: COLORS.background.elevated,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  topicHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  topicTitle: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  topicTitleExpanded: {
    color: COLORS.accent.primary,
  },
  challengeCountBadge: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  challengeCountText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  challengesList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  challengeInfo: {
    flex: 1,
    marginRight: 12,
  },
  challengeTitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  challengeTime: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.text.muted,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    fontWeight: '600',
  },
  placeholder: {
    backgroundColor: COLORS.background.elevated,
    padding: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: COLORS.accent.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  refreshButtonText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.background.primary,
  },
});
