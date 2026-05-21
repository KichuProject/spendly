import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, FlatList, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LiquidBackground from '../components/LiquidBackground';
import GlassCard from '../components/GlassCard';
import SummaryCard from '../components/SummaryCard';
import FilterBar from '../components/FilterBar';
import DayCard from '../components/DayCard';
import FAB from '../components/FAB';
import CategoryIcon from '../components/CategoryIcon';
import AddExpenseSheet from '../components/AddExpenseSheet';
import DateRangePicker from '../components/DateRangePicker';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/ToastNotification';
import { Ionicons } from '@expo/vector-icons';
import AnimatedStreakFlame from '../components/AnimatedStreakFlame';
import useExpenseStore from '../state/useExpenseStore';
import useFriendsStore from '../state/useFriendsStore';
import useAuthStore from '../state/useAuthStore';
import useFilterStore from '../state/useFilterStore';
import { formatCurrency } from '../utils/currencyUtils';
import { formatMonthYear, toDateKey, getDaysInRange, getDateRange, isSameDay } from '../utils/dateUtils';
import { syncNotifications } from '../utils/notificationService';
import { COLORS, SPACING, WEB_STYLES } from '../styles/theme';
import { getScreenPaddingTop } from '../utils/platformUtils';

const FILTERS = [
  { key: 'past7', label: 'Past 7 Days' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom', icon: 'calendar-outline' },
];

export default function HomeScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const expenses = useExpenseStore((s) => s.expenses);
  const dayCompletions = useExpenseStore((s) => s.dayCompletions);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const getMonthTotal = useExpenseStore((s) => s.getMonthTotal);
  const getWeekTotal = useExpenseStore((s) => s.getWeekTotal);
  const getTodayTotal = useExpenseStore((s) => s.getTodayTotal);
  const getIncompleteDays = useExpenseStore((s) => s.getIncompleteDays);
  const installDate = useExpenseStore((s) => s.installDate);
  const unmarkDayComplete = useExpenseStore((s) => s.unmarkDayComplete);
  const totalBalances = useFriendsStore((s) => s.getTotalBalances)(expenses);

  const { homeFilter, homeCustomRange, setHomeFilter, setHomeCustomRange } = useFilterStore();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const showToast = useToast();

  const monthTotal = getMonthTotal();
  const weekTotal = getWeekTotal();
  const todayTotal = getTodayTotal();
  const incompleteDays = getIncompleteDays();

  const counterAnim = useRef(new Animated.Value(0)).current;

  // Open Add Expense sheet if navigated from push notification
  useEffect(() => {
    if (route?.params?.openAddExpense) {
      setShowAddSheet(true);
      // Clear route params so it doesn't reopen next time
      navigation.setParams({ openAddExpense: false });
    }
  }, [route?.params?.openAddExpense]);

  useEffect(() => {
    Animated.timing(counterAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    // Keep today's date perfectly updated dynamically for midnight transitions
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync and schedule rolling local notifications if today is incomplete
  useEffect(() => {
    syncNotifications();
  }, [dayCompletions, currentDate]);

  const handleFilterChange = (key) => {
    if (key === 'custom') { setShowDatePicker(true); return; }
    setHomeFilter(key);
  };

  // Build grouped days list
  const dateRange = useMemo(() => {
    return getDateRange(homeFilter, homeCustomRange, installDate);
  }, [homeFilter, homeCustomRange, currentDate, installDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const t = new Date(e.date).getTime();
      return t >= dateRange.start.getTime() && t <= dateRange.end.getTime() + 86400000;
    });
  }, [expenses, dateRange]);

  const groupedDays = useMemo(() => {
    const dayMap = {};
    
    // Get difference in days between start and end
    const diffTime = Math.abs(dateRange.end - dateRange.start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Only generate empty day placeholder cards if the date range is <= 31 days
    if (diffDays <= 31) {
      const allDays = getDaysInRange(dateRange.start, dateRange.end);
      allDays.forEach((d) => {
        const dk = toDateKey(d);
        dayMap[dk] = { dateKey: dk, date: d.toISOString(), expenses: [] };
      });
    } else {
      // For larger ranges (like 'All'), always ensure Today is kept as an empty card
      const today = currentDate;
      const todayKey = toDateKey(today);
      const isTodayInRange = today.getTime() >= dateRange.start.getTime() && today.getTime() <= dateRange.end.getTime() + 86400000;
      if (isTodayInRange) {
        dayMap[todayKey] = { dateKey: todayKey, date: today.toISOString(), expenses: [] };
      }
    }

    filteredExpenses.forEach((e) => {
      const dk = toDateKey(e.date);
      if (!dayMap[dk]) {
        dayMap[dk] = { dateKey: dk, date: e.date, expenses: [] };
      }
      dayMap[dk].expenses.push(e);
    });

    return Object.values(dayMap).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredExpenses, dateRange, currentDate]);

  const handleSaveExpense = (expense) => {
    if (expense.id) updateExpense(expense.id, expense);
    else addExpense(expense);
    showToast('Expense saved!', 'success', 3000, <Ionicons name="cash-outline" size={20} color="#10B981" />);
  };

  const greeting = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <LiquidBackground>
      <View style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{greeting[0]?.toUpperCase()}</Text>
            </View>
            <Text style={styles.greeting}>Hey, {greeting} 👋</Text>
          </View>
          <View style={styles.topRight}>
            {user?.loginStreak !== undefined && user?.loginStreak > 0 && (
              <View style={styles.streakContainer}>
                <AnimatedStreakFlame size={38} />
                <Text style={styles.streakText}>{user.loginStreak}</Text>
              </View>
            )}
            <Pressable 
              onPress={() => navigation.navigate('Notifications')}
              style={[styles.bellWrap, WEB_STYLES.cursor]}
            >
              <Text style={styles.bell}>🔔</Text>
              {incompleteDays.length > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{incompleteDays.length}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero card */}
          <GlassCard variant="hero" style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total Spent — Today</Text>
            <Animated.Text style={[styles.heroAmount, { opacity: counterAnim }]}>
              {formatCurrency(todayTotal)}
            </Animated.Text>
            <View style={styles.heroSubRow}>
              <Text style={styles.heroSub}>Week {formatCurrency(weekTotal)}</Text>
              <Text style={styles.heroSubDivider}>|</Text>
              <Text style={styles.heroSub}>Month {formatCurrency(monthTotal)}</Text>
            </View>
            {incompleteDays.length > 0 && (
              <Pressable style={[styles.incompleteBadge, WEB_STYLES.cursor, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                <CategoryIcon emoji="⚠️" size={13} color={COLORS.pending} />
                <Text style={styles.incompleteText}>{incompleteDays.length} day{incompleteDays.length > 1 ? 's' : ''} incomplete</Text>
              </Pressable>
            )}
          </GlassCard>

          {/* Quick stat cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow} style={{ flexGrow: 0 }}>
            <SummaryCard emoji="💸" label="This Month" value={formatCurrency(monthTotal)} glowColor="rgba(124,58,237,0.5)" />
            <SummaryCard emoji="📅" label="This Week" value={formatCurrency(weekTotal)} glowColor="rgba(14,165,233,0.5)" />
            <SummaryCard emoji="📆" label="Today" value={formatCurrency(todayTotal)} glowColor="rgba(236,72,153,0.5)" />
            <SummaryCard emoji="👥" label="Friends Owe Me" value={formatCurrency(Math.max(totalBalances.net, 0))} glowColor="rgba(16,185,129,0.5)" />
          </ScrollView>

          {/* Filter bar */}
          <FilterBar filters={FILTERS} activeFilter={homeFilter} onFilterChange={handleFilterChange} />

          {/* Daily list */}
          {groupedDays.length > 0 ? (
            groupedDays.map((day) => (
              <DayCard
                key={day.dateKey}
                date={day.date}
                expenses={day.expenses}
                isComplete={dayCompletions[day.dateKey]}
                onPress={() => navigation.navigate('DayDetail', { dateKey: day.dateKey, date: day.date })}
              />
            ))
          ) : (
            <EmptyState
              emoji="💸"
              title="No expenses found"
              message="No expenses for this range. Start tracking!"
              buttonTitle="+ Add Today's Expense"
              onButtonPress={() => setShowAddSheet(true)}
            />
          )}
          <View style={{ height: 120 }} />
        </ScrollView>

        <FAB onPress={() => setShowAddSheet(true)} />
        <AddExpenseSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} onSave={handleSaveExpense} />
        <DateRangePicker visible={showDatePicker} onClose={() => setShowDatePicker(false)} onSelect={(range) => setHomeCustomRange(range)} installDate={installDate} />
      </View>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, alignSelf: 'center', width: '100%', height: Platform.OS === 'web' ? '100%' : undefined },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  streakContainer: { 
    alignItems: 'center', 
    justifyContent: 'center',
    width: 38,
    height: 38,
    position: 'relative',
  },
  streakText: { 
    position: 'absolute',
    bottom: -14,
    color: '#EF4444', 
    fontSize: 11, 
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(239, 68, 68, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    width: 60,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(124,58,237,0.25)', borderWidth: 1.5, borderColor: 'rgba(124,58,237,0.4)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  greeting: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  bellWrap: { position: 'relative', padding: 8 },
  bell: { fontSize: 22 },
  bellBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#EF4444', borderRadius: 10, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  bellBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  scrollContent: { paddingBottom: 20 },
  heroCard: { marginHorizontal: 16, marginBottom: 16 },
  heroLabel: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  heroAmount: { color: COLORS.textPrimary, fontSize: 38, fontWeight: '800', marginBottom: 8 },
  heroSubRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroSub: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  heroSubDivider: { color: COLORS.textMuted, fontSize: 13 },
  incompleteBadge: { marginTop: 12, backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.3)', borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start' },
  incompleteText: { color: COLORS.pending, fontSize: 12, fontWeight: '700' },
  statsRow: { paddingHorizontal: 16, paddingBottom: 8, alignItems: 'flex-start' },
});
