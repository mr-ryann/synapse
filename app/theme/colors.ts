// Global color palette for Synapse app
// Duolingo-inspired: bright, playful, cartoonish colors
// Change colors here to reflect across the entire app

export const COLORS = {
  // Primary colors (greens for success/progress)
  primary: {
    50: '#e8f5e8',
    100: '#d1f0d1',
    200: '#a3e0a3',
    300: '#75d075',
    400: '#47c047',
    500: '#1eb01e', // Main green
    600: '#1a961a',
    700: '#157315',
    800: '#0f4f0f',
    900: '#0a2a0a',
  },

  // Secondary colors (oranges for energy/challenges)
  secondary: {
    50: '#fff7e6',
    100: '#ffedcc',
    200: '#ffdb99',
    300: '#ffc966',
    400: '#ffb733',
    500: '#ffa500', // Main orange
    600: '#e69500',
    700: '#cc8500',
    800: '#b37500',
    900: '#996500',
  },

  // Accent colors (purples for special elements)
  accent: {
    50: '#f3e8ff',
    100: '#e7d1ff',
    200: '#cf9fff',
    300: '#b76dff',
    400: '#9f3bff',
    500: '#8711ff',
    600: '#7a0fe6',
    700: '#6d0dcc',
    800: '#600bb3',
    900: '#530999',
  },

  // Neutral colors (grays for text/background)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Status colors
  success: '#1eb01e', // Same as primary 500
  warning: '#ffa500', // Same as secondary 500
  error: '#d32f2f',
  info: '#1976d2',

  // Backgrounds
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    dark: '#212121',
  },

  // Text colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    light: '#ffffff',
  },
};

// Export individual colors for easy access
export const {
  primary,
  secondary,
  accent,
  neutral,
  success,
  warning,
  error,
  info,
  background,
  text,
} = COLORS;
