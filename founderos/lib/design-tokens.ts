/**
 * FounderOS Premium Design System
 * Apple-level ultra-premium, minimal, high-end corporate aesthetic
 */

export const colors = {
  // Background hierarchy
  bg: {
    primary: '#0a0a0f',      // Deep, near-black charcoal
    secondary: '#12121c',    // Slightly lighter secondary surface
    tertiary: '#1a1a2e',     // Tertiary surface for cards/panels
    hover: '#16161f',        // Hover state elevation
  },

  // Text hierarchy
  text: {
    primary: '#f1f5f9',      // Primary text, high contrast
    secondary: '#cbd5e1',    // Secondary text, medium contrast
    tertiary: '#94a3b8',     // Tertiary text, low contrast (muted)
    muted: '#64748b',        // Muted/disabled text
    inverse: '#0a0a0f',      // Inverse (on light backgrounds)
  },

  // Brand accents (from existing exus tokens)
  brand: {
    lime: '#84cc16',         // Primary action, success, "go"
    cyan: '#06b6d4',         // Validation, trust, info
    pink: '#ec4899',         // Brainstorm (adversarial), secondary action
    gold: '#f59e0b',         // Market research, warning, attention
    purple: '#7c3aed',       // Feasibility, architecture
    peach: '#fb7185',        // Risk, error, critical
  },

  // Functional
  success: '#10b981',        // Success states
  warning: '#f59e0b',        // Warning states
  error: '#ef4444',          // Error states
  info: '#06b6d4',           // Info states

  // Transparency
  overlay: 'rgba(10, 10, 15, 0.5)',
  glass: 'rgba(10, 10, 15, 0.65)',
}

export const typography = {
  fontFamily: {
    display: '"Space Grotesk", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
}

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
}

export const borderRadius = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
}

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  // Premium glows
  glow: 'inset 0 0 20px rgba(132, 204, 22, 0.1)',
  glowLime: '0 0 20px rgba(132, 204, 22, 0.15)',
  glowCyan: '0 0 20px rgba(6, 182, 212, 0.15)',
}

export const motion = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
}

export const layout = {
  maxWidth: '1280px',
  containerPadding: spacing.lg,
  gapBase: spacing.md,
}
