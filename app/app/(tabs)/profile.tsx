import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Settings, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useUserStore } from '../../stores/useUserStore';
import { useAnalytics } from '../../hooks/useAnalytics';
import { COLORS, FONTS } from '../../theme';
import ActivityGraph from '../../components/ui/ActivityGraph';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { user } = useUserStore();
  const { data: analytics, loading: analyticsLoading } = useAnalytics();

  // Convert activityCalendar to format needed by ActivityGraph
  const contributionData = useMemo(() => {
    if (!analytics?.activityCalendar) return [];
    return Object.entries(analytics.activityCalendar).map(([date, count]) => ({
      date,
      count,
    }));
  }, [analytics?.activityCalendar]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const getLevelTitle = (level: number) => {
    if (level <= 5) return 'Novice Thinker';
    if (level <= 10) return 'Curious Mind';
    if (level <= 20) return 'Deep Diver';
    if (level <= 35) return 'Thought Leader';
    return 'Wisdom Seeker';
  };

  const xpForNextLevel = (level: number) => level * 100;
  const currentLevelXp = user ? user.xp % xpForNextLevel(user.level) : 0;
  const progressPercent = user ? (currentLevelXp / xpForNextLevel(user.level)) * 100 : 0;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileTop}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <User size={40} color={COLORS.accent.primary} />
                </View>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{user?.level || 1}</Text>
                </View>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || user?.username || 'User'}</Text>
                <Text style={styles.userTitle}>{getLevelTitle(user?.level || 1)}</Text>
              </View>
            </View>
            
            {/* XP Progress - Below avatar */}
            <View style={styles.xpSection}>
              <View style={styles.xpHeader}>
                <Text style={styles.xpLabel}>Level {user?.level || 1}</Text>
                <Text style={styles.xpValue}>{currentLevelXp}/{xpForNextLevel(user?.level || 1)} XP</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>
          </View>

          {/* Contribution Graph */}
          <View style={styles.contributionSection}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <ActivityGraph data={contributionData} weeks={15} />
          </View>

          {/* Menu Sections */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push('/edit-profile')}
            >
              <View style={styles.menuItemLeft}>
                <User size={20} color={COLORS.text.secondary} />
                <Text style={styles.menuItemText}>Edit Profile</Text>
              </View>
              <ChevronRight size={20} color={COLORS.text.muted} />
            </Pressable>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <Pressable
              style={styles.menuItem}
              onPress={() => router.push('/topics-settings')}
            >
              <View style={styles.menuItemLeft}>
                <Settings size={20} color={COLORS.text.secondary} />
                <Text style={styles.menuItemText}>Topic Settings</Text>
              </View>
              <ChevronRight size={20} color={COLORS.text.muted} />
            </Pressable>
          </View>

          {/* Danger Section */}
          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger</Text>
            
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color={COLORS.semantic.error} />
              <Text style={styles.logoutText}>Logout</Text>
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
    paddingBottom: 120,
  },
  profileHeader: {
    marginBottom: 24,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent.primary,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  levelText: {
    fontSize: 12,
    fontFamily: FONTS.heading,
    fontWeight: 'bold',
    color: COLORS.background.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  userTitle: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.accent.primary,
  },
  xpSection: {
    backgroundColor: COLORS.background.elevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  xpLabel: {
    fontSize: 14,
    fontFamily: FONTS.heading,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  xpValue: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.text.muted,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent.primary,
    borderRadius: 4,
  },
  contributionSection: {
    marginBottom: 24,
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: FONTS.heading,
    fontWeight: '600',
    color: COLORS.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  dangerTitle: {
    color: COLORS.semantic.error,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.elevated,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.background.elevated,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.semantic.error + '30',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.semantic.error,
  },
});
