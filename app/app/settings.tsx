import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { TopHeader } from '../components/navigation/TopHeader';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <TopHeader />
      <ScrollView style={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.heading}>Settings</Text>
          <Text style={styles.description}>
            App preferences and account settings
          </Text>

          {/* Settings sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Pressable
              style={styles.settingItem}
              onPress={() => router.push('/edit-profile')}
            >
              <Text style={styles.settingText}>Edit Profile</Text>
            </Pressable>
            <Pressable style={styles.settingItem} onPress={handleLogout}>
              <Text style={[styles.settingText, styles.dangerText]}>
                Logout
              </Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <Pressable style={styles.settingItem}>
              <Text style={styles.settingText}>Notifications</Text>
            </Pressable>
            <Pressable style={styles.settingItem}>
              <Text style={styles.settingText}>Topics</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Pressable style={styles.settingItem}>
              <Text style={styles.settingText}>Privacy Policy</Text>
            </Pressable>
            <Pressable style={styles.settingItem}>
              <Text style={styles.settingText}>Terms of Service</Text>
            </Pressable>
            <View style={styles.settingItem}>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  inner: {
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  settingItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8,
  },
  settingText: {
    fontSize: 16,
    color: '#ffffff',
  },
  dangerText: {
    color: '#ef4444',
  },
  versionText: {
    fontSize: 14,
    color: '#999999',
  },
});
