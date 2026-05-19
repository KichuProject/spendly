import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import LiquidBackground from '../components/LiquidBackground';
import GlassCard from '../components/GlassCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import useExpenseStore from '../state/useExpenseStore';
import useFriendsStore from '../state/useFriendsStore';
import useFilterStore from '../state/useFilterStore';
import { formatCurrency, formatCurrencyShort } from '../utils/currencyUtils';
import { formatMonthYear, getStartOfMonth, getEndOfMonth, toDateKey, getDaysInRange, isSameDay, getStartOfWeek, parseDateSafely, getStartOfDay } from '../utils/dateUtils';
import CategoryIcon from '../components/CategoryIcon';
import { COLORS, WEB_STYLES } from '../styles/theme';
import { getScreenPaddingTop } from '../utils/platformUtils';

const chartConfig = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: 'transparent',
  backgroundGradientTo: 'transparent',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
  labelColor: () => 'rgba(255,255,255,0.5)',
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#7C3AED' },
  propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.06)' },
  fillShadowGradient: '#7C3AED',
  fillShadowGradientOpacity: 0.3,
  fillShadowGradientFrom: '#7C3AED',
  fillShadowGradientTo: 'transparent',
};

const TIMEFRAMES = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  // Responsive chart width: clamp to container
  const chartWidth = Math.min(screenWidth - 48, 432);

  const expenses = useExpenseStore((s) => s.expenses);
  const getCategoryBreakdown = useExpenseStore((s) => s.getCategoryBreakdown);
  const getTopExpenses = useExpenseStore((s) => s.getTopExpenses);
  const friends = useFriendsStore((s) => s.friends);
  const getFriendBalance = useFriendsStore((s) => s.getFriendBalance);
  const { statsTimeframe, setStatsTimeframe, statsMonth, setStatsMonth } = useFilterStore();

  const installDate = useExpenseStore((s) => s.installDate);

  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // The earliest month the user can navigate to is the install month
  const installMonth = useMemo(() => {
    if (!installDate) return null;
    const d = parseDateSafely(installDate);
    return getStartOfMonth(d);
  }, [installDate]);

  const monthStartRaw = getStartOfMonth(selectedMonth);
  const monthStart = useMemo(() => {
    if (!installDate) return monthStartRaw;
    const inst = getStartOfDay(installDate);
    return monthStartRaw < inst ? inst : monthStartRaw;
  }, [monthStartRaw, installDate]);

  const monthEnd = getEndOfMonth(selectedMonth);

  // Can't go before the install month
  const canGoPrev = useMemo(() => {
    if (!installMonth) return true;
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() - 1);
    return getStartOfMonth(d) >= installMonth;
  }, [selectedMonth, installMonth]);

  // Can't go past the current month
  const canGoNext = useMemo(() => {
    const now = new Date();
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() + 1);
    return getStartOfMonth(d) <= getStartOfMonth(now);
  }, [selectedMonth]);

  const prevMonth = () => { if (!canGoPrev) return; const d = new Date(selectedMonth); d.setMonth(d.getMonth() - 1); setSelectedMonth(d); };
  const nextMonth = () => { if (!canGoNext) return; const d = new Date(selectedMonth); d.setMonth(d.getMonth() + 1); setSelectedMonth(d); };

  // Spending trend data
  const trendData = useMemo(() => {
    const days = getDaysInRange(monthStart, monthEnd).reverse();
    if (statsTimeframe === 'daily') {
      const labels = [];
      const data = [];
      days.forEach((d, i) => {
        const dayTotal = expenses.filter((e) => isSameDay(e.date, d)).reduce((s, e) => s + e.amount, 0);
        labels.push(i % 5 === 0 ? String(d.getDate()) : '');
        data.push(dayTotal);
      });
      return { labels: labels.slice(-15), data: data.slice(-15) };
    }
    if (statsTimeframe === 'weekly') {
      const weeks = {};
      days.forEach((d) => {
        const wk = toDateKey(getStartOfWeek(d));
        if (!weeks[wk]) weeks[wk] = 0;
        const dayTotal = expenses.filter((e) => isSameDay(e.date, d)).reduce((s, e) => s + e.amount, 0);
        weeks[wk] += dayTotal;
      });
      const keys = Object.keys(weeks).slice(-8);
      return { labels: keys.map((_, i) => `W${i + 1}`), data: keys.map((k) => weeks[k]) };
    }
    // monthly
    const months = {};
    const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(selectedMonth);
      d.setMonth(d.getMonth() - i);
      const mk = `${d.getFullYear()}-${d.getMonth()}`;
      const ms = getStartOfMonth(d);
      const me = getEndOfMonth(d);
      months[mk] = { label: MONTHS_SHORT[d.getMonth()], total: 0 };
      expenses.forEach((e) => {
        const ed = parseDateSafely(e.date);
        if (ed >= ms && ed <= me) {
          months[mk].total += e.amount;
        }
      });
    }
    const vals = Object.values(months);
    return { labels: vals.map((v) => v.label), data: vals.map((v) => v.total) };
  }, [expenses, selectedMonth, statsTimeframe]);

  // Category breakdown
  const categories = useMemo(() => getCategoryBreakdown(monthStart, monthEnd), [expenses, selectedMonth]);
  const catTotal = categories.reduce((s, c) => s + c.total, 0);
  const pieData = categories.slice(0, 6).map((c, i) => ({
    name: c.name,
    population: c.total,
    color: c.color,
    legendFontColor: 'rgba(255,255,255,0.7)',
    legendFontSize: 12,
  }));

  // Top expenses
  const topExpenses = useMemo(() => getTopExpenses(5, monthStart, monthEnd), [expenses, selectedMonth]);

  // Friends balance
  const friendBalances = useMemo(() => {
    const list = friends.map((f) => ({ name: f.name.split(' ')[0], ...getFriendBalance(f._id || f.id, expenses) }));
    return list.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  }, [friends, expenses]);

  const maxBalance = useMemo(() => {
    if (friendBalances.length === 0) return 1;
    const balances = friendBalances.map((fb) => Math.abs(fb.net));
    return Math.max(...balances, 1);
  }, [friendBalances]);

  const hasData = expenses.length > 0;
  const safeData = trendData.data.length > 0 ? trendData.data : [0];
  const safeLabels = trendData.labels.length > 0 ? trendData.labels : [''];

  return (
    <LiquidBackground>
      <View style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.title}>Analytics</Text>
            <CategoryIcon emoji="📊" size={24} color="#A78BFA" />
          </View>
          <View style={styles.monthPicker}>
            <Pressable onPress={prevMonth} style={[WEB_STYLES.cursor, { opacity: canGoPrev ? 1 : 0.25 }]}>
              <Text style={styles.arrow}>‹</Text>
            </Pressable>
            <Text style={styles.monthText}>{formatMonthYear(selectedMonth)}</Text>
            <Pressable onPress={nextMonth} style={[WEB_STYLES.cursor, { opacity: canGoNext ? 1 : 0.25 }]}>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          </View>
        </View>

        <FilterBar filters={TIMEFRAMES} activeFilter={statsTimeframe} onFilterChange={setStatsTimeframe} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {!hasData ? (
            <EmptyState emoji="📊" title="No data yet" message="Add expenses to see analytics." />
          ) : (
            <>
              {/* Spending Trend */}
              <GlassCard style={styles.chartCard}>
                <Text style={styles.chartTitle}>Spending Trend</Text>
                <LineChart
                  data={{
                    labels: safeLabels,
                    datasets: [{ data: safeData }],
                  }}
                  width={chartWidth}
                  height={180}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </GlassCard>

              {/* Category Breakdown */}
              {categories.length > 0 && (
                <GlassCard style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Category Breakdown</Text>
                  <PieChart
                    data={pieData}
                    width={chartWidth}
                    height={160}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="0"
                    style={styles.chart}
                    absolute
                  />
                  <View style={styles.legend}>
                    {categories.map((c) => {
                      const pct = catTotal > 0 ? ((c.total / catTotal) * 100).toFixed(1) : 0;
                      return (
                        <View key={c.name} style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                          <Text style={styles.legendEmoji}>{c.emoji}</Text>
                          <Text style={styles.legendName}>{c.name}</Text>
                          <Text style={styles.legendAmount}>{formatCurrency(c.total)}</Text>
                          <Text style={styles.legendPct}>{pct}%</Text>
                        </View>
                      );
                    })}
                  </View>
                </GlassCard>
              )}

              {/* Top 5 */}
              {topExpenses.length > 0 && (
                <GlassCard style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Top 5 Expenses</Text>
                  {topExpenses.map((exp, i) => {
                    const maxAmt = topExpenses[0].amount;
                    const pct = maxAmt > 0 ? (exp.amount / maxAmt) * 100 : 0;
                    return (
                      <View key={exp.id} style={styles.barRow}>
                        <Text style={styles.barEmoji}>{exp.emoji}</Text>
                        <View style={styles.barInfo}>
                          <Text style={styles.barLabel} numberOfLines={1}>{exp.reason}</Text>
                          <View style={styles.barTrack}>
                            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: exp.categoryColor || COLORS.primary }]} />
                          </View>
                        </View>
                        <Text style={styles.barAmount}>{formatCurrency(exp.amount)}</Text>
                      </View>
                    );
                  })}
                </GlassCard>
              )}

              {/* Friends Balance */}
              {friendBalances.length > 0 && (
                <GlassCard style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Friends Balance</Text>
                  {friendBalances.map((fb) => {
                    const absNet = Math.abs(fb.net);
                    const pct = maxBalance > 0 ? (absNet / maxBalance) * 100 : 0;
                    const barColor = fb.net >= 0 ? COLORS.positive : COLORS.negative;
                    
                    return (
                      <View key={fb.name} style={styles.friendBar}>
                        <Text style={styles.friendName}>{fb.name}</Text>
                        <View style={styles.friendBarTrack}>
                          {absNet > 0 && (
                            <View style={[styles.friendBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                          )}
                        </View>
                        <Text style={[styles.friendAmount, { color: fb.net >= 0 ? COLORS.positive : COLORS.negative }]}>
                          {fb.net >= 0 ? '+' : '-'}{formatCurrency(absNet)}
                        </Text>
                      </View>
                    );
                  })}
                </GlassCard>
              )}
            </>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, alignSelf: 'center', width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
  monthPicker: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  arrow: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '300' },
  monthText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  chartCard: { marginHorizontal: 16, marginBottom: 16 },
  chartTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700', marginBottom: 12 },
  chart: { borderRadius: 16, alignSelf: 'center' },
  legend: { marginTop: 12, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendEmoji: { fontSize: 14 },
  legendName: { flex: 1, color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  legendAmount: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
  legendPct: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', width: 40, textAlign: 'right' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  barEmoji: { fontSize: 20 },
  barInfo: { flex: 1 },
  barLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barAmount: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', width: 80, textAlign: 'right' },
  friendBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  friendName: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', width: 60 },
  friendBarTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  friendBarFill: { height: '100%', borderRadius: 4 },
  friendAmount: { fontSize: 13, fontWeight: '700', width: 80, textAlign: 'right' },
});
