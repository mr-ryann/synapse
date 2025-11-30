import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Home, BookOpen, NotebookPen, User } from 'lucide-react-native';
import { TabButton } from './TabButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TABS = [
  { name: 'home', icon: Home, routeName: 'home', label: 'Home' },
  { name: 'library', icon: BookOpen, routeName: 'library', label: 'Library' },
  { name: 'journal', icon: NotebookPen, routeName: 'journal', label: 'Journal' },
  { name: 'profile', icon: User, routeName: 'profile', label: 'Profile' },
] as const;

export const BottomTabBar = React.memo<BottomTabBarProps>(({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const tabConfig = TABS.find(t => t.routeName === route.name);
        if (!tabConfig) return null;

        const isActive = state.index === index;
        const onPress = () => {
          if (!isActive) {
            navigation.navigate(route.name);
          }
        };
          
        return (
          <TabButton
            key={route.key}
            icon={tabConfig.icon}
            label={tabConfig.label}
            isActive={isActive}
            onPress={onPress}
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
