import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { functions, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { 
  AnimatedCounter, 
  GradientBorderCard, 
  SkeletonLoader,
  ResponseTrendChart,
  ThinkingTimeBarChart,
  TopicProgressRings
} from '../components/ui';
import { THEME } from '../theme';
import { useToast } from '../hooks/useToast';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
      } catch (e) {
        router.push('/login');
      }
    };
    checkUser();
  }, []);

  const getAnalytics = async () => {
    if (!user) return;
    try {
      const res = await functions.createExecution('get-user-analytics', JSON.stringify({ userId: user.$id }));
      const data = JSON.parse(res.responseBody);
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        showToast(data.error || 'Failed to load analytics', 'error');
      }
    } catch (e) {
      showToast((e as Error).message || 'Failed to load analytics', 'error');
    }
  };

  useEffect(() => {
    getAnalytics();
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Analytics</Text>
          <Text style={styles.subtitle}>
            Track your learning progress and insights
          </Text>
        </View>

        {analytics ? (
          <View style={styles.stats}>
            {/* Quick Stats Row (Compact) */}
            <View style={styles.quickStatsRow}>
              <GradientBorderCard borderWidth={2} borderRadius={16} style={styles.quickStatCard}>
                <View style={styles.compactStatCard}>
                  <Text style={styles.compactStatLabel}>Total Responses</Text>
                  <AnimatedCounter
                    value={analytics.totalResponses}
                    duration={1200}
                    style={styles.compactStatValue}
                  />
                </View>
              </GradientBorderCard>

              <GradientBorderCard borderWidth={2} borderRadius={16} style={styles.quickStatCard}>
                <View style={styles.compactStatCard}>
                  <Text style={styles.compactStatLabel}>Avg. Time</Text>
                  <View style={styles.compactTimeContainer}>
                    <AnimatedCounter
                      value={analytics.averageThinkingTime}
                      duration={1200}
                      decimals={1}
                      style={styles.compactStatValue}
                    />
                    <Text style={styles.compactTimeUnit}>s</Text>
                  </View>
                </View>
              </GradientBorderCard>
            </View>

            {/* Response Trend Chart */}
            {analytics.responseTrend && (
              <ResponseTrendChart 
                data={analytics.responseTrend}
                currentStreak={analytics.streakInfo?.currentStreak || 0}
              />
            )}

            {/* Thinking Time by Topic Chart */}
            {analytics.thinkingTimeByTopic && analytics.thinkingTimeByTopic.length > 0 && (
              <ThinkingTimeBarChart data={analytics.thinkingTimeByTopic} />
            )}

            {/* Topic Progress Rings */}
            {analytics.topicProgress && analytics.topicProgress.length > 0 && (
              <TopicProgressRings data={analytics.topicProgress} />
            )}

            {/* Streak Info Card (if streaks exist) */}
            {analytics.streakInfo && analytics.streakInfo.currentStreak > 0 && (
              <GradientBorderCard borderWidth={2} borderRadius={20}>
                <View style={styles.streakCard}>
                  <Text style={styles.streakTitle}>🔥 Streak Statistics</Text>
                  <View style={styles.streakStats}>
                    <View style={styles.streakStat}>
                      <Text style={styles.streakValue}>{analytics.streakInfo.currentStreak}</Text>
                      <Text style={styles.streakLabel}>Current Streak</Text>
                    </View>
                    <View style={styles.streakDivider} />
                    <View style={styles.streakStat}>
                      <Text style={styles.streakValue}>{analytics.streakInfo.longestStreak}</Text>
                      <Text style={styles.streakLabel}>Longest Streak</Text>
                    </View>
                    <View style={styles.streakDivider} />
                    <View style={styles.streakStat}>
                      <Text style={styles.streakValue}>{analytics.streakInfo.totalActiveDays}</Text>
                      <Text style={styles.streakLabel}>Active Days</Text>
                    </View>
                  </View>
                </View>
              </GradientBorderCard>
            )}
          </View>
        ) : (
          <View style={styles.loading}>
            <SkeletonLoader width={350} height={150} borderRadius={20} style={styles.skeleton} />
            <SkeletonLoader width={350} height={150} borderRadius={20} style={styles.skeleton} />
            <SkeletonLoader width={350} height={150} borderRadius={20} style={styles.skeleton} />
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.push('/question')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back to Questions</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {ToastComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.dark.bg,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.neutral.white,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: THEME.neutral[400],
    lineHeight: 22,
  },
  stats: {
    gap: 20,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
  },
  compactStatCard: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  compactStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.neutral[500],
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactStatValue: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.primary[400],
    letterSpacing: -1,
  },
  compactTimeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  compactTimeUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.neutral[500],
  },
  streakCard: {
    padding: 20,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.neutral.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  streakStat: {
    alignItems: 'center',
    flex: 1,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.primary[400],
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    color: THEME.neutral[500],
    textAlign: 'center',
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: THEME.neutral[800],
    marginHorizontal: 8,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.neutral[400],
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 48,
    fontWeight: '800',
    color: THEME.primary[400],
    letterSpacing: -2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  timeUnit: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.neutral[500],
  },
  statDescription: {
    fontSize: 13,
    color: THEME.neutral[500],
    marginTop: 8,
    fontWeight: '600',
  },
  loading: {
    gap: 20,
  },
  skeleton: {
    marginBottom: 4,
  },
  backButton: {
    marginTop: 32,
    paddingVertical: 16,
    backgroundColor: `${THEME.neutral[800]}`,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: THEME.neutral[300],
    fontSize: 16,
    fontWeight: '700',
  },
});
