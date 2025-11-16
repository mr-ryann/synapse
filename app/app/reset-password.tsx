import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { functions } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../theme';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Call password-reset serverless function
      const result = await functions.createExecution(
        'password-reset',
        JSON.stringify({
          action: 'request',
          email: email,
          resetUrl: 'exp://localhost:8081/reset-password-confirm'
        })
      );
      
      const response = JSON.parse(result.responseBody);
      
      if (response.success) {
        Alert.alert(
          'Success', 
          'Password reset link has been sent to your email. Please check your inbox.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/login')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to send reset email');
      }
    } catch (e) {
      console.error('Reset password error:', e);
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a link to reset your password.
      </Text>
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={COLORS.text.secondary}
        selectionColor={COLORS.accent.primary}
      />
      
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>
          <Text style={styles.linkBold}>← Back to Login</Text>
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
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    backgroundColor: COLORS.background.secondary,
    color: COLORS.text.primary,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 24,
    borderRadius: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 16,
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
  linkText: {
    textAlign: 'center',
    marginTop: 12,
    color: COLORS.text.secondary,
    fontFamily: FONTS.body,
  },
  linkBold: {
    color: COLORS.accent.primary,
    fontFamily: FONTS.heading,
  },
});
