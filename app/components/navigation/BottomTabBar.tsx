import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Search, BookOpen, Settings } from 'lucide-react-native';
import { TabButton } from './TabButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { name: 'home', icon: Home, route: '/', label: 'Home' },
  { name: 'search', icon: Search, route: '/search', label: 'Search' },
  { name: 'library', icon: BookOpen, route: '/library', label: 'Library' },
  { name: 'settings', icon: Settings, route: '/settings', label: 'Settings' },
] as const;

export const BottomTabBar = React.memo(() => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Don't show on auth screens and immersive screens
  const hideOnScreens = [
    '/login',
    '/signup',
    '/auth-callback',
    '/reset-password',
    '/reset-password-confirm',
    '/verify-email',
    '/email-verified',
    '/challenge-player',
  ];
  
  if (hideOnScreens.includes(pathname)) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {TABS.map((tab) => (
        <TabButton
          key={tab.name}
          icon={tab.icon}
          label={tab.label}
          isActive={pathname === tab.route}
          onPress={() => router.push(tab.route)}
        />
      ))}
    </View>
  );
});

BottomTabBar.displayName = 'BottomTabBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 12,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
});
