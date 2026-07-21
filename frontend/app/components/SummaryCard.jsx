import React from 'react';
import { View, StyleSheet } from 'react-native';
import ThemedCard from './common/ThemedCard';
import ThemedText from './common/ThemedText';
import CategoryIcon from './CategoryIcon';
import CountUp from './animations/CountUp';
import { useTheme } from '../styles/ThemeContext';

export default function SummaryCard({ emoji, label, value, glowColor, style }) {
  const { colors } = useTheme();

  // Derive solid icon color from the transparent glow color for high-contrast crispness
  const iconColor = glowColor 
    ? glowColor.replace(/[\d\.]+\)$/, '1)') // Replaces alpha (e.g. 0.4 or 0.5) with 1
    : colors.textPrimary;

  const glowBorder = glowColor ? { borderColor: glowColor, borderWidth: 1.5 } : {};

  return (
    <ThemedCard style={[styles.card, glowBorder, style]} elevated>
      <CategoryIcon
        emoji={emoji}
        size={24}
        color={iconColor}
        style={styles.emoji}
      />
      <CountUp value={value} prefix="₹" variant="body" color="primary" style={styles.value} />
      <ThemedText variant="caption" color="secondary" style={styles.label}>{label}</ThemedText>
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  card: { width: 140, padding: 16, alignItems: 'center', marginRight: 12 },
  emoji: { marginBottom: 8, height: 26, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 18, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  label: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
