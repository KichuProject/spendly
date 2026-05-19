import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LiquidBackground from '../components/LiquidBackground';
import GlassCard from '../components/GlassCard';
import CategoryIcon from '../components/CategoryIcon';
import FilterBar from '../components/FilterBar';
import ExpenseCard from '../components/ExpenseCard';
import FAB from '../components/FAB';
import AddExpenseSheet from '../components/AddExpenseSheet';
import GlassButton from '../components/GlassButton';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/ToastNotification';
import useExpenseStore from '../state/useExpenseStore';
import useFilterStore from '../state/useFilterStore';
import { formatDateLong, toDateKey, isSameDay, isToday, isPast } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currencyUtils';
import { COLORS, WEB_STYLES } from '../styles/theme';
import { getScreenPaddingTop } from '../utils/platformUtils';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'solo', label: 'Solo' },
  { key: 'split', label: 'Split' },
  { key: 'pending', label: 'Pending Settlement' },
];

export default function DayDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
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

  let statusIcon = '✅';
  let statusLabel = 'Complete';
  let statusColor = COLORS.positive;

  if (today && !isComplete) {
    const currentHours = new Date().getHours();
    if (currentHours >= 22) {
      statusIcon = '⚠️';
      statusLabel = 'Today';
      statusColor = COLORS.pending;
    } else {
      statusIcon = '📅';
      statusLabel = 'Today';
      statusColor = '#A78BFA';
    }
  } else if (overdue) {
    statusIcon = '🔴';
    statusLabel = 'Overdue';
    statusColor = COLORS.negative;
  } else if (!isComplete) {
    statusIcon = '⚠️';
    statusLabel = 'Incomplete';
    statusColor = COLORS.pending;
  }

  const handleSave = (expense) => {
    if (expense.id && expenses.find((e) => e.id === expense.id)) updateExpense(expense.id, expense);
    else addExpense({ ...expense, date: new Date(date).toISOString() });
    setEditExpense(null);
    showToast('Expense saved! 💰', 'success');
  };

  const handleDelete = () => {
    if (deleteId) { deleteExpense(deleteId); setDeleteId(null); showToast('Expense deleted', 'info'); }
  };

  const toggleComplete = () => {
    if (isComplete) unmarkDayComplete(dateKey);
    else { markDayComplete(dateKey); showToast('Day marked complete! ✅', 'success'); }
  };

  return (
    <LiquidBackground>
      <View style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={[styles.backBtn, WEB_STYLES.cursor]}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{formatDateLong(date)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor + '30', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <CategoryIcon emoji={statusIcon} size={11} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={styles.headerTotal}>{formatCurrency(dayTotal)}</Text>
        </View>

        <FilterBar filters={FILTERS} activeFilter={dayDetailFilter} onFilterChange={setDayDetailFilter} />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer} contentContainerStyle={styles.list}>
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((exp) => (
              <ExpenseCard
                key={exp.id}
                expense={exp}
                onEdit={(e) => { setEditExpense(e); setShowAddSheet(true); }}
                onDelete={(id) => setDeleteId(id)}
                onToggleSettlement={(expId, friendId, paid) => updateSplitSettlement(expId, friendId, paid)}
              />
            ))
          ) : (
            <EmptyState emoji="📭" title="No expenses" message="No expenses match this filter." buttonTitle="+ Add Expense" onButtonPress={() => setShowAddSheet(true)} />
          )}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Bottom action floating transparently over full liquid background */}
        <View style={styles.bottomAction}>
          {isComplete ? (
            <GlassCard style={styles.completeCard}>
              <Text style={styles.completeText}>✓ Day complete</Text>
              <Pressable
                onPress={toggleComplete}
                style={({ pressed }) => [
                  styles.unmarkButton,
                  pressed && { opacity: 0.7 },
                  WEB_STYLES.cursor
                ]}
              >
                <Ionicons name="close-circle-outline" size={15} color="#FECACA" />
                <Text style={styles.unmarkButtonText}>Unmark Day</Text>
              </Pressable>
            </GlassCard>
          ) : (
            <GlassButton title="Mark Day Complete" icon={<Ionicons name="checkmark-done-circle-outline" size={20} color="#fff" />} variant="success" fullWidth onPress={toggleComplete} />
          )}
        </View>

        <FAB onPress={() => { setEditExpense(null); setShowAddSheet(true); }} />
        <AddExpenseSheet visible={showAddSheet} onClose={() => { setShowAddSheet(false); setEditExpense(null); }} onSave={handleSave} editExpense={editExpense} />
        <ConfirmModal visible={!!deleteId} title="Delete Expense" message="This action cannot be undone." confirmText="Delete" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} destructive />
      </View>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, alignSelf: 'center', width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8, gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '300', lineHeight: 24, marginTop: -2 },
  headerCenter: { flex: 1 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start', marginTop: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  headerTotal: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800' },
  list: { paddingTop: 8 },
  scrollContainer: { flex: 1, marginBottom: 150 },
  bottomAction: { position: 'absolute', bottom: 90, left: 16, right: 16 },
  completeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)' },
  completeText: { color: COLORS.positive, fontSize: 15, fontWeight: '700' },
  unmarkButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.18)', borderColor: 'rgba(239,68,68,0.4)', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  unmarkButtonText: { color: '#FECACA', fontSize: 12, fontWeight: '700' },
});
