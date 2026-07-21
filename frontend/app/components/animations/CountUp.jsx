// CountUp — Animated number counter
import React, { useEffect, useRef } from 'react';
import { Text, Animated } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

export default function CountUp({
  value = 0,
  prefix = '',
  suffix = '',
  duration = 800,
  variant = 'amount',
  color = 'primary',
  formatFn, // optional custom formatter
  style,
}) {
  const { colors, typography } = useTheme();
  const animValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = React.useState(0);

  const colorMap = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    income: colors.income,
    expense: colors.expense,
    success: colors.success,
    danger: colors.danger,
  };

  useEffect(() => {
    animValue.setValue(0);

    const listener = animValue.addListener(({ value: v }) => {
      setDisplayValue(Math.round(v * value));
    });

    Animated.timing(animValue, {
      toValue: 1,
      duration,
      useNativeDriver: false, // Must be false for value listener
    }).start();

    return () => {
      animValue.removeListener(listener);
    };
  }, [value, duration]);

  const formatted = formatFn
    ? formatFn(displayValue)
    : displayValue.toLocaleString('en-IN');

  return (
    <Text style={[typography[variant] || typography.amount, { color: colorMap[color] || colorMap.primary }, style]}>
      {prefix}{formatted}{suffix}
    </Text>
  );
}
