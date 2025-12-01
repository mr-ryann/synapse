import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Clock, ChevronRight, Calendar } from 'lucide-react-native';
import { useUserStore } from '../../stores/useUserStore';
import { databases } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { COLORS, FONTS } from '../../theme';
import { AdvancedAnalytics } from '../../components/ui/AdvancedAnalytics';
import { useAnalytics } from '../../hooks/useAnalytics';

interface JournalEntry {
  $id: string;
  challengeId: string;
  challengeTitle: string;
  topicName: string;
  completedAt: string;
  thinkingTime: number;
  xpEarned: number;
  difficulty: number;
  thinkingTimes?: number[]; // Array of times per question
}

// Response data for advanced analytics
interface ResponseData {
  thinkingTime: number;
  xpEarned: number;
  topicName: string;
  thinkingTimes?: number[];
}

export default function JournalScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  
  // Use the unified analytics hook
  const { analytics, loading: analyticsLoading } = useAnalytics(timeRange);

  useEffect(() => {
    if (user) {
      fetchJournalEntries();
    }
  }, [user]);

  const fetchJournalEntries = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch user's completed challenges from the responses collection
      const responsesRes = await databases.listDocuments(
        'synapse',
        'responses',
        [
          Query.equal('userID', user.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(100),
        ]
      );

      // Get unique challenge IDs to fetch challenge details
      const challengeIds = [...new Set(
        responsesRes.documents
          .map((doc: any) => doc.challengeID || doc.challengeId)
          .filter(Boolean)
      )];

      // Fetch challenge details for all unique challenges
      const challengeDetailsMap: Record<string, { title: string; topicName: string; difficulty: number }> = {};
      
      // Fetch challenges in batches (Appwrite limit)
      for (const challengeId of challengeIds) {
        try {
          const challenge = await databases.getDocument('synapse', 'challenges', challengeId as string);
          challengeDetailsMap[challengeId as string] = {
            title: challenge.title || challenge.topicName || 'Challenge',
            topicName: challenge.topicName || 'General',
            difficulty: challenge.difficulty || 1,
          };
        } catch {
          // Challenge may have been deleted
          challengeDetailsMap[challengeId as string] = {
            title: 'Challenge',
            topicName: 'General',
            difficulty: 1,
          };
        }
      }

      // Map responses to journal entries with real challenge names
      const journalEntries: JournalEntry[] = responsesRes.documents.map((doc: any) => {
        const challengeId = doc.challengeID || doc.challengeId || '';
        const challengeDetails = challengeDetailsMap[challengeId] || {
          title: 'Challenge',
          topicName: 'General',
          difficulty: 1,
        };
        
        return {
          $id: doc.$id,
          challengeId: challengeId,
          challengeTitle: challengeDetails.title,
          topicName: challengeDetails.topicName,
          completedAt: doc.completedAt || doc.$createdAt,
          thinkingTime: doc.totalThinkingTime || doc.thinkingTime || 0,
          xpEarned: doc.totalXpEarned || doc.xpEarned || 0,
          difficulty: challengeDetails.difficulty,
          thinkingTimes: doc.thinkingTimes || [],
        };
      });

      setEntries(journalEntries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Reset time to midnight for accurate day comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    
    // Show actual date in "Month Day, Year" format
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
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

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.completedAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, JournalEntry[]>);

  // Sort grouped entries by date (most recent first)
  const sortedGroupedEntries = Object.entries(groupedEntries).sort(([dateA], [dateB]) => {
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.primary} />
          <Text style={styles.loadingText}>Loading your journey...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <Text style={styles.heading}>Journal</Text>
          <Text style={styles.subtitle}>Your thinking journey</Text>

          {/* Analytics Graph - Replaces old stats row */}
          {analytics && entries.length > 0 && (
            <AdvancedAnalytics
              responses={entries.map(e => ({
                thinkingTime: e.thinkingTime,
                xpEarned: e.xpEarned,
                topicName: e.topicName,
                thinkingTimes: e.thinkingTimes,
              }))}
              level={analytics.level}
              xp={analytics.xp}
              streak={analytics.currentStreak}
            />
          )}
          
          {analyticsLoading && !analytics && (
            <View style={styles.graphPlaceholder}>
              <ActivityIndicator size="small" color={COLORS.accent.primary} />
            </View>
          )}

          {/* Section Header */}
          <Text style={styles.sectionTitle}>Traces</Text>

          {/* Journal Entries with Timeline */}
          {entries.length > 0 ? (
            <View style={styles.timelineContainer}>
              {/* Vertical timeline line */}
              <View style={styles.timelineLine} />
              
              {sortedGroupedEntries.map(([dateStr, dayEntries], groupIndex) => (
                <View key={dateStr} style={styles.dateGroup}>
                  {/* Date marker on timeline */}
                  <View style={styles.dateMarker}>
                    <View style={styles.dateMarkerDot} />
                    <Text style={styles.dateText}>{formatDate(dayEntries[0].completedAt)}</Text>
                  </View>
                  
                  {dayEntries.map((entry, entryIndex) => (
                    <View key={entry.$id} style={styles.timelineEntry}>
                      {/* Timeline connector dot */}
                      <View style={styles.entryDot} />
                      
                      <TouchableOpacity
                        style={styles.entryCard}
                        onPress={() => router.push(`/challenge-player?challengeId=${entry.challengeId}`)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.entryContent}>
                          <Text style={styles.entryTitle} numberOfLines={2}>
                            {entry.challengeTitle}
                          </Text>
                          <View style={styles.entryMeta}>
                            <Text style={styles.entryTopic}>{entry.topicName}</Text>
                            <View style={[
                              styles.difficultyBadge,
                              { backgroundColor: getDifficultyColor(entry.difficulty) + '20' }
                            ]}>
                              <Text style={[
                                styles.difficultyText,
                                { color: getDifficultyColor(entry.difficulty) }
                              ]}>
                                {getDifficultyLabel(entry.difficulty)}
                              </Text>
                            </View>
                          </View>
                          {/* Completed date inside card */}
                          <Text style={styles.completedDate}>
                            {new Date(entry.completedAt).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric' 
                            })}
                          </Text>
                          <View style={styles.entryStats}>
                            <View style={styles.statItem}>
                              <Clock size={12} color={COLORS.text.muted} />
                              <Text style={styles.entryStat}>{formatTime(entry.thinkingTime)}</Text>
                            </View>
                            <Text style={styles.xpStat}>+{entry.xpEarned} XP</Text>
                          </View>
                        </View>
                        <ChevronRight size={20} color={COLORS.text.muted} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <BookOpen size={48} color={COLORS.text.muted} />
              <Text style={styles.emptyTitle}>Your journal is empty</Text>
              <Text style={styles.emptyText}>
                Complete challenges to build your thinking history
              </Text>
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => router.push('/library')}
              >
                <Text style={styles.startButtonText}>Browse Challenges</Text>
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
    paddingBottom: 100,
  },
  heading: {
    fontSize: 30,
    fontFamily: FONTS.heading,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  graphPlaceholder: {
    height: 300,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    marginTop: 24,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: 6,
    top: 8,
    bottom: 20,
    width: 2,
    backgroundColor: COLORS.accent.primary + '40',
    borderRadius: 1,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: -20,
  },
  dateMarkerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.accent.primary,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  dateText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  timelineEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    marginLeft: -20,
  },
  entryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent.secondary,
    marginTop: 18,
    marginRight: 12,
    marginLeft: 3,
  },
  entryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.elevated,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent.primary + '60',
  },
  entryContent: {
    flex: 1,
    marginRight: 8,
  },
  entryTitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  entryTopic: {
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
    fontSize: 11,
    fontFamily: FONTS.body,
    fontWeight: '600',
  },
  completedDate: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: COLORS.text.muted,
    marginBottom: 6,
  },
  entryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryStat: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.text.muted,
  },
  xpStat: {
    fontSize: 12,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.accent.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: COLORS.accent.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.background.primary,
  },
});
