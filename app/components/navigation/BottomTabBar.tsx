import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Home, Library, NotebookPen, User } from 'lucide-react-native';
import { TabButton } from './TabButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TABS = [
  { name: 'home', icon: Home, routeName: 'home', label: 'Home' },
  { name: 'library', icon: Library, routeName: 'library', label: 'Library' },
  { name: 'journal', icon: NotebookPen, routeName: 'journal', label: 'Journal' },
  { name: 'profile', icon: User, routeName: 'profile', label: 'Profile' },
] as const;

export const BottomTabBar = React.memo<BottomTabBarProps>(({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outerContainer, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.pillContainer}>
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
    </View>
  );
});

BottomTabBar.displayName = 'BottomTabBar';

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 40,
    paddingVertical: 6,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
});
