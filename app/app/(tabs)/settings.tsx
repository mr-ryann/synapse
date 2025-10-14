import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS } from '../../theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.heading}>Settings</Text>

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
            <Pressable 
              style={styles.settingItem}
              onPress={() => router.push('/topics-settings')}
            >
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
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
  },
  heading: {
    fontSize: 30,
    color: COLORS.text.primary,
    fontFamily: FONTS.heading,
  },
  description: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontFamily: FONTS.body,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.text.primary,
    fontFamily: FONTS.heading,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  settingItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background.elevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  settingText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontFamily: FONTS.body,
  },
  dangerText: {
    color: COLORS.semantic.error,
  },
});
