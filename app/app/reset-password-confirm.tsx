import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { functions } from '../lib/appwrite';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS } from '../theme';

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
        placeholderTextColor={COLORS.text.secondary}
        selectionColor={COLORS.accent.primary}
      />
      
      <TextInput
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor={COLORS.text.secondary}
        selectionColor={COLORS.accent.primary}
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
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: COLORS.background.primary,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.heading,
    marginBottom: 8,
    textAlign: 'center',
    color: COLORS.text.primary,
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    marginBottom: 28,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    backgroundColor: COLORS.background.secondary,
    color: COLORS.text.primary,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    borderRadius: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.accent.primary,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontFamily: FONTS.heading,
    letterSpacing: 0.8,
  },
});
