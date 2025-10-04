import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { useState } from 'react';
import { account, databases, functions } from '../lib/appwrite';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [response, setResponse] = useState('');

  const login = async () => {
    try {
      // For testing, create anonymous session or email login
      // Assume email login with test@test.com / password
      await account.createEmailPasswordSession('test@test.com', 'password');
      const userData = await account.get();
      setUser(userData);
      Alert.alert('Logged in', `Welcome ${userData.name}`);
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  const getTopics = async () => {
    try {
      const res = await databases.listDocuments('synapse', 'topics');
      setTopics(res.documents);
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  const selectTopic = async (topicId: string) => {
    // Update user selectedTopics
    const newSelected = [...selectedTopics, topicId];
    setSelectedTopics(newSelected);
    try {
      await databases.updateDocument('synapse', 'users', user.$id, {
        selectedTopics: newSelected
      });
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  const getQuestion = async () => {
    try {
      const res = await functions.createExecution('get-question', JSON.stringify({ userId: user.$id }));
      const data = JSON.parse(res.responseBody);
      if (data.success) {
        setCurrentQuestion(data.question);
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  const submitResponse = async () => {
    try {
      const res = await functions.createExecution('submit-response', JSON.stringify({
        userId: user.$id,
        questionId: currentQuestion.$id,
        responseText: response,
        thinkingTime: 60 // dummy
      }));
      const data = JSON.parse(res.responseBody);
      if (data.success) {
        Alert.alert('Success', 'Response submitted');
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  const getAnalytics = async () => {
    try {
      const res = await functions.createExecution('get-user-analytics', JSON.stringify({ userId: user.$id }));
      const data = JSON.parse(res.responseBody);
      if (data.success) {
        Alert.alert('Analytics', JSON.stringify(data.analytics));
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Synapse Test App</Text>
      {!user ? (
        <Button title="Login" onPress={login} />
      ) : (
        <View>
          <Text>Welcome {user.email}</Text>
          <Button title="Get Topics" onPress={getTopics} />
          {topics.map(t => (
            <Button key={t.$id} title={`Select ${t.name}`} onPress={() => selectTopic(t.$id)} />
          ))}
          <Button title="Get Question" onPress={getQuestion} />
          {currentQuestion && (
            <View>
              <Text>{currentQuestion.questionText}</Text>
              <Button title="Submit Response" onPress={submitResponse} />
            </View>
          )}
          <Button title="Get Analytics" onPress={getAnalytics} />
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
