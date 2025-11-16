import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { functions, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../theme';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

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
        Alert.alert('Error', data.error);
      }
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  useEffect(() => {
    getAnalytics();
  }, [user]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.heading}>Analytics</Text>
          {analytics ? (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Responses</Text>
                <Text style={styles.statValue}>{analytics.totalResponses}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Average Thinking Time</Text>
                <Text style={styles.statValue}>{analytics.averageThinkingTime}s</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Thinking Time</Text>
                <Text style={styles.statValue}>{analytics.totalThinkingTime}s</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.loadingText}>Loading...</Text>
          )}
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/question')}>
            <Text style={styles.primaryButtonText}>Back to Question</Text>
          </TouchableOpacity>
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
    gap: 20,
  },
  heading: {
    fontSize: 30,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
  },
  statsContainer: {
    gap: 16,
  },
  statCard: {
    backgroundColor: COLORS.background.elevated,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  statValue: {
    fontSize: 28,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginVertical: 32,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: COLORS.accent.primary,
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
  },
  primaryButtonText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.background.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
