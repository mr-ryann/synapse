import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from './BackButton';
import { COLORS, FONTS } from '../../theme';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
}

export const AppHeader = React.memo<AppHeaderProps>(({ 
  title, 
  subtitle,
  showBackButton = true,
  rightComponent 
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[
        styles.container,
        { paddingTop: insets.top || (Platform.OS === 'android' ? StatusBar.currentHeight : 0) }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {showBackButton && <BackButton />}
        </View>

        <View style={styles.centerSection}>
          {title && (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightSection}>
          {rightComponent}
        </View>
      </View>
    </View>
  );
});

AppHeader.displayName = 'AppHeader';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    shadowColor: COLORS.overlay.glow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  leftSection: {
    width: 80,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightSection: {
    width: 80,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    fontWeight: '600',
    color: COLORS.text.primary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
});