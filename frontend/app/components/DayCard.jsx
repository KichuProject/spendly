import React, { useRef } from 'react';
import { View, Pressable, StyleSheet, Animated } from 'react-native';
import ThemedCard from './common/ThemedCard';
import ThemedText from './common/ThemedText';
import CategoryIcon from './CategoryIcon';
import { getCategoryColorByEmoji } from '../utils/categoryUtils';
import { getDayNumber, getMonthShort, getDayName, isToday, isPast, getDayNameShort } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currencyUtils';
import { useTheme } from '../styles/ThemeContext';
import { WEB_STYLES } from '../styles/theme';

export default function DayCard({ date, expenses, isComplete, onPress }) {
  const { colors, radius } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const dayNum = getDayNumber(date);
  const monthShort = getMonthShort(date);
  const dayName = getDayName(date);
  const dayShort = getDayNameShort(date);
  const today = isToday(date);
  const past = isPast(date) && !today;
  const overdue = past && !isComplete;
  const categoryEmojis = [...new Set(expenses.map((e) => e.emoji))].slice(0, 3);

  let statusIcon = '✅';
  let statusLabel = 'Complete';
  let statusColor = colors.success;
  let borderColor = colors.success + '80';

  if (today && !isComplete) {
    const currentHours = new Date().getHours();
    if (currentHours >= 22) {
      statusIcon = '⚠️';
      statusLabel = 'Today';
      statusColor = colors.warning;
      borderColor = colors.warning + 'B0';
    } else {
      statusIcon = '📅';
      statusLabel = 'Today';
      statusColor = colors.primary;
      borderColor = colors.primary + '80';
    }
  } else if (overdue) {
    statusIcon = '🔴';
    statusLabel = 'Overdue';
    statusColor = colors.danger;
    borderColor = colors.danger + '80';
  } else if (!isComplete) {
    statusIcon = '⚠️';
    statusLabel = 'Incomplete';
    statusColor = colors.warning;
    borderColor = colors.warning + '80';
  }

  const onIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 10 }).start();
  const onOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.wrapper]}>
      <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut} style={[WEB_STYLES.cursor]}>
        <ThemedCard 
          style={[
            styles.card, 
            overdue && { backgroundColor: colors.danger + '10' },
            { borderColor }
          ]}
        >
          {overdue && <View style={[styles.overdueStripe, { backgroundColor: colors.danger }]} />}
          <View style={styles.row}>
            <View style={[styles.dateCircle, { borderColor, backgroundColor: colors.surfaceSecondary }]}>
              <ThemedText variant="body" color="primary" style={styles.dateNum}>{dayNum}</ThemedText>
              <ThemedText variant="caption" color="secondary" style={styles.dateMonth}>{monthShort}</ThemedText>
            </View>
            <View style={styles.center}>
              <ThemedText variant="body" color="primary" style={styles.dayName}>{dayName}</ThemedText>
              <ThemedText variant="caption" color="secondary" style={styles.dayShort}>{dayShort}</ThemedText>
              <ThemedText variant="h3" color="primary" style={styles.total}>{formatCurrency(total)}</ThemedText>
            </View>
            <View style={styles.right}>
              <View style={[styles.badge, { backgroundColor: statusColor + '15', borderColor: statusColor + '30', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <CategoryIcon emoji={statusIcon} size={11} color={statusColor} />
                <ThemedText variant="caption" style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</ThemedText>
              </View>
            </View>
          </View>
          <View style={[styles.bottomRow, { borderTopColor: colors.borderLight }]}>
            <View style={[styles.chip, { backgroundColor: colors.surfaceSecondary }]}>
              <ThemedText variant="caption" color="secondary" style={styles.chipText}>{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</ThemedText>
            </View>
            <View style={styles.emojiRow}>
              {categoryEmojis.map((e, i) => (
                <CategoryIcon
                  key={i}
                  emoji={e}
                  size={16}
                  color={getCategoryColorByEmoji(e) || colors.textPrimary}
                  style={styles.categoryEmoji}
                />
              ))}
            </View>
          </View>
        </ThemedCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 12 },
  card: { padding: 16, overflow: 'hidden' },
  overdueStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 24, borderBottomLeftRadius: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dateCircle: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dateNum: { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  dateMonth: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  center: { flex: 1 },
  dayName: { fontSize: 16, fontWeight: '700' },
  dayShort: { fontSize: 12, marginTop: 1 },
  total: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  right: { alignItems: 'flex-end' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipText: { fontSize: 11, fontWeight: '600' },
  emojiRow: { flexDirection: 'row', gap: 4 },
  categoryEmoji: { fontSize: 16 },
});
