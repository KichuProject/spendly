import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ThemedView from '../components/common/ThemedView';
import ThemedText from '../components/common/ThemedText';
import ThemedCard from '../components/common/ThemedCard';
import FAB from '../components/FAB';
import BottomAssistant from '../components/BottomAssistant';
import AddExpenseSheet from '../components/AddExpenseSheet';
import AddIncomeSheet from '../components/AddIncomeSheet';
import EmptyState from '../components/EmptyState';
import TransactionRow from '../components/cards/TransactionRow';
import AnimatedStreakFlame from '../components/AnimatedStreakFlame';
import FadeIn, { FadeInStagger } from '../components/animations/FadeIn';
import CountUp from '../components/animations/CountUp';
import Pulse from '../components/animations/Pulse';
import SlideUp from '../components/animations/SlideUp';

import { useToast } from '../components/ToastNotification';
import useExpenseStore from '../state/useExpenseStore';
import useFriendsStore from '../state/useFriendsStore';
import useAuthStore from '../state/useAuthStore';
import { useTheme } from '../styles/ThemeContext';
import { formatCurrency } from '../utils/currencyUtils';
import {
  formatMonthYear,
  toDateKey,
  isSameDay,
  isToday,
  isPast,
  getCalendarGrid,
  formatDateLong,
  getStartOfWeek,
  getStartOfMonth,
} from '../utils/dateUtils';
import { syncNotifications } from '../utils/notificationService';
import { getScreenPaddingTop } from '../utils/platformUtils';
import { WEB_STYLES } from '../styles/theme';

