import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StreakIndicator } from './StreakIndicator';
import { NotificationMenu } from './NotificationMenu';
import { SearchButton } from './SearchButton';

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
        {/* Left side - empty for now, can add logo/title later */}
        <View style={styles.leftSide} />
        
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
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSide: {
    flex: 1,
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
