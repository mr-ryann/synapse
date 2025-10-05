/**
 * Synapse Color Palette
 * 
 * CENTRALIZED COLOR SYSTEM
 * Change colors here to update throughout the entire app
 */

// ============================================
// PRIMARY COLORS
// ============================================
export const PRIMARY = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1', // Main brand color (Indigo)
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
} as const;

// ============================================
// SECONDARY COLORS
// ============================================
export const SECONDARY = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7', // Purple
  600: '#9333ea',
  700: '#7e22ce',
  800: '#6b21a8',
  900: '#581c87',
} as const;

// ============================================
// ACCENT COLORS
// ============================================
export const ACCENT = {
  50: '#fdf2f8',
  100: '#fce7f3',
  200: '#fbcfe8',
  300: '#f9a8d4',
  400: '#f472b6',
  500: '#ec4899', // Pink
  600: '#db2777',
  700: '#be185d',
  800: '#9f1239',
  900: '#831843',
} as const;

// ============================================
// SEMANTIC COLORS
// ============================================
export const SUCCESS = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
} as const;

export const WARNING = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
} as const;

export const ERROR = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
} as const;

export const INFO = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
} as const;

// ============================================
// NEUTRAL COLORS
// ============================================
export const NEUTRAL = {
  white: '#ffffff',
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  black: '#000000',
} as const;

// ============================================
// DARK MODE COLORS
// ============================================
export const DARK = {
  bg: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceElevated: '#262626',
  border: '#404040',
  text: {
    primary: '#ffffff',
    secondary: '#a3a3a3',
    tertiary: '#737373',
  },
} as const;

// ============================================
// LIGHT MODE COLORS
// ============================================
export const LIGHT = {
  bg: '#ffffff',
  surface: '#fafafa',
  surfaceElevated: '#f5f5f5',
  border: '#e5e5e5',
  text: {
    primary: '#0a0a0a',
    secondary: '#525252',
    tertiary: '#737373',
  },
} as const;

// ============================================
// EXPORT ALL COLORS AS DEFAULT THEME
// ============================================
export const THEME = {
  primary: PRIMARY,
  secondary: SECONDARY,
  accent: ACCENT,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  info: INFO,
  neutral: NEUTRAL,
  dark: DARK,
  light: LIGHT,
} as const;

// Type exports for TypeScript autocomplete
export type ThemeColors = typeof THEME;
export type PrimaryColor = keyof typeof PRIMARY;
export type SecondaryColor = keyof typeof SECONDARY;
export type AccentColor = keyof typeof ACCENT;
