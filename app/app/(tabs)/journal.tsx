import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Clock, Trophy, ChevronRight, Calendar } from 'lucide-react-native';
import { useUserStore } from '../../stores/useUserStore';
import { databases } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { COLORS, FONTS } from '../../theme';

interface JournalEntry {
  $id: string;
  challengeId: string;
  challengeTitle: string;
  topicName: string;
  completedAt: string;
  thinkingTime: number;
  xpEarned: number;
  difficulty: number;
}

export default function JournalScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

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
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
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

          {/* Stats Summary */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Trophy size={20} color={COLORS.accent.primary} />
              <Text style={styles.statValue}>{entries.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={20} color={COLORS.accent.secondary} />
              <Text style={styles.statValue}>
                {formatTime(entries.reduce((sum, e) => sum + e.thinkingTime, 0))}
              </Text>
              <Text style={styles.statLabel}>Think Time</Text>
            </View>
            <View style={styles.statItem}>
              <BookOpen size={20} color={COLORS.text.secondary} />
              <Text style={styles.statValue}>
                {entries.reduce((sum, e) => sum + e.xpEarned, 0)}
              </Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
          </View>

          {/* Journal Entries */}
          {entries.length > 0 ? (
            Object.entries(groupedEntries).map(([dateStr, dayEntries]) => (
              <View key={dateStr} style={styles.dateGroup}>
                <View style={styles.dateHeader}>
                  <Calendar size={16} color={COLORS.text.muted} />
                  <Text style={styles.dateText}>{formatDate(dayEntries[0].completedAt)}</Text>
                </View>
                
                {dayEntries.map((entry) => (
                  <TouchableOpacity
                    key={entry.$id}
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
                      <View style={styles.entryStats}>
                        <Text style={styles.entryStat}>
                          <Clock size={12} color={COLORS.text.muted} /> {formatTime(entry.thinkingTime)}
                        </Text>
                        <Text style={styles.entryStat}>
                          +{entry.xpEarned} XP
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color={COLORS.text.muted} />
                  </TouchableOpacity>
                ))}
              </View>
            ))
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
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.elevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.text.muted,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingLeft: 4,
  },
  dateText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.text.muted,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.elevated,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
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
  entryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  entryStat: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.text.muted,
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
