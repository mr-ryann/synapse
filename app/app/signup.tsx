import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { AnimatedGridBackground, GlassmorphicInput, ShimmerButton, StaggeredTextReveal } from '../components/ui';
import { THEME } from '../theme';
import { useToast } from '../hooks/useToast';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signupWithEmail, signupWithGoogle } = useAuth();
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  const handleEmailSignup = async () => {
    try {
      setIsLoading(true);
      await signupWithEmail(email, password, confirmPassword, name);
      showToast('Account created! 🎉', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to create account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signupWithGoogle(
        'exp://localhost:8081/auth-callback', // success redirect to check onboarding
        'exp://localhost:8081/signup' // failure redirect
      );
      showToast('Account created! 🎉', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to sign up with Google', 'error');
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
            text="Create Account" 
            style={styles.title}
            staggerDelay={80}
          />
          <Text style={styles.subtitle}>Join Synapse and start learning</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <GlassmorphicInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            style={styles.input}
          />
          
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
          
          <GlassmorphicInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />
          
          <ShimmerButton 
            onPress={handleEmailSignup}
            disabled={isLoading}
            variant="primary"
            style={styles.signUpButton}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </ShimmerButton>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <ShimmerButton 
            onPress={handleGoogleSignup}
            variant="secondary"
            style={styles.googleButton}
          >
            Continue with Google
          </ShimmerButton>

          <TouchableOpacity 
            onPress={() => router.push('/login')}
            style={styles.loginLink}
          >
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
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
  signUpButton: {
    marginTop: 8,
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
  loginLink: {
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
