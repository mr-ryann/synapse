import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { COLORS, FONTS } from '../theme';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();
  const { loading, signupWithEmail, signupWithGoogle } = useAuth();

  const handleEmailSignup = async () => {
    await signupWithEmail(email, password, confirmPassword, name);
  };

  const handleGoogleSignup = async () => {
    await signupWithGoogle(
      'exp://localhost:8081/auth-callback', // success redirect to check onboarding
      'exp://localhost:8081/signup' // failure redirect
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCapitalize="words"
        placeholderTextColor={COLORS.text.secondary}
        selectionColor={COLORS.accent.primary}
      />
      
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
      
      <TextInput
        placeholder="Confirm Password"
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
        onPress={handleEmailSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity 
        style={[styles.button, styles.googleButton]} 
        onPress={handleGoogleSignup}
      >
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.linkBold}>Login</Text>
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
  title: {
    fontSize: 32,
    fontFamily: FONTS.heading,
    marginBottom: 28,
    textAlign: 'center',
    color: COLORS.text.primary,
    letterSpacing: 0.6,
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
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.subtle,
  },
  dividerText: {
    marginHorizontal: 10,
    color: COLORS.text.muted,
    fontFamily: FONTS.body,
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
