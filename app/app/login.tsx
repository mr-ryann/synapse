import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/ui/Logo';
import { COLORS, FONTS } from '../theme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { loading, loginWithEmail, loginWithGoogle } = useAuth();

  const handleLogin = async () => {
    await loginWithEmail(email, password);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle(
      'exp://localhost:8081/auth-callback', // success redirect to check onboarding
      'exp://localhost:8081/login' // failure redirect
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Logo size="large" />
      </View>
      
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      
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
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor={COLORS.text.secondary}
        selectionColor={COLORS.accent.primary}
      />

      <TouchableOpacity onPress={() => router.push('/reset-password')}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity 
        style={[styles.button, styles.googleButton]} 
        onPress={handleGoogleLogin}
      >
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={styles.linkText}>
          Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: COLORS.background.primary,
    gap: 12,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.heading,
    marginBottom: 8,
    textAlign: 'center',
    color: COLORS.text.primary,
    letterSpacing: 0.5,
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
  forgotPassword: {
    color: COLORS.accent.tertiary,
    textAlign: 'right',
    marginBottom: 24,
    fontFamily: FONTS.body,
    fontSize: 14,
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
  googleButton: {
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  googleButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontFamily: FONTS.body,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.subtle,
  },
  dividerText: {
    color: COLORS.text.muted,
    fontFamily: FONTS.body,
    fontSize: 14,
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
    letterSpacing: 0.6,
  },
});
