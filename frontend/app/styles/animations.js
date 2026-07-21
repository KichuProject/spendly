// Spendly Animation Presets — Centralized motion config
// Use with react-native-reanimated and Animated API
import { Easing } from 'react-native';

// ──────────────────────────────────────────────
// Spring Configs (for Reanimated withSpring)
// ──────────────────────────────────────────────

export const springs = {
  /** Standard interaction spring — buttons, toggles */
  press: { damping: 20, stiffness: 400, mass: 0.6 },
  /** Bouncy spring — FABs, modals entering */
  bouncy: { damping: 12, stiffness: 350, mass: 0.5 },
  /** Gentle spring — page transitions, large elements */
  gentle: { damping: 28, stiffness: 200, mass: 1 },
  /** Snappy spring — chips, tabs, small toggles */
  snappy: { damping: 22, stiffness: 500, mass: 0.4 },
  /** Wobbly — fun celebrations, success animations */
  wobbly: { damping: 8, stiffness: 300, mass: 0.5 },
  /** Card entrance — natural deceleration */
  cardEntrance: { damping: 22, stiffness: 280, mass: 0.8 },
  /** Modal slide-up — smooth with slight overshoot */
  modalSlide: { damping: 18, stiffness: 260, mass: 0.7 },
  /** FAB rotation — tight and responsive */
  fabRotate: { damping: 16, stiffness: 380, mass: 0.5 },
};

// ──────────────────────────────────────────────
// Timing Configs (for Reanimated withTiming)
// ──────────────────────────────────────────────

export const timing = {
  instant: { duration: 100, easing: Easing.out(Easing.ease) },
  fast: { duration: 200, easing: Easing.out(Easing.cubic) },
  normal: { duration: 300, easing: Easing.out(Easing.cubic) },
  slow: { duration: 450, easing: Easing.inOut(Easing.cubic) },
  entrance: { duration: 600, easing: Easing.out(Easing.exp) },
  exit: { duration: 250, easing: Easing.in(Easing.cubic) },
  countUp: { duration: 800, easing: Easing.out(Easing.cubic) },
  chartDraw: { duration: 1000, easing: Easing.out(Easing.exp) },
  /** Typewriter character interval */
  typewriter: { duration: 25 },
  /** Ring progress fill */
  ringFill: { duration: 800, easing: Easing.out(Easing.cubic) },
  /** Toast slide-in */
  toastEnter: { duration: 350, easing: Easing.out(Easing.exp) },
  /** Toast slide-out */
  toastExit: { duration: 200, easing: Easing.in(Easing.cubic) },
};

// ──────────────────────────────────────────────
// Stagger Delays
// ──────────────────────────────────────────────

export const stagger = {
  fast: 30,
  normal: 50,
  slow: 80,
  /** List items in a long scrollable list */
  list: 40,
  /** Category icons in a grid */
  grid: 60,
  /** Menu items expanding from FAB */
  menu: 50,
};

/**
 * Get stagger delay for item at index
 * @param {number} index
 * @param {number} delay - ms between items (default 50)
 * @param {number} maxDelay - cap max total delay (default 500)
 */
export function getStaggerDelay(index, delay = stagger.normal, maxDelay = 500) {
  return Math.min(index * delay, maxDelay);
}

// ──────────────────────────────────────────────
// Common Transform Presets
// ──────────────────────────────────────────────

/** Button press scale values */
export const pressScale = {
  pressed: 0.96,
  released: 1,
  /** Subtle press for cards */
  cardPressed: 0.98,
};

/** Card entrance - starts from */
export const entranceFrom = {
  fadeUp: { opacity: 0, translateY: 16 },
  fadeDown: { opacity: 0, translateY: -16 },
  fadeLeft: { opacity: 0, translateX: -20 },
  fadeRight: { opacity: 0, translateX: 20 },
  scaleUp: { opacity: 0, scale: 0.92 },
  slideUp: { opacity: 0, translateY: 24 },
  none: { opacity: 1, translateY: 0 },
};

/** Card entrance - ends at */
export const entranceTo = {
  opacity: 1,
  translateY: 0,
  translateX: 0,
  scale: 1,
};

// ──────────────────────────────────────────────
// Floating Animation (logo hover, decorative)
// ──────────────────────────────────────────────

export const floating = {
  /** Vertical bob distance (px) */
  distance: 6,
  /** Full cycle duration (ms) */
  duration: 3000,
};

// ──────────────────────────────────────────────
// Thinking / AI Animations
// ──────────────────────────────────────────────

export const thinking = {
  /** Dot bounce height (px) */
  bounceHeight: 6,
  /** Stagger between dots (ms) */
  dotStagger: 150,
  /** Dot size (px) */
  dotSize: 8,
};

// ──────────────────────────────────────────────
// Pulse Animation
// ──────────────────────────────────────────────

export const pulse = {
  /** Notification badge pulse */
  badge: { minOpacity: 0.5, maxOpacity: 1, duration: 1200 },
  /** Loading indicator pulse */
  loading: { minOpacity: 0.4, maxOpacity: 0.8, duration: 1500 },
  /** Attention/highlight pulse */
  attention: { minOpacity: 0.6, maxOpacity: 1, duration: 1000 },
};

// ──────────────────────────────────────────────
// Skeleton Shimmer
// ──────────────────────────────────────────────

export const skeleton = {
  duration: 1200,
  /** Use for shimmer translateX animation range */
  shimmerRange: [-1, 2],
  /** Enhanced sweep duration */
  sweepDuration: 1500,
};

// ──────────────────────────────────────────────
// Calendar Animations
// ──────────────────────────────────────────────

export const calendar = {
  monthTransition: { duration: 300, easing: Easing.out(Easing.cubic) },
  dateSelect: { damping: 18, stiffness: 400, mass: 0.5 },
  dayHighlight: { duration: 200, easing: Easing.out(Easing.ease) },
};

// ──────────────────────────────────────────────
// Chart Animations
// ──────────────────────────────────────────────

export const chart = {
  barGrow: { duration: 800, easing: Easing.out(Easing.exp) },
  pieDraw: { duration: 1000, easing: Easing.out(Easing.cubic) },
  lineTrace: { duration: 1200, easing: Easing.inOut(Easing.cubic) },
  legendFade: { duration: 400, easing: Easing.out(Easing.ease) },
  /** Stagger delay between bars */
  barStagger: 60,
};

// ──────────────────────────────────────────────
// Theme Transition
// ──────────────────────────────────────────────

export const themeTransition = {
  duration: 300,
  easing: Easing.inOut(Easing.ease),
};

// ──────────────────────────────────────────────
// Swipe Actions
// ──────────────────────────────────────────────

export const swipe = {
  /** px threshold before action snaps open */
  threshold: 80,
  /** Width of each action button */
  actionWidth: 72,
  /** Spring config for snap */
  snap: { damping: 22, stiffness: 300 },
};

// ──────────────────────────────────────────────
// Success / Celebration
// ──────────────────────────────────────────────

export const success = {
  /** Checkmark draw delay after circle appears */
  checkDelay: 200,
  /** Circle pop spring */
  circleSpring: { damping: 12, stiffness: 300, mass: 0.5 },
  /** Checkmark bounce spring */
  checkSpring: { damping: 8, stiffness: 350, mass: 0.4 },
};
