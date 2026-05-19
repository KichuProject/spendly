import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import GlassCard from './GlassCard';
import CategoryIcon from './CategoryIcon';
import { getCategoryColorByEmoji } from '../utils/categoryUtils';
import { COLORS, SPACING, WEB_STYLES } from '../styles/theme';
import { getDayNumber, getMonthShort, getDayName, isToday, isPast, toDateKey, getDayNameShort } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currencyUtils';

export default function DayCard({ date, expenses, isComplete, onPress }) {
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
  let statusColor = COLORS.positive;
  let borderColor = 'rgba(52,211,153,0.5)'; // Elegant green glow for completed!

  if (today && !isComplete) {
    const currentHours = new Date().getHours();
    if (currentHours >= 22) {
      // 10:00 PM - 11:59 PM: Warning alert style
      statusIcon = '⚠️';
      statusLabel = 'Today';
      statusColor = COLORS.pending;
      borderColor = 'rgba(251,191,36,0.6)';
    } else {
      // Before 10:00 PM: Neutral Today style (no warning color)
      statusIcon = '📅';
      statusLabel = 'Today';
      statusColor = '#A78BFA'; // Theme purple
      borderColor = 'rgba(167,139,250,0.5)';
    }
  } else if (overdue) {
    statusIcon = '🔴';
    statusLabel = 'Overdue';
    statusColor = COLORS.negative;
    borderColor = 'rgba(251,113,133,0.5)';
  } else if (!isComplete) {
    statusIcon = '⚠️';
    statusLabel = 'Incomplete';
    statusColor = COLORS.pending;
    borderColor = 'rgba(251,191,36,0.5)';
  }

  const onIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 10 }).start();
  const onOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.wrapper]}>
      <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut} style={[WEB_STYLES.cursor]}>
        <GlassCard style={[styles.card, overdue && styles.overdueCard]} glowColor={borderColor}>
          {overdue && <View style={styles.overdueStripe} />}
          <View style={styles.row}>
            <View style={[styles.dateCircle, { borderColor }]}>
              <Text style={styles.dateNum}>{dayNum}</Text>
              <Text style={styles.dateMonth}>{monthShort}</Text>
            </View>
            <View style={styles.center}>
              <Text style={styles.dayName}>{dayName}</Text>
              <Text style={styles.dayShort}>{dayShort}</Text>
              <Text style={styles.total}>{formatCurrency(total)}</Text>
            </View>
            <View style={styles.right}>
              <View style={[styles.badge, { backgroundColor: statusColor + '15', borderColor: statusColor + '30', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <CategoryIcon emoji={statusIcon} size={11} color={statusColor} />
                <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
              </View>
            </View>
          </View>
          <View style={styles.bottomRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.emojiRow}>
              {categoryEmojis.map((e, i) => (
                <CategoryIcon
                  key={i}
                  emoji={e}
                  size={16}
                  color={getCategoryColorByEmoji(e) || '#FFFFFF'}
                  style={styles.categoryEmoji}
                />
              ))}
            </View>
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 12 },
  card: { padding: 16, overflow: 'hidden' },
  overdueCard: { backgroundColor: 'rgba(251,113,133,0.08)' },
  overdueStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: COLORS.negative, borderTopLeftRadius: 24, borderBottomLeftRadius: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dateCircle: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  dateNum: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', lineHeight: 22 },
  dateMonth: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  center: { flex: 1 },
  dayName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  dayShort: { color: COLORS.textMuted, fontSize: 12, marginTop: 1 },
  total: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 4 },
  right: { alignItems: 'flex-end' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  chip: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  emojiRow: { flexDirection: 'row', gap: 4 },
  categoryEmoji: { fontSize: 16 },
});
