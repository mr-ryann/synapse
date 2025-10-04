import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { account, databases } from '../lib/appwrite';
import { useRouter } from 'expo-router';

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
      />
      
      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="Email"
        value={email}
        editable={false}
        style={[styles.input, styles.inputDisabled]}
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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
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
    marginTop: 10,
    color: '#007AFF',
  },
});
