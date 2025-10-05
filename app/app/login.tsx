import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { AnimatedGridBackground, GlassmorphicInput, ShimmerButton, StaggeredTextReveal } from '../components/ui';
import { THEME } from '../theme';
import { useToast } from '../hooks/useToast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { loading, loginWithEmail, loginWithGoogle } = useAuth();
  const { showToast, ToastComponent } = useToast();

  const handleLogin = async () => {
    try {
      await loginWithEmail(email, password);
      showToast('Login successful! Welcome back 🎉', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Login failed', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(
        'exp://localhost:8081/auth-callback', // success redirect to check onboarding
        'exp://localhost:8081/login' // failure redirect
      );
    } catch (error) {
      showToast((error as Error).message || 'Google login failed', 'error');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Animated Background */}
      <AnimatedGridBackground color={THEME.primary[500]} opacity={0.05} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <StaggeredTextReveal 
            text="Welcome Back" 
            style={styles.title}
            staggerDelay={80}
          />
          <Text style={styles.subtitle}>Sign in to continue your learning journey</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <GlassmorphicInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          
          <GlassmorphicInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />

          <TouchableOpacity 
            onPress={() => router.push('/reset-password')}
            style={styles.forgotPasswordButton}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <ShimmerButton 
            onPress={handleLogin}
            disabled={loading}
            variant="primary"
            style={styles.signInButton}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </ShimmerButton>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <ShimmerButton 
            onPress={handleGoogleLogin}
            variant="secondary"
            style={styles.googleButton}
          >
            Continue with Google
          </ShimmerButton>

          <TouchableOpacity 
            onPress={() => router.push('/signup')}
            style={styles.signupLink}
          >
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toast Notifications */}
      {ToastComponent}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.dark.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.neutral.white,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.neutral[400],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgotPassword: {
    color: THEME.primary[400],
    fontSize: 14,
    fontWeight: '600',
  },
  signInButton: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.neutral[800],
  },
  dividerText: {
    marginHorizontal: 16,
    color: THEME.neutral[500],
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    marginBottom: 32,
  },
  signupLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 15,
    color: THEME.neutral[400],
  },
  linkBold: {
    color: THEME.primary[500],
    fontWeight: '700',
  },
});
