import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StreakIndicator } from './StreakIndicator';
import { NotificationMenu } from './NotificationMenu';
import { SearchButton } from './SearchButton';
import { COLORS, FONTS } from '../../theme';

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
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brand}>SYNAPSE</Text>
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
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  brand: {
    fontFamily: FONTS.brand,
    fontSize: 20,
    letterSpacing: 4,
    color: COLORS.text.primary,
  },
});
