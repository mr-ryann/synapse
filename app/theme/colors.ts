// Global color palette for the "Aether" theme
// Dark, high-contrast, tech-forward aesthetic inspired by Synapse brand

export const COLORS = {
  // Core backgrounds
  background: {
    primary: '#000000', // True black
    secondary: '#121212', // Dark charcoal for surfaces
    elevated: '#1a1a1a', // Slightly lighter for cards
  },

  // Text colors
  text: {
    primary: '#F0EEE7', // Off-white
    secondary: '#AAAAAA',
    muted: '#777777',
  },

  // Accent colors inspired by the Synapse gradient
  accent: {
    primary: '#E03B8C', // Vibrant Magenta/Pink
    secondary: '#6F22BC', // Rich Purple
    tertiary: '#2B9AF4', // Cool electric blue for highlights
  },

  // Semantic colors (cyber-inspired variants)
  semantic: {
    success: '#36D47D',
    error: '#FF5E5E',
    warning: '#FFB347',
    info: '#4FB8FF',
  },

  // Borders and dividers
  border: {
    subtle: '#1f1f1f',
    default: '#2c2c2c',
    accent: '#E03B8C',
  },

  // Shadows / overlays
  overlay: {
    scrim: 'rgba(0, 0, 0, 0.7)',
    glow: 'rgba(224, 59, 140, 0.35)',
  },
};

export const {
  background,
  text,
  accent,
  semantic,
  border,
  overlay,
} = COLORS;
