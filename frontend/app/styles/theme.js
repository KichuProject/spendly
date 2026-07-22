// Spendly Design System — Premium Dual-Theme Tokens
// Supports Light, Dark, and System-follow modes
import { Platform } from 'react-native';

// ──────────────────────────────────────────────
// Color Palettes
// ──────────────────────────────────────────────

const palette = {
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',

  // Light neutrals (warm whites)
  gray50: '#FAFAF8',
  gray100: '#F5F5F3',
  gray150: '#EFEFED',
  gray200: '#E8E8E6',
  gray300: '#D4D4D2',
  gray400: '#A3A3A1',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',

  // Dark surfaces (layered elevation)
  dark0: '#0C0C0E',
  dark1: '#131315',
  dark2: '#1A1A1C',
  dark3: '#212123',
  dark4: '#2A2A2D',
  dark5: '#333336',

  // Primary blue
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',

  // Success green
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D',

  // Warning amber
  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',

  // Danger red
  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red400: '#F87171',
  red500: '#EF4444',
  red600: '#DC2626',

  // Accent purple (for AI features)
  purple400: '#A78BFA',
  purple500: '#8B5CF6',
  purple600: '#7C3AED',
};

// ──────────────────────────────────────────────
// Theme Definitions
// ──────────────────────────────────────────────

const lightColors = {
  // Backgrounds
  bg: palette.gray50,
  bgSecondary: palette.gray100,
  bgTertiary: palette.gray150,

  // Surfaces (cards, sheets, modals)
  surface: palette.white,
  surfaceSecondary: palette.gray100,
  surfaceElevated: palette.white,

  // Borders
  border: palette.gray200,
  borderLight: palette.gray150,
  borderStrong: palette.gray300,

  // Text
  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray500,
  textMuted: palette.gray400,
  textInverse: palette.white,

  // Primary accent
  primary: palette.blue600,
  primaryLight: palette.blue50,
  primaryMuted: palette.blue100,
  primaryText: palette.blue700,

  // Semantic
  success: palette.green600,
  successLight: palette.green50,
  successMuted: palette.green100,
  successText: palette.green700,

  warning: palette.amber500,
  warningLight: palette.amber50,
  warningMuted: palette.amber100,
  warningText: palette.amber600,

  danger: palette.red500,
  dangerLight: palette.red50,
  dangerMuted: palette.red100,
  dangerText: palette.red600,

  // Accent (AI)
  accent: palette.purple600,
  accentLight: '#F5F3FF',
  accentMuted: '#EDE9FE',

  // Income / Expense
  income: palette.green600,
  incomeLight: palette.green50,
  expense: palette.red500,
  expenseLight: palette.red50,

  // Interactive
  pressed: 'rgba(0,0,0,0.05)',
  highlight: palette.blue50,
  skeleton: palette.gray200,
  skeletonHighlight: palette.gray100,

  // Tab bar
  tabActive: palette.blue600,
  tabInactive: palette.gray400,
  tabBg: palette.white,
  tabBorder: palette.gray200,

  // StatusBar
  statusBarStyle: 'dark-content',
  statusBarBg: palette.gray50,

  // Overlay
  overlay: 'rgba(0,0,0,0.4)',
  overlayLight: 'rgba(0,0,0,0.1)',
};

const darkColors = {
  // Backgrounds
  bg: palette.dark0,
  bgSecondary: palette.dark1,
  bgTertiary: palette.dark2,

  // Surfaces
  surface: palette.dark2,
  surfaceSecondary: palette.dark3,
  surfaceElevated: palette.dark3,

  // Borders
  border: palette.dark4,
  borderLight: palette.dark3,
  borderStrong: palette.dark5,

  // Text
  textPrimary: '#F0F0F2',
  textSecondary: '#A0A0A4',
  textTertiary: '#707074',
  textMuted: '#505054',
  textInverse: palette.gray900,

  // Primary accent
  primary: palette.blue500,
  primaryLight: 'rgba(59,130,246,0.12)',
  primaryMuted: 'rgba(59,130,246,0.18)',
  primaryText: palette.blue400,

  // Semantic
  success: palette.green500,
  successLight: 'rgba(34,197,94,0.12)',
  successMuted: 'rgba(34,197,94,0.18)',
  successText: palette.green400,

  warning: palette.amber500,
  warningLight: 'rgba(245,158,11,0.12)',
  warningMuted: 'rgba(245,158,11,0.18)',
  warningText: palette.amber400,

  danger: palette.red500,
  dangerLight: 'rgba(239,68,68,0.12)',
  dangerMuted: 'rgba(239,68,68,0.18)',
  dangerText: palette.red400,

  // Accent (AI)
  accent: palette.purple500,
  accentLight: 'rgba(139,92,246,0.12)',
  accentMuted: 'rgba(139,92,246,0.18)',

  // Income / Expense
  income: palette.green400,
  incomeLight: 'rgba(34,197,94,0.12)',
  expense: palette.red400,
  expenseLight: 'rgba(239,68,68,0.12)',

  // Interactive
  pressed: 'rgba(255,255,255,0.06)',
  highlight: 'rgba(59,130,246,0.12)',
  skeleton: palette.dark3,
  skeletonHighlight: palette.dark4,

  // Tab bar
  tabActive: palette.blue400,
  tabInactive: '#606064',
  tabBg: palette.dark1,
  tabBorder: palette.dark3,

  // StatusBar
  statusBarStyle: 'light-content',
  statusBarBg: palette.dark0,

  // Overlay
  overlay: 'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(0,0,0,0.3)',
};

