/**
 * Synapse Theme System
 * 
 * Import theme from here throughout the app
 * Example: import { THEME, useTheme } from '@/theme';
 */

import { THEME, PRIMARY, SECONDARY, ACCENT, SUCCESS, WARNING, ERROR, INFO, NEUTRAL, DARK, LIGHT } from './colors';
import type { ThemeColors } from './colors';

// Hook to access theme in components
export const useTheme = () => {
  return THEME;
};

// Export individual color palettes for direct import
export {
  THEME,
  PRIMARY,
  SECONDARY,
  ACCENT,
  SUCCESS,
  WARNING,
  ERROR,
  INFO,
  NEUTRAL,
  DARK,
  LIGHT,
};

// Export types
export type { ThemeColors };

// Default export
export default THEME;
