import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { functions } from '../lib/appwrite';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ResetPasswordConfirm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { userId, secret } = useLocalSearchParams();

  const handleConfirmReset = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    if (!userId || !secret) {
      Alert.alert('Error', 'Invalid reset link. Please request a new password reset.');
      return;
    }

    setLoading(true);
    try {
      // Call password-reset serverless function
      const result = await functions.createExecution(
        'password-reset',
        JSON.stringify({
          action: 'confirm',
          userId: userId as string,
          secret: secret as string,
          password: password,
          passwordConfirm: confirmPassword
        })
      );
      
      const response = JSON.parse(result.responseBody);
      
      if (response.success) {
        Alert.alert(
          'Success',
          'Your password has been reset successfully. Please login with your new password.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/login')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to reset password');
      }
    } catch (e) {
      console.error('Confirm reset error:', e);
      Alert.alert('Error', 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>
        Enter your new password below.
      </Text>
      
      <TextInput
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
        autoCapitalize="none"
      />
      
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={handleConfirmReset}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Text>
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
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
});
