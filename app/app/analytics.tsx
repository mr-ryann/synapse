import { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { functions, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';

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
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Analytics</Text>
      {analytics ? (
        <View>
          <Text>Total Responses: {analytics.totalResponses}</Text>
          <Text>Average Thinking Time: {analytics.averageThinkingTime} seconds</Text>
          <Text>Total Thinking Time: {analytics.totalThinkingTime} seconds</Text>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
      <Button title="Back to Question" onPress={() => router.push('/question')} />
    </View>
  );
}
