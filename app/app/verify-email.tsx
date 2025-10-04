import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { account } from '../lib/appwrite';
import { useRouter } from 'expo-router';

export default function VerifyEmail() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendVerificationEmail = async () => {
    setLoading(true);
    try {
      await account.createVerification('exp://localhost:8081/email-verified');
      Alert.alert('Success', 'Verification email sent! Please check your inbox.');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        Please verify your email address to access all features.
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={sendVerificationEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : 'Send Verification Email'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/topics')}>
        <Text style={styles.linkText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#007AFF',
  },
});
