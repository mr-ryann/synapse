import { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { account } from '../lib/appwrite';
import { useRouter } from 'expo-router';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
      } catch (e) {
        // Not logged in
      }
    };
    checkUser();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 10 }}>Synapse</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 30 }}>Think Deeper, Grow Stronger</Text>
      {user ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ marginBottom: 20 }}>Welcome back, {user.name || user.email}</Text>
          <Button title="Topics" onPress={() => router.push('/topics')} />
          <Button title="Question" onPress={() => router.push('/question')} />
          <Button title="Analytics" onPress={() => router.push('/analytics')} />
        </View>
      ) : (
        <View style={{ width: '80%' }}>
          <Button title="Login" onPress={() => router.push('/login')} />
          <View style={{ marginTop: 10 }}>
            <Button title="Sign Up" onPress={() => router.push('/signup')} />
          </View>
        </View>
      )}
    </View>
  );
}
