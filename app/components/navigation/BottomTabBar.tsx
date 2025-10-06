import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Search, BookOpen, Settings } from 'lucide-react-native';
import { TabButton } from './TabButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';

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
      {TABS.map((tab) => {
        // Normalize root route: '', '/', or '/index' map to '/'
        const currentRoute = ['','/','/index'].includes(pathname) ? '/' : pathname;
        const isActive =
          (tab.route === '/' && currentRoute === '/') ||
          (tab.route !== '/' && currentRoute.startsWith(tab.route));
          
        return (
          <TabButton
            key={tab.name}
            icon={tab.icon}
            label={tab.label}
            isActive={isActive}
            onPress={() => !isActive && router.push(tab.route)}
          />
        );
      })}
    </View>
  );
});

BottomTabBar.displayName = 'BottomTabBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    paddingTop: 12,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
});