export default function HomeScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing, elevation } = useTheme();
  const showToast = useToast();

  // Store selections
  const user = useAuthStore((s) => s.user);
  const expenses = useExpenseStore((s) => s.expenses);
  const dayCompletions = useExpenseStore((s) => s.dayCompletions);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const getIncompleteDays = useExpenseStore((s) => s.getIncompleteDays);
  const markDayComplete = useExpenseStore((s) => s.markDayComplete);
  const unmarkDayComplete = useExpenseStore((s) => s.unmarkDayComplete);
  const totalBalances = useFriendsStore((s) => s.getTotalBalances)(expenses);

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showIncomeSheet, setShowIncomeSheet] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const incompleteDays = getIncompleteDays();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Sync / refresh logic
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    if (route?.params?.openAddExpense) {
      setShowAddSheet(true);
      navigation.setParams({ openAddExpense: false });
    }
  }, [route?.params?.openAddExpense]);

  useEffect(() => {
    syncNotifications();
  }, [dayCompletions, selectedDate]);

  // Aggregate stats per day for the current calendar grid
  const dailySpentMap = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const dk = toDateKey(e.date);
      if (!map[dk]) map[dk] = { spent: 0, income: 0, items: [] };
      if (e.type === 'income') {
        map[dk].income += e.amount;
      } else {
        map[dk].spent += e.amount;
      }
      map[dk].items.push(e);
    });
    return map;
  }, [expenses]);

  // Get selected day transactions
  const selectedDateKey = toDateKey(selectedDate);
  const selectedDayData = dailySpentMap[selectedDateKey] || { spent: 0, income: 0, items: [] };
  const isSelectedDayComplete = dayCompletions[selectedDateKey] === true;

  // Month navigation
  const prevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newMonth);
    setSelectedDate(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newMonth);
    setSelectedDate(newMonth);
  };

  const handleSaveExpense = (expense) => {
    if (expense.id) {
      updateExpense(expense.id, expense);
    } else {
      // Auto-assign date to selected day if adding manually
      const targetDate = new Date(selectedDate);
      // Keep current time
      const now = new Date();
      targetDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      addExpense({ ...expense, date: targetDate.toISOString() });
    }
    showToast('Expense saved!', 'success', 3000, <Ionicons name="cash-outline" size={20} color={colors.success} />);
  };

  const toggleDayCompletion = () => {
    if (isSelectedDayComplete) {
      unmarkDayComplete(selectedDateKey);
      showToast('Day marked incomplete', 'info');
    } else {
      markDayComplete(selectedDateKey);
      showToast('Day marked complete!', 'success', 3000, <Ionicons name="calendar-outline" size={20} color={colors.success} />);
    }
  };

  const calendarGrid = useMemo(() => {
    return getCalendarGrid(currentMonth.getFullYear(), currentMonth.getMonth());
  }, [currentMonth]);

  // Calculate Week and Month totals dynamically based on calendar selection and navigated month
  const { weekExpense, monthExpense, weekIncome, monthIncome, monthNetSavings } = useMemo(() => {
    const startOfWeek = getStartOfWeek(selectedDate);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
    
    const startOfMonth = getStartOfMonth(currentMonth);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
    
    let weekSum = 0;
    let monthSum = 0;
    let weekIncSum = 0;
    let monthIncSum = 0;

    expenses.forEach((e) => {
      const itemDate = new Date(e.date);
      const isInc = e.type === 'income';
      if (isInc) {
        if (itemDate >= startOfWeek && itemDate <= endOfWeek) {
          weekIncSum += e.amount;
        }
        if (itemDate >= startOfMonth && itemDate <= endOfMonth) {
          monthIncSum += e.amount;
        }
      } else {
        if (itemDate >= startOfWeek && itemDate <= endOfWeek) {
          weekSum += e.amount;
        }
        if (itemDate >= startOfMonth && itemDate <= endOfMonth) {
          monthSum += e.amount;
        }
      }
    });

    return {
      weekExpense: weekSum,
      monthExpense: monthSum,
      weekIncome: weekIncSum,
      monthIncome: monthIncSum,
      monthNetSavings: monthIncSum - monthSum,
    };
  }, [expenses, selectedDate, currentMonth]);

  const greeting = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <ThemedView variant="bg" style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
      {/* Header bar */}
      <SlideUp delay={0} distance={16}>
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <ThemedText variant="body" color="blue" style={styles.avatarText}>
              {greeting[0]?.toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText variant="h3" color="primary">Hey, {greeting} 👋</ThemedText>
        </View>
        <View style={styles.topRight}>
          {user?.loginStreak !== undefined && user?.loginStreak > 0 && (
            <View style={styles.streakContainer}>
              <AnimatedStreakFlame size={38} />
              <Text style={[styles.streakText, { color: colors.danger }]}>{user.loginStreak}</Text>
            </View>
          )}
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            style={[styles.bellWrap, WEB_STYLES.cursor]}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            {incompleteDays.length > 0 && (
              <Pulse minOpacity={0.6} maxOpacity={1} duration={1200}>
              <View style={[styles.bellBadge, { backgroundColor: colors.danger }]}>
                <Text style={styles.bellBadgeText}>{incompleteDays.length}</Text>
              </View>
              </Pulse>
            )}
          </Pressable>
        </View>
      </View>
      </SlideUp>

      <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Calendar Section */}
        <FadeIn direction="up" delay={25}>
          <ThemedCard style={styles.calendarCard} elevated>
            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
              <Pressable onPress={prevMonth} style={styles.monthNavBtn}>
                <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
              </Pressable>
              <ThemedText variant="h3" color="primary" style={styles.monthLabel}>
                {formatMonthYear(currentMonth)}
              </ThemedText>
              <Pressable onPress={nextMonth} style={styles.monthNavBtn}>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Weekdays */}
            <View style={styles.weekdaysRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <Text key={idx} style={[styles.weekdayCell, { color: colors.textTertiary }]}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {calendarGrid.map((week, weekIdx) => (
                <View key={weekIdx} style={styles.weekRow}>
                  {week.map((dayNum, dayIdx) => {
                    if (dayNum === null) {
                      return <View key={`empty-${dayIdx}`} style={styles.dayCell} />;
                    }

                    const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
                    const cellDateKey = toDateKey(cellDate);
                    const isCellSelected = isSameDay(cellDate, selectedDate);
                    const isCellToday = isToday(cellDate);
                    const dayData = dailySpentMap[cellDateKey];
                    const hasExpenses = dayData && dayData.spent > 0;
                    const isDayDone = dayCompletions[cellDateKey] === true;
                    const isCellPast = isPast(cellDate) && !isCellToday;

                    let cellBgColor = 'transparent';
                    let cellTextColor = colors.textPrimary;
                    let cellBorderColor = 'transparent';

                    if (isCellSelected) {
                      cellBgColor = colors.primary + '15'; // Very light blue tint
                      cellTextColor = colors.textPrimary;  // Keep semantic theme text color!
                      cellBorderColor = colors.primary;    // Active primary border color
                    } else if (isCellToday) {
                      cellBgColor = colors.primaryLight;
                      cellTextColor = colors.primary;
                      cellBorderColor = colors.primary + '40';
                    }

                    return (
                      <Pressable
                        key={dayNum}
                        onPress={() => setSelectedDate(cellDate)}
                        style={[
                          styles.dayCell,
                          {
                            backgroundColor: cellBgColor,
                            borderRadius: radius.md,
                            borderWidth: 2,
                            borderColor: cellBorderColor,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayNumText,
                            {
                              color: cellTextColor,
                              fontWeight: isCellSelected || isCellToday ? '700' : '500',
                            },
                          ]}
                        >
                          {dayNum}
                        </Text>

                        {dayData && (dayData.spent > 0 || dayData.income > 0) && (
                          <View style={{ alignItems: 'center', marginTop: 1 }}>
                            {dayData.income > 0 && (
                              <Text style={{ fontSize: 9, color: colors.success, fontWeight: '700', lineHeight: 11 }}>
                                +₹{dayData.income}
                              </Text>
                            )}
                            {dayData.spent > 0 && (
                              <Text style={{ fontSize: 9, color: colors.expense, fontWeight: '700', lineHeight: 11 }}>
                                -₹{dayData.spent}
                              </Text>
                            )}
                          </View>
                        )}

                        <View style={styles.indicatorContainer}>
                          {/* Dot for tracked expenses */}
                          {hasExpenses && (
                            <View
                              style={[
                                styles.indicatorDot,
                                {
                                  backgroundColor: colors.primary,
                                },
                              ]}
                            />
                          )}

                          {/* Dot for tracked incomes */}
                          {dayData && dayData.income > 0 && (
                            <View
                              style={[
                                styles.indicatorDot,
                                {
                                  backgroundColor: colors.success,
                                },
                              ]}
                            />
                          )}

                          {/* Dot for incomplete past day */}
                          {isCellPast && !isDayDone && (
                            <View
                              style={[
                                styles.indicatorDot,
                                {
                                  backgroundColor: colors.warning,
                                },
                              ]}
                            />
                          )}

                          {/* Dot for complete day */}
                          {isDayDone && (
                            <View
                              style={[
                                styles.indicatorDot,
                                {
                                  backgroundColor: colors.success,
                                },
                              ]}
                            />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </ThemedCard>
        </FadeIn>

        {/* Quick Actions Row */}
        <FadeIn direction="up" delay={40}>
          <View style={styles.quickActionsContainer}>
            <Pressable
              onPress={() => setShowAddSheet(true)}
              style={({ pressed }) => [
                styles.quickActionBtn,
                {
                  backgroundColor: colors.primary + '10',
                  borderColor: colors.primary + '30',
                },
                pressed && { opacity: 0.8 },
                WEB_STYLES.cursor
              ]}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: colors.primary }]}>
                <Ionicons name="card-outline" size={20} color="#FFF" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Add Expense</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowIncomeSheet(true)}
              style={({ pressed }) => [
                styles.quickActionBtn,
                {
                  backgroundColor: colors.success + '10',
                  borderColor: colors.success + '30',
                },
                pressed && { opacity: 0.8 },
                WEB_STYLES.cursor
              ]}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: colors.success }]}>
                <Ionicons name="trending-up-outline" size={20} color="#FFF" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Add Income</Text>
            </Pressable>
          </View>
        </FadeIn>

        {/* Weekly & Monthly summary stats cards */}
        <FadeIn direction="up" delay={50}>
          <View style={[styles.statsSummaryRow, { flexDirection: 'column', gap: 10 }]}>
            {/* Row 1: Income vs Expense This Month */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <ThemedCard style={[styles.summaryStatCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevated>
                <ThemedText variant="caption" style={[styles.summaryStatLabel, { color: colors.success }]}>INCOME THIS MONTH</ThemedText>
                <CountUp value={monthIncome} prefix="₹" variant="h2" color="success" style={styles.summaryStatValue} />
              </ThemedCard>
              <ThemedCard style={[styles.summaryStatCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevated>
                <ThemedText variant="caption" style={[styles.summaryStatLabel, { color: colors.expense }]}>EXPENSE THIS MONTH</ThemedText>
                <CountUp value={monthExpense} prefix="₹" variant="h2" color="expense" style={styles.summaryStatValue} />
              </ThemedCard>
            </View>

            {/* Row 2: Expense This Week vs Net Savings This Month */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <ThemedCard style={[styles.summaryStatCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevated>
                <ThemedText variant="caption" style={[styles.summaryStatLabel, { color: colors.expense }]}>EXPENSE THIS WEEK</ThemedText>
                <CountUp value={weekExpense} prefix="₹" variant="h2" color="expense" style={styles.summaryStatValue} />
              </ThemedCard>
              <ThemedCard style={[styles.summaryStatCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevated>
                <ThemedText variant="caption" color="secondary" style={styles.summaryStatLabel}>NET SAVINGS THIS MONTH</ThemedText>
                <CountUp value={monthNetSavings} prefix="₹" variant="h2" color={monthNetSavings >= 0 ? 'success' : 'expense'} style={styles.summaryStatValue} />
              </ThemedCard>
            </View>
          </View>
        </FadeIn>

        {/* Selected Day Stats & Header */}
        <FadeIn direction="up" delay={150}>
          <View style={styles.detailsHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText variant="h3" color="primary">
                {isToday(selectedDate) ? 'Today' : formatDateLong(selectedDate)}
              </ThemedText>
              
              <View style={{ gap: 2, marginTop: 4 }}>
                {selectedDayData.income > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ThemedText variant="caption" color="secondary">Total Income: </ThemedText>
                    <CountUp value={selectedDayData.income} prefix="+₹" variant="caption" color="success" style={{ fontWeight: '600' }} />
                  </View>
                )}
                {selectedDayData.spent > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ThemedText variant="caption" color="secondary">Total Expense: </ThemedText>
                    <CountUp value={selectedDayData.spent} prefix="-₹" variant="caption" color="expense" style={{ fontWeight: '600' }} />
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <ThemedText variant="bodySmall" color="secondary" style={{ fontWeight: '700' }}>Net Balance: </ThemedText>
                  <CountUp 
                    value={Math.abs(selectedDayData.income - selectedDayData.spent)} 
                    prefix={selectedDayData.income - selectedDayData.spent >= 0 ? "+₹" : "-₹"} 
                    variant="bodySmall" 
                    color={selectedDayData.income - selectedDayData.spent >= 0 ? "success" : "expense"} 
                    style={{ fontWeight: '700' }} 
                  />
                </View>
              </View>
              <ThemedText variant="caption" color="secondary" style={{ marginTop: 4 }}>
                {selectedDayData.items.length} transaction{selectedDayData.items.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>

            <View style={[styles.detailsActions, { alignItems: 'flex-end', justifyContent: 'center' }]}>
              <CountUp 
                value={Math.abs(selectedDayData.income - selectedDayData.spent)} 
                prefix={selectedDayData.income - selectedDayData.spent >= 0 ? "+₹" : "-₹"} 
                variant="h2" 
                color={selectedDayData.income - selectedDayData.spent >= 0 ? "success" : "expense"} 
              />

              {/* Complete/Incomplete Toggle Badge */}
              <Pressable
                onPress={toggleDayCompletion}
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isSelectedDayComplete ? `${colors.success}15` : `${colors.warning}15`,
                    borderColor: isSelectedDayComplete ? `${colors.success}30` : `${colors.warning}30`,
                  },
                ]}
              >
                <Ionicons
                  name={isSelectedDayComplete ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={isSelectedDayComplete ? colors.success : colors.warning}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: isSelectedDayComplete ? colors.success : colors.warning,
                    },
                  ]}
                >
                  {isSelectedDayComplete ? 'Done' : 'Mark Done'}
                </Text>
              </Pressable>
            </View>
          </View>
        </FadeIn>

        {/* Daily Transactions List */}
        <FadeIn direction="up" delay={250}>
          <ThemedCard style={styles.listCard}>
            {selectedDayData.items.length > 0 ? (
              <FadeInStagger
                items={selectedDayData.items}
                renderItem={(item) => (
                  <TransactionRow
                    key={item.id}
                    expense={item}
                    onPress={() => navigation.navigate('DayDetail', { dateKey: selectedDateKey, date: selectedDate.toISOString() })}
                  />
                )}
              />
            ) : (
              <EmptyState
                emoji="💸"
                title="No expenses tracked"
                message="Tap below to log expenses for this date."
                buttonTitle="+ Add Expense"
                onButtonPress={() => setShowAddSheet(true)}
              />
            )}
          </ThemedCard>
        </FadeIn>

        <View style={{ height: 120 }} />
      </ScrollView>

      <FAB
        icon={<Ionicons name="mic" size={24} color="#FFF" />}
        onPress={() => setShowAiAssistant(true)}
      />

      <AddExpenseSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onSave={handleSaveExpense}
      />

      <AddIncomeSheet
        visible={showIncomeSheet}
        onClose={() => setShowIncomeSheet(false)}
        onSave={() => {
          showToast('Income saved successfully!', 'success', 3000, <Ionicons name="trending-up-outline" size={20} color={colors.success} />);
          useExpenseStore.getState().loadExpenses();
        }}
      />

      <BottomAssistant
        visible={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
      />
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
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
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    width: 60,
  },
  bellWrap: {
    position: 'relative',
    padding: 6,
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    borderRadius: 9,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 64,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 20,
  },
  quickActionBtn: {
    width: 118,
    height: 118,
    borderRadius: 59,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
  quickActionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  quickActionSub: {
    fontSize: 9.5,
    marginTop: 1,
    textAlign: 'center',
  },
  statsSummaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  summaryStatCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    justifyContent: 'center',
    borderWidth: 1,
  },
  summaryStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  summaryStatValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
  },
  calendarCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    padding: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthNavBtn: {
    padding: 6,
  },
  monthLabel: {
    fontWeight: '700',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayCell: {
    width: '14.2%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: '14.2%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingBottom: 2,
  },
  dayNumText: {
    fontSize: 14,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 3,
    flexDirection: 'row',
    gap: 2,
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  detailsActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 12.5,
    fontWeight: '400',
  },
  listCard: {
    marginHorizontal: 16,
    paddingVertical: 8,
  },
});
