import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ThemedView from '../components/common/ThemedView';
import ThemedText from '../components/common/ThemedText';
import ThemedCard from '../components/common/ThemedCard';
import FilterBar from '../components/FilterBar';
import ExpenseCard from '../components/ExpenseCard';
import FAB from '../components/FAB';
import AddExpenseSheet from '../components/AddExpenseSheet';
import PrimaryButton from '../components/buttons/PrimaryButton';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import FadeIn, { FadeInStagger } from '../components/animations/FadeIn';
import CountUp from '../components/animations/CountUp';
import SlideUp from '../components/animations/SlideUp';

import { useToast } from '../components/ToastNotification';
import useExpenseStore from '../state/useExpenseStore';
import useFilterStore from '../state/useFilterStore';
import { useTheme } from '../styles/ThemeContext';
import { formatDateLong, toDateKey, isSameDay, isToday, isPast } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currencyUtils';
import { getScreenPaddingTop } from '../utils/platformUtils';
import { WEB_STYLES } from '../styles/theme';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'solo', label: 'Solo' },
  { key: 'split', label: 'Split' },
  { key: 'pending', label: 'Pending Settlement' },
];

export default function DayDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing } = useTheme();
  const { dateKey, date } = route.params;

  const expenses = useExpenseStore((s) => s.expenses);
  const dayCompletions = useExpenseStore((s) => s.dayCompletions);
  const markDayComplete = useExpenseStore((s) => s.markDayComplete);
  const unmarkDayComplete = useExpenseStore((s) => s.unmarkDayComplete);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const updateSplitSettlement = useExpenseStore((s) => s.updateSplitSettlement);
  const { dayDetailFilter, setDayDetailFilter } = useFilterStore();
  const showToast = useToast();

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const isComplete = dayCompletions[dateKey];

  const dayExpenses = useMemo(() => {
    return expenses.filter((e) => isSameDay(e.date, date));
  }, [expenses, date]);

  const filteredExpenses = useMemo(() => {
    switch (dayDetailFilter) {
      case 'solo': return dayExpenses.filter((e) => e.type === 'solo');
      case 'split': return dayExpenses.filter((e) => e.type === 'split');
      case 'pending': return dayExpenses.filter((e) => e.splits?.some((s) => !s.paid));
      default: return dayExpenses;
    }
  }, [dayExpenses, dayDetailFilter]);

  const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0);

  const today = isToday(date);
  const past = isPast(date) && !today;
  const overdue = past && !isComplete;

  let statusIcon = 'checkmark-circle-outline';
  let statusLabel = 'Complete';
  let statusColor = colors.success;

  if (today && !isComplete) {
    const currentHours = new Date().getHours();
    if (currentHours >= 22) {
      statusIcon = 'warning-outline';
      statusLabel = 'Today';
      statusColor = colors.warning;
    } else {
      statusIcon = 'calendar-outline';
      statusLabel = 'Today';
      statusColor = colors.accent;
    }
  } else if (overdue) {
    statusIcon = 'close-circle-outline';
    statusLabel = 'Overdue';
    statusColor = colors.danger;
  } else if (!isComplete) {
    statusIcon = 'warning-outline';
    statusLabel = 'Incomplete';
    statusColor = colors.warning;
  }

  const handleSave = (expense) => {
    if (expense.id && expenses.find((e) => e.id === expense.id)) updateExpense(expense.id, expense);
    else addExpense({ ...expense, date: new Date(date).toISOString() });
    setEditExpense(null);
    showToast('Expense saved!', 'success', 3000, <Ionicons name="cash-outline" size={20} color={colors.success} />);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteExpense(deleteId);
      setDeleteId(null);
      showToast('Expense deleted', 'info', 3000, <Ionicons name="trash-outline" size={20} color={colors.accent} />);
    }
  };

  const toggleComplete = () => {
    if (isComplete) {
      unmarkDayComplete(dateKey);
      showToast('Day marked incomplete', 'info');
    } else {
      markDayComplete(dateKey);
      showToast('Day marked complete!', 'success', 3000, <Ionicons name="calendar-outline" size={20} color={colors.success} />);
    }
  };

  return (
    <ThemedView variant="bg" style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
      {/* Header */}
      <SlideUp delay={0} distance={16}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              pressed && { opacity: 0.7 },
              WEB_STYLES.cursor,
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.headerCenter}>
            <ThemedText variant="body" color="primary" style={{ fontWeight: '700' }} numberOfLines={1}>
              {formatDateLong(date)}
            </ThemedText>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: `${statusColor}15`,
                borderColor: `${statusColor}30`,
              }
            ]}>
              <Ionicons name={statusIcon} size={11} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
          <CountUp value={dayTotal} prefix="₹" variant="h3" color="primary" />
        </View>
      </SlideUp>

      <FilterBar filters={FILTERS} activeFilter={dayDetailFilter} onFilterChange={setDayDetailFilter} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer} contentContainerStyle={styles.list}>
        {filteredExpenses.length > 0 ? (
          <FadeInStagger
            items={filteredExpenses}
            renderItem={(exp) => (
              <ExpenseCard
                key={exp.id}
                expense={exp}
                onEdit={(e) => { setEditExpense(e); setShowAddSheet(true); }}
                onDelete={(id) => setDeleteId(id)}
                onToggleSettlement={(expId, friendId, paid) => updateSplitSettlement(expId, friendId, paid)}
              />
            )}
          />
        ) : (
          <EmptyState emoji="📭" title="No expenses" message="No expenses match this filter." buttonTitle="+ Add Expense" onButtonPress={() => setShowAddSheet(true)} />
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {isComplete ? (
          <ThemedCard style={[styles.completeCard, { backgroundColor: `${colors.success}10`, borderColor: colors.success }]}>
            <Text style={[styles.completeText, { color: colors.success }]}>✓ Day complete</Text>
            <Pressable
              onPress={toggleComplete}
              style={({ pressed }) => [
                styles.unmarkButton,
                { backgroundColor: `${colors.danger}15`, borderColor: colors.danger },
                pressed && { opacity: 0.7 },
                WEB_STYLES.cursor
              ]}
            >
              <Ionicons name="close-circle-outline" size={15} color={colors.danger} />
              <Text style={[styles.unmarkButtonText, { color: colors.danger }]}>Unmark</Text>
            </Pressable>
          </ThemedCard>
        ) : (
          <PrimaryButton
            title="Mark Day Complete"
            icon={<Ionicons name="checkmark-done-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />}
            variant="success"
            onPress={toggleComplete}
          />
        )}
      </View>

      <FAB onPress={() => { setEditExpense(null); setShowAddSheet(true); }} />
      <AddExpenseSheet visible={showAddSheet} onClose={() => { setShowAddSheet(false); setEditExpense(null); }} onSave={handleSave} editExpense={editExpense} />
      <ConfirmModal visible={!!deleteId} title="Delete Expense" message="This action cannot be undone." confirmText="Delete" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} destructive />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, alignSelf: 'center', width: '100%', height: Platform.OS === 'web' ? '100%' : undefined },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8, gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start', marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  list: { paddingTop: 8 },
  scrollContainer: { flex: 1, minHeight: 0, marginBottom: 160 },
  bottomAction: { position: 'absolute', bottom: 90, left: 16, right: 16 },
  completeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, paddingVertical: 12, paddingHorizontal: 16 },
  completeText: { fontSize: 15, fontWeight: '700' },
  unmarkButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  unmarkButtonText: { fontSize: 12, fontWeight: '700' },
});
