import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { functions, account } from '../lib/appwrite';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Response() {
  const [responseText, setResponseText] = useState('');
  const [thinkingTime, setThinkingTime] = useState('60');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { questionId } = useLocalSearchParams();

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

  const submitResponse = async () => {
    if (!user || !questionId) return;
    try {
      const res = await functions.createExecution('submit-response', JSON.stringify({
        userId: user.$id,
        questionId,
        responseText,
        thinkingTime: parseInt(thinkingTime)
      }));
      const data = JSON.parse(res.responseBody);
      if (data.success) {
        Alert.alert('Success', 'Response submitted');
        router.push('/question');
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Submit Response</Text>
      <TextInput
        placeholder="Your response"
        value={responseText}
        onChangeText={setResponseText}
        multiline
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, height: 100 }}
      />
      <TextInput
        placeholder="Thinking time (seconds)"
        value={thinkingTime}
        onChangeText={setThinkingTime}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      <Button title="Submit" onPress={submitResponse} />
    </View>
  );
}