// ──────────────────────────────────────────────
// Typography
// ──────────────────────────────────────────────

const fontFamily = (native) => Platform.select({
  web: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
  default: undefined,
});

export const TYPOGRAPHY = {
  hero: {
    fontSize: 44,
    fontFamily: fontFamily('Inter_800ExtraBold'),
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  h1: {
    fontSize: 30,
    fontFamily: fontFamily('Inter_700Bold'),
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  h2: {
    fontSize: 22,
    fontFamily: fontFamily('Inter_700Bold'),
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontFamily: fontFamily('Inter_700Bold'),
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontFamily: fontFamily('Inter_500Medium'),
    fontWeight: '500',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontFamily: fontFamily('Inter_500Medium'),
    fontWeight: '500',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontFamily: fontFamily('Inter_500Medium'),
    fontWeight: '500',
    lineHeight: 16,
  },
  label: {
    fontSize: 12,
    fontFamily: fontFamily('Inter_400Regular'),
    fontWeight: '400',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    lineHeight: 16,
  },
  amount: {
    fontSize: 36,
    fontFamily: fontFamily('Inter_800ExtraBold'),
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 44,
  },
  amountSmall: {
    fontSize: 20,
    fontFamily: fontFamily('Inter_700Bold'),
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  amountTiny: {
    fontSize: 13,
    fontFamily: fontFamily('Inter_700Bold'),
    fontWeight: '700',
    lineHeight: 16,
  },
  button: {
    fontSize: 15,
    fontFamily: fontFamily('Inter_700Bold'),
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  buttonSmall: {
    fontSize: 13,
    fontFamily: fontFamily('Inter_700Bold'),
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 18,
  },
};

// ──────────────────────────────────────────────
// Spacing
// ──────────────────────────────────────────────

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

// ──────────────────────────────────────────────
// Border Radius
// ──────────────────────────────────────────────

export const RADIUS = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

// ──────────────────────────────────────────────
// Elevation / Shadows
// ──────────────────────────────────────────────

const makeShadow = (offsetY, radius, opacity, color = '#000') => Platform.select({
  web: { boxShadow: `0 ${offsetY}px ${radius}px rgba(0,0,0,${opacity})` },
  default: {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.round(offsetY * 1.5),
  },
});

export const ELEVATION = {
  none: {},
  sm: makeShadow(1, 3, 0.08),
  md: makeShadow(2, 8, 0.12),
  lg: makeShadow(4, 16, 0.16),
  xl: makeShadow(8, 24, 0.20),
};

// Dark mode needs different shadow approach (glow-like)
const makeDarkShadow = (offsetY, radius, opacity) => Platform.select({
  web: { boxShadow: `0 ${offsetY}px ${radius}px rgba(0,0,0,${opacity})` },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.round(offsetY * 1.5),
  },
});

export const ELEVATION_DARK = {
  none: {},
  sm: makeDarkShadow(1, 4, 0.3),
  md: makeDarkShadow(2, 10, 0.4),
  lg: makeDarkShadow(4, 20, 0.5),
  xl: makeDarkShadow(8, 30, 0.6),
};

// ──────────────────────────────────────────────
// Animation Tokens
// ──────────────────────────────────────────────

export const ANIMATION = {
  spring: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },
  springBouncy: {
    damping: 12,
    stiffness: 350,
    mass: 0.6,
  },
  springGentle: {
    damping: 28,
    stiffness: 200,
    mass: 1,
  },
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 450,
    entrance: 600,
  },
  easing: {
    enter: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0.0, 1, 1)',
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
  stagger: {
    fast: 30,
    normal: 50,
    slow: 80,
  },
};

// ──────────────────────────────────────────────
// Theme Builder
// ──────────────────────────────────────────────

export function getTheme(mode = 'light') {
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const elevation = isDark ? ELEVATION_DARK : ELEVATION;

  return {
    mode,
    isDark,
    colors,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    radius: RADIUS,
    elevation,
    animation: ANIMATION,
  };
}

// ──────────────────────────────────────────────
// Legacy Exports (backward compatibility)
// Screens that still import old tokens will
// get dark-theme values until migrated.
// ──────────────────────────────────────────────

export const COLORS = {
  // Map old keys → dark theme values for compat
  bgDark: palette.dark0,
  bgMid: palette.dark2,
  bgLight: palette.dark1,
  primary: palette.blue500,
  primaryMid: palette.blue600,
  primaryEnd: palette.blue400,
  secondary: palette.red500,
  secondaryMid: palette.red400,
  secondaryEnd: palette.purple500,
  success: palette.green500,
  successDark: palette.green600,
  successLight: palette.green400,
  warning: palette.amber500,
  error: palette.red500,
  errorLight: palette.red400,
  pending: palette.amber400,
  textPrimary: '#F0F0F2',
  textSecondary: '#A0A0A4',
  textMuted: '#505054',
  positive: palette.green400,
  negative: palette.red400,
  // Glass compat (used by unmigrated components)
  glassBase: 'rgba(255,255,255,0.06)',
  glassLight: 'rgba(255,255,255,0.10)',
  glassMedium: 'rgba(255,255,255,0.14)',
  glassBorder: 'rgba(255,255,255,0.16)',
  glassBorderLight: 'rgba(255,255,255,0.10)',
  glassShimmer: 'rgba(255,255,255,0.3)',
  glassInputBg: 'rgba(0,0,0,0.25)',
  glassActiveBorder: 'rgba(59,130,246,0.6)',
  liquidInactive: 'rgba(255,255,255,0.08)',
  liquidInactiveBorder: 'rgba(255,255,255,0.20)',
  liquidActiveStart: palette.amber500,
  liquidActiveMid: palette.amber400,
  liquidActiveEnd: '#F97316',
  liquidHighlight: 'rgba(255,255,255,0.4)',
  liquidShadow: 'rgba(0,0,0,0.45)',
  tabActive: palette.blue400,
  tabInactive: '#606064',
};

export const GRADIENTS = {
  primary: [palette.blue500, palette.blue600, palette.blue700],
  secondary: [palette.red500, palette.red400, palette.purple500],
  success: [palette.green500, palette.green600],
  warning: [palette.amber500, palette.red500],
  background: [palette.dark0, palette.dark2, palette.dark1],
  backgroundAlt: [palette.dark0, palette.dark1, palette.dark2, palette.dark1],
  violet: [palette.purple500, palette.purple600],
  indigo: [palette.blue600, palette.blue700],
  emerald: [palette.green500, palette.green600],
  rose: [palette.red500, palette.red600],
  amber: [palette.amber500, palette.amber600],
  liquidActive: [palette.amber400, palette.amber500, '#F97316'],
  liquidInactive: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)'],
  heroCard: ['rgba(59,130,246,0.15)', 'rgba(59,130,246,0.06)'],
};

export const SHADOWS = {
  small: ELEVATION.sm,
  medium: ELEVATION.md,
  large: ELEVATION.lg,
  glow: (color = palette.blue500) => Platform.select({
    web: { boxShadow: `0 0 20px ${color}66` },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 12,
    },
  }),
};

export const BORDER_RADIUS = RADIUS;

// Web-specific interactive utilities
export const WEB_STYLES = Platform.select({
  web: {
    cursor: { cursor: 'pointer' },
    cursorDefault: { cursor: 'default' },
    noSelect: { userSelect: 'none', WebkitUserSelect: 'none' },
    smoothTransition: { transition: 'all 0.2s ease' },
    hoverScale: { transition: 'transform 0.15s ease, opacity 0.15s ease' },
  },
  default: {
    cursor: {},
    cursorDefault: {},
    noSelect: {},
    smoothTransition: {},
    hoverScale: {},
  },
});
