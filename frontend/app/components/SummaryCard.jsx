import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import CategoryIcon from './CategoryIcon';
import { COLORS } from '../styles/theme';

export default function SummaryCard({ emoji, label, value, glowColor, style }) {
  // Derive solid icon color from the transparent glow color for high-contrast crispness
  const iconColor = glowColor 
    ? glowColor.replace(/[\d\.]+\)$/, '1)') // Replaces alpha (e.g. 0.4 or 0.5) with 1
    : '#FFFFFF';

  return (
    <GlassCard style={[styles.card, style]} glowColor={glowColor}>
      <CategoryIcon
        emoji={emoji}
        size={24}
        color={iconColor}
        style={styles.emoji}
      />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { width: 140, padding: 16, alignItems: 'center', marginRight: 12 },
  emoji: { marginBottom: 8, height: 26, justifyContent: 'center', alignItems: 'center' },
  value: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  label: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
