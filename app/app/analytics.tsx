import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { functions, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { AnimatedCounter, GradientBorderCard, SkeletonLoader } from '../components/ui';
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
            {/* Total Responses Card */}
            <GradientBorderCard borderWidth={2} borderRadius={20}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Responses</Text>
                <AnimatedCounter
                  value={analytics.totalResponses}
                  duration={1200}
                  style={styles.statValue}
                />
                <Text style={styles.statDescription}>
                  Questions you've answered
                </Text>
              </View>
            </GradientBorderCard>

            {/* Average Thinking Time Card */}
            <GradientBorderCard borderWidth={2} borderRadius={20}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Avg. Thinking Time</Text>
                <View style={styles.timeContainer}>
                  <AnimatedCounter
                    value={analytics.averageThinkingTime}
                    duration={1200}
                    decimals={1}
                    style={styles.statValue}
                  />
                  <Text style={styles.timeUnit}>sec</Text>
                </View>
                <Text style={styles.statDescription}>
                  Per question on average
                </Text>
              </View>
            </GradientBorderCard>

            {/* Total Thinking Time Card */}
            <GradientBorderCard borderWidth={2} borderRadius={20}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Thinking Time</Text>
                <View style={styles.timeContainer}>
                  <AnimatedCounter
                    value={analytics.totalThinkingTime}
                    duration={1200}
                    style={styles.statValue}
                  />
                  <Text style={styles.timeUnit}>sec</Text>
                </View>
                <Text style={styles.statDescription}>
                  Time spent learning
                </Text>
              </View>
            </GradientBorderCard>
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
