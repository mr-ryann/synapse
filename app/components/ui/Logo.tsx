import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Waypoints } from 'lucide-react-native';
import { COLORS, FONTS } from '../../theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const SIZES = {
  small: { icon: 24, text: 16, gap: 6 },
  medium: { icon: 32, text: 20, gap: 8 },
  large: { icon: 48, text: 28, gap: 12 },
};

export const Logo = React.memo<LogoProps>(({ size = 'medium', showText = true }) => {
  const dimensions = SIZES[size];

  return (
    <View style={[styles.container, { gap: dimensions.gap }]}>
      <Waypoints size={dimensions.icon} color={COLORS.accent.primary} strokeWidth={2} />
      {showText && (
        <Text style={[styles.brand, { fontSize: dimensions.text, fontFamily: 'Oswald_400Regular' }]}>SYNAPSE</Text>
      )}
    </View>
  );
});

Logo.displayName = 'Logo';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    fontFamily: FONTS.brand,
    letterSpacing: 4,
    color: COLORS.text.primary,
  },
});
