import { useState, useEffect, useCallback } from 'react';
import { functions, databases } from '../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { useUserStore } from '../stores/useUserStore';

export interface ActivityDataPoint {
  date: string; // YYYY-MM-DD
  challenges: number;
  xp: number;
  thinkingTime: number;
}

export interface TopicProgress {
  topicId: string;
  topicName: string;
  completed: number;
  totalXp: number;
}

export interface AnalyticsData {
  // Core gamification
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalChallenges: number;
  
  // Time-based
  averageThinkingTime: number;
  totalThinkingTime: number;
  
  // Trends
  trend: 'up' | 'down' | 'stable';
  recentActivity: number;
  previousActivity: number;
  
  // Topic breakdown
  topicProgress: Record<string, TopicProgress>;
  
  // Activity data for graphs
  activityData: ActivityDataPoint[];
  
  // Activity calendar (for heatmap - date -> count)
  activityCalendar: Record<string, number>;
  
  // Computed
  nextLevelXp: number;
  xpProgress: number; // 0-100 percentage to next level
}

const XP_PER_LEVEL = 100;

export function useAnalytics(timeRange: '7d' | '30d' | 'all' = '30d') {
  const { user } = useUserStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.$id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate date range
      const now = new Date();
      let daysBack = 30;
      if (timeRange === '7d') daysBack = 7;
      else if (timeRange === 'all') daysBack = 365;

      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - daysBack);

      // Fetch responses directly for more granular control
      const responsesRes = await databases.listDocuments(
        'synapse',
        'responses',
        [
          Query.equal('userID', user.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(500),
        ]
      );

      const responses = responsesRes.documents;

      // Build activity data grouped by date
      const activityMap: Record<string, ActivityDataPoint> = {};
      let totalThinkingTime = 0;
      let totalXp = 0;
      const topicProgress: Record<string, TopicProgress> = {};

      // Initialize all dates in range with 0s
      for (let i = 0; i < daysBack; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        activityMap[dateStr] = {
          date: dateStr,
          challenges: 0,
          xp: 0,
          thinkingTime: 0,
        };
      }

      // Process responses
      for (const doc of responses) {
        const createdAt = doc.completedAt || doc.$createdAt;
        const dateStr = new Date(createdAt).toISOString().split('T')[0];
        const xpEarned = doc.totalXpEarned || doc.xpEarned || 0;
        const thinkingTime = doc.totalThinkingTime || doc.thinkingTime || 0;

        totalThinkingTime += thinkingTime;
        totalXp += xpEarned;

        // Only include in activity map if within range
        if (activityMap[dateStr]) {
          activityMap[dateStr].challenges += 1;
          activityMap[dateStr].xp += xpEarned;
          activityMap[dateStr].thinkingTime += thinkingTime;
        }

        // Track topic progress
        const challengeId = doc.challengeID || doc.challengeId;
        if (challengeId) {
          try {
            // We'll batch this later, for now just track by challengeId
            if (!topicProgress[challengeId]) {
              topicProgress[challengeId] = {
                topicId: challengeId,
                topicName: 'Challenge',
                completed: 0,
                totalXp: 0,
              };
            }
            topicProgress[challengeId].completed += 1;
            topicProgress[challengeId].totalXp += xpEarned;
          } catch {
            // Ignore errors
          }
        }
      }

      // Convert map to sorted array
      const activityData = Object.values(activityMap)
        .sort((a, b) => a.date.localeCompare(b.date));

      // Create activity calendar (date -> count) for heatmap
      const activityCalendar: Record<string, number> = {};
      for (const [date, data] of Object.entries(activityMap)) {
        activityCalendar[date] = data.challenges;
      }

      // Calculate trend (last 7 days vs previous 7 days)
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const fourteenDaysAgo = new Date(now);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      let recentActivity = 0;
      let previousActivity = 0;

      for (const doc of responses) {
        const createdAt = new Date(doc.completedAt || doc.$createdAt);
        if (createdAt >= sevenDaysAgo) {
          recentActivity++;
        } else if (createdAt >= fourteenDaysAgo) {
          previousActivity++;
        }
      }

      const trend: 'up' | 'down' | 'stable' = 
        recentActivity > previousActivity ? 'up' :
        recentActivity < previousActivity ? 'down' : 'stable';

      // Get user data for gamification
      const xp = user.xp || 0;
      const level = user.level || Math.floor(xp / XP_PER_LEVEL) + 1;
      const currentStreak = user.currentStreak || user.streak || 0;
      const longestStreak = user.longestStreak || currentStreak;
      const totalChallenges = responses.length;

      // Calculate level progress
      const currentLevelXp = (level - 1) * XP_PER_LEVEL;
      const nextLevelXp = level * XP_PER_LEVEL;
      const xpInCurrentLevel = xp - currentLevelXp;
      const xpProgress = Math.min((xpInCurrentLevel / XP_PER_LEVEL) * 100, 100);

      // Average thinking time
      const avgThinkingTime = responses.length > 0 
        ? totalThinkingTime / responses.length 
        : 0;

      setAnalytics({
        xp,
        level,
        currentStreak,
        longestStreak,
        totalChallenges,
        averageThinkingTime: Math.round(avgThinkingTime),
        totalThinkingTime,
        trend,
        recentActivity,
        previousActivity,
        topicProgress,
        activityData,
        activityCalendar,
        nextLevelXp,
        xpProgress,
      });
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [user?.$id, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}
