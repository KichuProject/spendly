import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ThemedView from '../components/common/ThemedView';
import ThemedText from '../components/common/ThemedText';
import ThemedCard from '../components/common/ThemedCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import AnimatedPieChart, { PieChartLegend } from '../components/charts/AnimatedPieChart';
import AnimatedBarChart from '../components/charts/AnimatedBarChart';
import FadeIn, { FadeInStagger } from '../components/animations/FadeIn';
import CountUp from '../components/animations/CountUp';
import SlideUp from '../components/animations/SlideUp';

import useExpenseStore from '../state/useExpenseStore';
import useFriendsStore from '../state/useFriendsStore';
import useFilterStore from '../state/useFilterStore';
import { useTheme } from '../styles/ThemeContext';
import { formatCurrency } from '../utils/currencyUtils';
import {
  formatMonthYear,
  getStartOfMonth,
  getEndOfMonth,
  toDateKey,
  getDaysInRange,
  isSameDay,
  getStartOfWeek,
  parseDateSafely,
  getStartOfDay,
} from '../utils/dateUtils';
import { getScreenPaddingTop } from '../utils/platformUtils';
import { WEB_STYLES } from '../styles/theme';

const TIMEFRAMES = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, elevation } = useTheme();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  const expenses = useExpenseStore((s) => s.expenses);
  const getCategoryBreakdown = useExpenseStore((s) => s.getCategoryBreakdown);
  const getIncomeCategoryBreakdown = useExpenseStore((s) => s.getIncomeCategoryBreakdown);
  const getTopExpenses = useExpenseStore((s) => s.getTopExpenses);
  const getTopIncomes = useExpenseStore((s) => s.getTopIncomes);
  const friends = useFriendsStore((s) => s.friends);
  const getFriendBalance = useFriendsStore((s) => s.getFriendBalance);
  const { statsTimeframe, setStatsTimeframe } = useFilterStore();
  const installDate = useExpenseStore((s) => s.installDate);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeSegment, setActiveSegment] = useState('expenses'); // 'expenses' or 'incomes'

  const installMonth = useMemo(() => {
    if (!installDate) return null;
    const d = parseDateSafely(installDate);
    return getStartOfMonth(d);
  }, [installDate]);

  const activeStart = useMemo(() => {
    if (statsTimeframe === 'daily') {
      return getStartOfWeek(selectedDate);
    }
    const mStart = getStartOfMonth(selectedDate);
    if (!installDate) return mStart;
    const inst = getStartOfDay(installDate);
    return mStart < inst ? inst : mStart;
  }, [selectedDate, statsTimeframe, installDate]);

  const activeEnd = useMemo(() => {
    if (statsTimeframe === 'daily') {
      const start = getStartOfWeek(selectedDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return end;
    }
    return getEndOfMonth(selectedDate);
  }, [selectedDate, statsTimeframe]);

  const canGoPrev = useMemo(() => {
    if (statsTimeframe === 'daily') {
      if (!installDate) return true;
      const prevWeekStart = new Date(getStartOfWeek(selectedDate));
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);
      const instWeekStart = getStartOfWeek(parseDateSafely(installDate));
      return prevWeekStart >= instWeekStart;
    }
    if (!installMonth) return true;
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    return getStartOfMonth(d) >= installMonth;
  }, [selectedDate, statsTimeframe, installDate, installMonth]);

  const canGoNext = useMemo(() => {
    const now = new Date();
    if (statsTimeframe === 'daily') {
      const nextWeekStart = new Date(getStartOfWeek(selectedDate));
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);
      const curWeekStart = getStartOfWeek(now);
      return nextWeekStart <= curWeekStart;
    }
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    return getStartOfMonth(d) <= getStartOfMonth(now);
  }, [selectedDate, statsTimeframe]);

  const prevPeriod = () => {
    if (!canGoPrev) return;
    const d = new Date(selectedDate);
    if (statsTimeframe === 'daily') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setSelectedDate(d);
  };

  const nextPeriod = () => {
    if (!canGoNext) return;
    const d = new Date(selectedDate);
    if (statsTimeframe === 'daily') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setSelectedDate(d);
  };

  const formatWeekRange = (start, end) => {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startDay = start.getDate();
    const startMonth = MONTHS[start.getMonth()];
    const endDay = end.getDate();
    const endMonth = MONTHS[end.getMonth()];
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    if (startYear !== endYear) {
      return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
    }
    if (start.getMonth() !== end.getMonth()) {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
    }
    return `${startDay} - ${endDay} ${startMonth} ${startYear}`;
  };

  // Spending trend data mapped to our custom bar chart
  const trendBarData = useMemo(() => {
    const isInc = activeSegment === 'incomes';
    const chartColor = isInc ? colors.success : colors.primary;

    if (statsTimeframe === 'daily') {
      const start = getStartOfWeek(selectedDate);
      const list = [];
      const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dayTotal = expenses
          .filter((e) => isSameDay(e.date, d) && (isInc ? e.type === 'income' : e.type !== 'income'))
          .reduce((s, e) => s + e.amount, 0);
        list.push({
          label: `${DAY_NAMES[i]} ${d.getDate()}`,
          value: dayTotal,
          color: chartColor,
        });
      }
      return list;
    }

    const days = getDaysInRange(activeStart, activeEnd).reverse();
    if (statsTimeframe === 'weekly') {
      const weeks = {};
      days.forEach((d) => {
        const wk = toDateKey(getStartOfWeek(d));
        if (!weeks[wk]) weeks[wk] = 0;
        const dayTotal = expenses
          .filter((e) => isSameDay(e.date, d) && (isInc ? e.type === 'income' : e.type !== 'income'))
          .reduce((s, e) => s + e.amount, 0);
        weeks[wk] += dayTotal;
      });
      const keys = Object.keys(weeks).slice(-6);
      return keys.map((k, i) => ({
        label: `W${i + 1}`,
        value: weeks[k],
        color: chartColor,
      }));
    }

    // monthly (show last 6 months up to selected month)
    const months = {};
    const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedDate);
      d.setMonth(d.getMonth() - i);
      const mk = `${d.getFullYear()}-${d.getMonth()}`;
      const ms = getStartOfMonth(d);
      const me = getEndOfMonth(d);
      months[mk] = { label: MONTHS_SHORT[d.getMonth()], total: 0 };
      expenses.forEach((e) => {
        const ed = parseDateSafely(e.date);
        const isMatch = isInc ? e.type === 'income' : e.type !== 'income';
        if (ed >= ms && ed <= me && isMatch) {
          months[mk].total += e.amount;
        }
      });
    }
    const vals = Object.values(months);
    return vals.map((v) => ({
      label: v.label,
      value: v.total,
      color: chartColor,
    }));
  }, [expenses, selectedDate, statsTimeframe, colors.primary, colors.success, activeStart, activeEnd, activeSegment]);

  // Category breakdown data
  const categories = useMemo(() => {
    return activeSegment === 'incomes'
      ? getIncomeCategoryBreakdown(activeStart, activeEnd)
      : getCategoryBreakdown(activeStart, activeEnd);
  }, [expenses, activeStart, activeEnd, activeSegment]);
  const catTotal = categories.reduce((s, c) => s + c.total, 0);

  const pieChartData = useMemo(() => {
    return categories.slice(0, 6).map((c) => ({
      label: c.name,
      value: c.total,
      color: c.color,
    }));
  }, [categories]);

  // Top expenses
  const topExpenses = useMemo(() => {
    return activeSegment === 'incomes'
      ? getTopIncomes(5, activeStart, activeEnd)
      : getTopExpenses(5, activeStart, activeEnd);
  }, [expenses, activeStart, activeEnd, activeSegment]);

  // Friends balance
  const friendBalances = useMemo(() => {
    const list = friends.map((f) => ({
      name: f.name.split(' ')[0],
      ...getFriendBalance(f._id || f.id, expenses),
    }));
    return list.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  }, [friends, expenses]);

  const maxBalance = useMemo(() => {
    if (friendBalances.length === 0) return 1;
    const balances = friendBalances.map((fb) => Math.abs(fb.net));
    return Math.max(...balances, 1);
  }, [friendBalances]);

  const hasData = expenses.length > 0;

  return (
    <ThemedView variant="bg" style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
      {/* Header */}
      <SlideUp delay={0} distance={12}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemedText variant="h1" color="primary">Analytics</ThemedText>
          </View>
          <View style={[styles.monthPicker, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Pressable onPress={prevPeriod} style={[WEB_STYLES.cursor, { opacity: canGoPrev ? 1 : 0.25 }]}>
              <Ionicons name="chevron-back" size={16} color={colors.textPrimary} />
            </Pressable>
            <ThemedText variant="bodySmall" color="primary" style={{ fontWeight: '700' }}>
              {statsTimeframe === 'daily' 
                ? formatWeekRange(getStartOfWeek(selectedDate), activeEnd) 
                : formatMonthYear(selectedDate)}
            </ThemedText>
            <Pressable onPress={nextPeriod} style={[WEB_STYLES.cursor, { opacity: canGoNext ? 1 : 0.25 }]}>
              <Ionicons name="chevron-forward" size={16} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      </SlideUp>

      <SlideUp delay={40} distance={10}>
        <FilterBar filters={TIMEFRAMES} activeFilter={statsTimeframe} onFilterChange={setStatsTimeframe} />
      </SlideUp>

      {/* Segment Controller (Expenses vs Incomes) */}
      <SlideUp delay={80} distance={8}>
        <View style={styles.segmentContainer}>
        <Pressable
          onPress={() => setActiveSegment('expenses')}
          style={[
            styles.segmentButton,
            activeSegment === 'expenses'
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            WEB_STYLES.cursor
          ]}
        >
          <ThemedText
            variant="bodyBold"
            style={[
              styles.segmentText,
              { color: activeSegment === 'expenses' ? '#FFFFFF' : colors.textSecondary }
            ]}
          >
            Expenses
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveSegment('incomes')}
          style={[
            styles.segmentButton,
            activeSegment === 'incomes'
              ? { backgroundColor: colors.success, borderColor: colors.success }
              : { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            WEB_STYLES.cursor
          ]}
        >
          <ThemedText
            variant="bodyBold"
            style={[
              styles.segmentText,
              { color: activeSegment === 'incomes' ? '#FFFFFF' : colors.textSecondary }
            ]}
          >
            Incomes
          </ThemedText>
        </Pressable>
      </View>
      </SlideUp>

      <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false}>
        {!hasData ? (
          <EmptyState emoji="📊" title="No data yet" message="Add transactions to see analytics." />
        ) : (
          <>
            {/* Spending/Income Trend */}
            <FadeIn direction="up" delay={50}>
              <ThemedCard style={styles.chartCard} elevated>
                <ThemedText variant="h3" color="primary" style={{ marginBottom: 16 }}>
                  {activeSegment === 'incomes' ? 'Income Trend' : 'Spending Trend'}
                </ThemedText>
                <AnimatedBarChart
                  data={trendBarData}
                  height={160}
                  barWidth={Platform.OS === 'web' ? 32 : 24}
                  gap={12}
                />
              </ThemedCard>
            </FadeIn>

            {/* Category Breakdown */}
            {categories.length > 0 && (
              <FadeIn direction="up" delay={120}>
                <ThemedCard style={styles.chartCard} elevated>
                  <ThemedText variant="h3" color="primary" style={{ marginBottom: 16 }}>
                    {activeSegment === 'incomes' ? 'Income Breakdown' : 'Category Breakdown'}
                  </ThemedText>
                  <View style={[styles.pieContainer, isSmallScreen && { flexDirection: 'column', gap: 24, alignItems: 'center' }]}>
                    <AnimatedPieChart
                      data={pieChartData}
                      size={160}
                      strokeWidth={18}
                      centerLabel={activeSegment === 'incomes' ? 'Total Income' : 'Total Spent'}
                      centerValue={formatCurrency(catTotal)}
                    />
                    <PieChartLegend data={pieChartData} style={isSmallScreen ? { width: '100%', marginTop: 8 } : { flex: 1, marginLeft: 16 }} />
                  </View>
                </ThemedCard>
              </FadeIn>
            )}

            {/* Top 5 Expenses/Incomes */}
            {topExpenses.length > 0 && (
              <FadeIn direction="up" delay={190}>
                <ThemedCard style={styles.chartCard} elevated>
                  <ThemedText variant="h3" color="primary" style={{ marginBottom: 16 }}>
                    {activeSegment === 'incomes' ? 'Top 5 Incomes' : 'Top 5 Expenses'}
                  </ThemedText>
                  {topExpenses.map((exp) => {
                    const maxAmt = topExpenses[0].amount;
                    const pct = maxAmt > 0 ? (exp.amount / maxAmt) * 100 : 0;
                    return (
                      <View key={exp.id} style={styles.barRow}>
                        <Text style={[styles.barEmoji, { color: colors.textPrimary }]}>{exp.emoji}</Text>
                        <View style={styles.barInfo}>
                          <ThemedText variant="bodySmall" color="secondary" numberOfLines={1}>{exp.reason}</ThemedText>
                          <View style={[styles.barTrack, { backgroundColor: colors.borderLight }]}>
                            <View
                              style={[
                                styles.barFill,
                                {
                                  width: `${pct}%`,
                                  backgroundColor: exp.categoryColor || (activeSegment === 'incomes' ? colors.success : colors.primary),
                                },
                              ]}
                            />
                          </View>
                        </View>
                        <CountUp
                          value={exp.amount}
                          prefix="₹"
                          variant="bodySmall"
                          color="primary"
                          style={{ fontWeight: '700', width: 80, textAlign: 'right' }}
                        />
                      </View>
                    );
                  })}
                </ThemedCard>
              </FadeIn>
            )}

            {/* Friends Balance */}
            {friendBalances.length > 0 && (
              <FadeIn direction="up" delay={260}>
                <ThemedCard style={styles.chartCard} elevated>
                  <ThemedText variant="h3" color="primary" style={{ marginBottom: 16 }}>Friends Balance</ThemedText>
                  {friendBalances.map((fb) => {
                    const absNet = Math.abs(fb.net);
                    const pct = maxBalance > 0 ? (absNet / maxBalance) * 100 : 0;
                    const barColor = fb.net >= 0 ? colors.success : colors.danger;

                    return (
                      <View key={fb.name} style={styles.friendBar}>
                        <ThemedText variant="bodySmall" color="secondary" style={{ width: 60 }}>{fb.name}</ThemedText>
                        <View style={[styles.friendBarTrack, { backgroundColor: colors.borderLight }]}>
                          {absNet > 0 && (
                            <View
                              style={[
                                styles.friendBarFill,
                                {
                                  width: `${pct}%`,
                                  backgroundColor: barColor,
                                },
                              ]}
                            />
                          )}
                        </View>
                        <ThemedText
                          variant="bodySmall"
                          color={fb.net >= 0 ? 'success' : 'danger'}
                          style={styles.friendAmount}
                        >
                          {fb.net >= 0 ? '+' : '-'}{formatCurrency(absNet)}
                        </ThemedText>
                      </View>
                    );
                  })}
                </ThemedCard>
              </FadeIn>
            )}
          </>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    height: Platform.OS === 'web' ? '100%' : undefined,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  barEmoji: {
    fontSize: 20,
  },
  barInfo: {
    flex: 1,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  friendBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  friendBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  friendBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  friendAmount: {
    fontSize: 13,
    fontWeight: '700',
    width: 80,
    textAlign: 'right',
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 14,
  },
});
