import { useState, useEffect } from 'react';
import { View, Text, Button, Alert, ScrollView, StyleSheet } from 'react-native';
import { functions, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { TopHeader } from '../components/navigation/TopHeader';

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
      <TopHeader />
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
          <Button title="Back to Question" onPress={() => router.push('/question')} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  inner: {
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 24,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 24,
  },
});
