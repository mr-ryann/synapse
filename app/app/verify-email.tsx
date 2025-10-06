import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { account } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../theme';

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
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: COLORS.background.primary,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.heading,
    marginBottom: 12,
    textAlign: 'center',
    color: COLORS.text.primary,
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.accent.primary,
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontFamily: FONTS.heading,
    letterSpacing: 0.6,
  },
  linkText: {
    textAlign: 'center',
    marginTop: 8,
    color: COLORS.accent.tertiary,
    fontFamily: FONTS.body,
    fontSize: 14,
  },
});
