// Spendly Design System — Liquid Glassmorphism Tokens
import { Platform } from 'react-native';

export const COLORS = {
  // Background mesh gradient stops
  bgDark: '#0F0C29',
  bgMid: '#302B63',
  bgLight: '#24243E',

  // Primary gradient (violet → indigo → sky)
  primary: '#7C3AED',
  primaryMid: '#4F46E5',
  primaryEnd: '#0EA5E9',

  // Secondary gradient (rose → pink → purple)
  secondary: '#F43F5E',
  secondaryMid: '#EC4899',
  secondaryEnd: '#A855F7',

  // Success
  success: '#10B981',
  successDark: '#059669',
  successLight: '#34D399',

  // Warning / Error
  warning: '#F59E0B',
  error: '#EF4444',
  errorLight: '#FB7185',
  pending: '#FBBF24',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.45)',

  // Status
  positive: '#34D399',
  negative: '#FB7185',

  // Glass
  glassBase: 'rgba(255,255,255,0.10)',
  glassLight: 'rgba(255,255,255,0.15)',
  glassMedium: 'rgba(255,255,255,0.18)',
  glassBorder: 'rgba(255,255,255,0.22)',
  glassBorderLight: 'rgba(255,255,255,0.12)',
  glassShimmer: 'rgba(255,255,255,0.5)',
  glassInputBg: 'rgba(0,0,0,0.25)',
  glassActiveBorder: 'rgba(139,92,246,0.8)',

  // Liquid button
  liquidInactive: 'rgba(255,255,255,0.12)',
  liquidInactiveBorder: 'rgba(255,255,255,0.30)',
  liquidActiveStart: '#F59E0B',
  liquidActiveMid: '#FBBF24',
  liquidActiveEnd: '#F97316',
  liquidHighlight: 'rgba(255,255,255,0.6)',
  liquidShadow: 'rgba(0,0,0,0.45)',

  // Tab bar
  tabActive: '#7C3AED',
  tabInactive: 'rgba(255,255,255,0.4)',
};

export const GRADIENTS = {
  primary: ['#7C3AED', '#4F46E5', '#0EA5E9'],
  secondary: ['#F43F5E', '#EC4899', '#A855F7'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#EF4444'],
  background: ['#0F0C29', '#302B63', '#24243E'],
  backgroundAlt: ['#0F0C29', '#1a1545', '#302B63', '#24243E'],
  violet: ['#7C3AED', '#6D28D9'],
  indigo: ['#4F46E5', '#4338CA'],
  emerald: ['#10B981', '#059669'],
  rose: ['#F43F5E', '#E11D48'],
  amber: ['#F59E0B', '#D97706'],
  liquidActive: ['#FBBF24', '#F59E0B', '#F97316'],
  liquidInactive: ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.08)'],
  heroCard: ['rgba(124,58,237,0.25)', 'rgba(79,70,229,0.15)'],
};

export const GLASS = {
  card: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5,
    borderRadius: 24,
  },
  cardElevated: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1.5,
    borderRadius: 28,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderRadius: 16,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1.5,
    borderRadius: 20,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderRadius: 50,
  },
  liquidButton: {
    borderRadius: 30,
    ...Platform.select({
      web: { boxShadow: '0 8px 16px rgba(0,0,0,0.4)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
      },
    }),
  },
  liquidTray: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderRadius: 36,
    padding: 8,
  },
};

export const SHADOWS = {
  small: Platform.select({
    web: { boxShadow: '0 2px 8px rgba(0,0,0,0.25)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
  }),
  medium: Platform.select({
    web: { boxShadow: '0 4px 16px rgba(0,0,0,0.3)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
  }),
  large: Platform.select({
    web: { boxShadow: '0 8px 32px rgba(0,0,0,0.37)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.37,
      shadowRadius: 32,
      elevation: 16,
    },
  }),
  glow: (color = '#7C3AED') => Platform.select({
    web: { boxShadow: `0 0 20px ${color}99` },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 12,
    },
  }),
};

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

// Helper to build font family with web fallbacks
const fontFamily = (native) => Platform.select({
  web: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
  default: native,
});

export const TYPOGRAPHY = {
  hero: {
    fontSize: 48,
    fontFamily: fontFamily('Inter_800ExtraBold'),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  h1: {
    fontSize: 32,
    fontFamily: fontFamily('Inter_700Bold'),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  h2: {
    fontSize: 24,
    fontFamily: fontFamily('Inter_700Bold'),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  h3: {
    fontSize: 20,
    fontFamily: fontFamily('Inter_700Bold'),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  body: {
    fontSize: 16,
    fontFamily: fontFamily('Inter_500Medium'),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  bodySmall: {
    fontSize: 14,
    fontFamily: fontFamily('Inter_500Medium'),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  label: {
    fontSize: 12,
    fontFamily: fontFamily('Inter_400Regular'),
    fontWeight: '400',
    color: 'rgba(255,255,255,0.45)',
  },
  labelBold: {
    fontSize: 12,
    fontFamily: fontFamily('Inter_700Bold'),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  amount: {
    fontSize: 40,
    fontFamily: fontFamily('Inter_800ExtraBold'),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  amountSmall: {
    fontSize: 20,
    fontFamily: fontFamily('Inter_700Bold'),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  button: {
    fontSize: 16,
    fontFamily: fontFamily('Inter_700Bold'),
    fontWeight: '700',
    color: '#FFFFFF',
  },
};

export const BORDER_RADIUS = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 28,
  xxl: 36,
  pill: 50,
  circle: 999,
};

export const ANIMATION = {
  spring: {
    tension: 80,
    friction: 12,
  },
  springBouncy: {
    tension: 100,
    friction: 8,
  },
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

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
