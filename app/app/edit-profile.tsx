import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { account, databases } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../theme';

export default function EditProfile() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        setName(userData.name || '');
        setEmail(userData.email || '');
        
        // Load bio from user document if it exists
        try {
          const userDoc = await databases.getDocument('synapse', 'users', userData.$id);
          setBio(userDoc.bio || '');
        } catch (e) {
          // Bio field might not exist yet
        }
      } catch (e) {
        router.push('/login');
      }
    };
    loadProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // Update account name
      if (name !== user.name) {
        await account.updateName(name);
      }
      
      // Update bio in user document
      try {
        await databases.updateDocument('synapse', 'users', user.$id, { bio });
      } catch (e) {
        // If bio field doesn't exist, we'll need to add it to schema first
        console.log('Could not update bio:', e);
      }
      
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      
      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholder="Your name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor={COLORS.text.secondary}
        selectionColor={COLORS.accent.primary}
      />
      
      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="Email"
        value={email}
        editable={false}
        style={[styles.input, styles.inputDisabled]}
        placeholderTextColor={COLORS.text.secondary}
      />
      <Text style={styles.helperText}>Email cannot be changed here</Text>
      
      <Text style={styles.label}>Bio</Text>
      <TextInput
        placeholder="Tell us about yourself"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
        style={[styles.input, styles.textArea]}
        placeholderTextColor={COLORS.text.secondary}
        selectionColor={COLORS.accent.primary}
      />
      
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={handleUpdateProfile}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Updating...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  label: {
    fontSize: 14,
    fontFamily: FONTS.body,
    marginBottom: 8,
    color: COLORS.text.secondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    backgroundColor: COLORS.background.secondary,
    color: COLORS.text.primary,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderRadius: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
  },
  inputDisabled: {
    backgroundColor: COLORS.background.elevated,
    color: COLORS.text.secondary,
    opacity: 0.7,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.text.muted,
    marginBottom: 24,
    fontFamily: FONTS.body,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: COLORS.accent.primary,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 20 },
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
    marginTop: 8,
    color: COLORS.accent.tertiary,
    fontFamily: FONTS.body,
  },
});
