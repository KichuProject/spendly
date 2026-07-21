// StatCard — Summary statistic with count-up animation
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';
import CountUp from '../animations/CountUp';

export default function StatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  trend, // 'up' | 'down' | null
  trendLabel,
  icon,
  color, // override color key: 'income' | 'expense' | 'primary' | 'success' | 'warning'
  compact = false,
  style,
}) {
  const { colors, typography, radius, spacing, elevation } = useTheme();

  const accentColor = color ? (colors[color] || colors.primary) : colors.primary;

  const trendColors = {
    up: colors.income,
    down: colors.expense,
  };

  if (compact) {
    return (
      <View style={[styles.compact, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }, style]}>
        {icon && <View style={[styles.compactIcon, { backgroundColor: `${accentColor}14` }]}>{icon}</View>}
        <View style={styles.compactContent}>
          <Text style={[typography.caption, { color: colors.textTertiary }]} numberOfLines={1}>{title}</Text>
          <CountUp value={typeof value === 'number' ? value : 0} prefix={prefix} suffix={suffix} variant="amountSmall" color="primary" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }, elevation.sm, style]}>
      <View style={styles.header}>
        {icon && <View style={[styles.iconBg, { backgroundColor: `${accentColor}14` }]}>{icon}</View>}
        <Text style={[typography.caption, { color: colors.textTertiary }]}>{title}</Text>
      </View>
      <CountUp value={typeof value === 'number' ? value : 0} prefix={prefix} suffix={suffix} variant="amount" color="primary" style={{ marginTop: spacing.sm }} />
      {trend && trendLabel && (
        <View style={[styles.trendRow, { marginTop: spacing.xs }]}>
          <Text style={[typography.caption, { color: trendColors[trend] || colors.textTertiary }]}>
            {trend === 'up' ? '↑' : '↓'} {trendLabel}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Compact variant
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    gap: 10,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContent: {
    flex: 1,
    gap: 2,
  },
});
