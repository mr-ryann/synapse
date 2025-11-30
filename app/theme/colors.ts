
// Global color palette for the "Philosopher" theme
// Deep Licorice, Gold, and Warm Stone aesthetic for focused thinking

export const COLORS = {
  // Core backgrounds
  background: {
    primary: '#0C0A09',   // Deep Licorice (Option A - OLED friendly)
    secondary: '#1C1917', // Warm Stone for surfaces
    elevated: '#292524',  // Lighter Stone for cards/modals
  },

  // Text colors
  text: {
    primary: '#f0eee7',   // Parchment White (Your specific request)
    secondary: '#A8A29E', // Warm Grey
    muted: '#57534E',     // Deep Stone (for metadata/disabled)
  },

  // Accent colors
  accent: {
    primary: '#F58727',   // Pure Gold (Option B - The "Waypoints" color)
    secondary: '#F8A863', // Metallic Bronze/Darker Gold
    tertiary: '#78716C',  // Stone Grey (Neutral accent)
  },

  // Semantic colors (Muted to fit the serious tone)
  semantic: {
    success: '#467814',   // Emerald
    error: '#EF4444',     // Matte Red
    warning: '#E86615',   // Amber
    info: '#0EA5E9',      // Sky Blue (for neutral info)
  },

  // Borders and dividers
  border: {
    subtle: '#1C1917',    // Very subtle separation
    default: '#292524',   // Standard card border
    accent: '#F58727',    // Gold border for active states
  },

  // Shadows / overlays
  overlay: {
    scrim: 'rgba(12, 10, 9, 0.9)',      // Deep warm dark overlay
    glow: 'rgba(255, 215, 0, 0.15)',    // Subtle Gold glow (low opacity)
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
