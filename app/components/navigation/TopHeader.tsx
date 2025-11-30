import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StreakIndicator } from './StreakIndicator';
import { NotificationMenu } from './NotificationMenu';
import { SearchButton } from './SearchButton';
import { Logo } from '../ui/Logo';
import { COLORS } from '../../theme';

export const TopHeader = React.memo(() => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 12,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.leftSide}>
          <Logo size="medium" showText={true} />
        </View>
        
        {/* Right side - streak, notifications, search */}
        <View style={styles.rightSide}>
          <StreakIndicator />
          <NotificationMenu />
          <SearchButton />
        </View>
      </View>
    </View>
  );
});

TopHeader.displayName = 'TopHeader';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
