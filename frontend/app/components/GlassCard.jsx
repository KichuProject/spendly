import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { GLASS, SHADOWS, COLORS } from '../styles/theme';

export default function GlassCard({
  children,
  style,
  variant = 'default', // default, elevated, input, hero
  glowColor,
  noPadding = false,
  blurIntensity = 40,
}) {
  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    variant === 'input' && styles.input,
    variant === 'hero' && styles.hero,
    glowColor && { borderColor: glowColor, ...SHADOWS.glow(glowColor) },
    noPadding && { padding: 0 },
    style,
  ];

  if (Platform.OS === 'web') {
    return (
      <View style={[cardStyle, styles.webGlass]}>
        <View style={styles.shimmer} />
        {children}
      </View>
    );
  }

  return (
    <View style={[cardStyle, { overflow: 'hidden' }]}>
      <BlurView intensity={blurIntensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.shimmer} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: GLASS.card.backgroundColor,
    borderColor: GLASS.card.borderColor,
    borderWidth: GLASS.card.borderWidth,
    borderRadius: GLASS.card.borderRadius,
    padding: 16,
    ...SHADOWS.medium,
  },
  elevated: {
    backgroundColor: GLASS.cardElevated.backgroundColor,
    borderColor: GLASS.cardElevated.borderColor,
    borderRadius: GLASS.cardElevated.borderRadius,
  },
  input: {
    backgroundColor: GLASS.input.backgroundColor,
    borderColor: GLASS.input.borderColor,
    borderRadius: GLASS.input.borderRadius,
    padding: 12,
  },
  hero: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderColor: 'rgba(124,58,237,0.4)',
    borderRadius: 28,
    padding: 20,
  },
  webGlass: Platform.select({
    web: {
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    },
    default: {},
  }),
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '40%',
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderTopLeftRadius: 24,
  },
});
