import { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { functions, account } from '../lib/appwrite';
import { useRouter } from 'expo-router';

export default function Question() {
  const [question, setQuestion] = useState<any>(null);
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

  const getQuestion = async () => {
    if (!user) return;
    try {
      const res = await functions.createExecution('get-question', JSON.stringify({ userId: user.$id }));
      const data = JSON.parse(res.responseBody);
      if (data.success) {
        setQuestion(data.question);
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Question</Text>
      {question ? (
        <View>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>{question.questionText}</Text>
          <Button title="Get Hint" onPress={() => {/* TODO: implement hint */}} />
          <Button title="Submit Response" onPress={() => router.push('/response?questionId=' + question.$id)} />
        </View>
      ) : (
        <Button title="Get Question" onPress={getQuestion} />
      )}
      <Button title="Analytics" onPress={() => router.push('/analytics')} />
    </View>
  );
}
