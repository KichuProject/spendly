// TransactionRow — Clean transaction list item with category icon and amount
import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';
import { getCategoryInfo } from '../../utils/categoryUtils';
import { formatCurrency } from '../../utils/currencyUtils';

export default function TransactionRow({
  expense,
  onPress,
  onLongPress,
  showDate = false,
  style,
}) {
  const { colors, typography, radius, spacing } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  if (!expense) return null;

  const categoryInfo = getCategoryInfo(expense.category);
  const isIncome = expense.type === 'income';
  const amountColor = isIncome ? colors.income : colors.expense;
  const amountPrefix = isIncome ? '+' : '-';

  const dateStr = showDate && expense.date
    ? new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, damping: 20, stiffness: 400 }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 400 }).start()}
        style={[styles.row, { borderBottomColor: colors.border }, style]}
      >
        {/* Category Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${categoryInfo?.color || colors.primary}14`, borderRadius: radius.md }]}>
          <Text style={styles.emoji}>{expense.emoji || categoryInfo?.emoji || '💰'}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[typography.body, { color: colors.textPrimary }]} numberOfLines={1}>
            {expense.reason}
          </Text>
          <View style={styles.meta}>
            <Text style={[typography.caption, { color: colors.textTertiary }]}>
              {expense.category || 'Other'}
            </Text>
            {dateStr && (
              <Text style={[typography.caption, { color: colors.textMuted }]}> · {dateStr}</Text>
            )}
            {expense.paymentMethod && expense.paymentMethod !== 'cash' && (
              <Text style={[typography.caption, { color: colors.textMuted }]}> · {expense.paymentMethod}</Text>
            )}
          </View>
        </View>

        {/* Amount */}
        <Text style={[typography.amountSmall, { color: amountColor }]}>
          {amountPrefix}{formatCurrency(expense.amount)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
