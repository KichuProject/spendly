// ThemedText — Auto-themed typography component
import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

/**
 * @param {string} variant - Typography variant: hero|h1|h2|h3|body|bodySmall|caption|label|amount|amountSmall|amountTiny|button|buttonSmall
 * @param {string} color - Color key: primary|secondary|tertiary|muted|inverse|success|danger|warning|income|expense|accent|primaryText
 */
export default function ThemedText({ variant = 'body', color = 'primary', style, children, ...props }) {
  const { colors, typography } = useTheme();

  const colorMap = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    muted: colors.textMuted,
    inverse: colors.textInverse,
    success: colors.success,
    danger: colors.danger,
    warning: colors.warning,
    income: colors.income,
    expense: colors.expense,
    accent: colors.accent,
    primaryText: colors.primaryText,
    blue: colors.primary,
  };

  const typo = typography[variant] || typography.body;

  return (
    <Text
      style={[
        typo,
        { color: colorMap[color] || colorMap.primary },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
