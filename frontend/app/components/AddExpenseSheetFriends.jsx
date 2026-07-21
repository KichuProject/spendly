import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './common/ThemedText';
import ThemedInput from './common/ThemedInput';
import PrimaryButton from './buttons/PrimaryButton';
import AutocompleteInput from './AutocompleteInput';
import DateRangePicker from './DateRangePicker';
import { formatDate } from '../utils/dateUtils';
import { parseCurrency } from '../utils/currencyUtils';
import { getCategoryInfo, getCategoryKeywords } from '../utils/categoryUtils';
import useExpenseStore from '../state/useExpenseStore';
import { useTheme } from '../styles/ThemeContext';
import { WEB_STYLES } from '../styles/theme';

export default function AddExpenseSheetFriends({ visible, onClose, onSave, friendId, friendName, editExpense }) {
  const { colors, radius } = useTheme();
  const pastReasons = useExpenseStore((s) => s.pastReasons);

  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [direction, setDirection] = useState('theyOwe');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const categoryInfo = getCategoryInfo(reason);
  const emoji = categoryInfo.emoji;
  const keywords = getCategoryKeywords(categoryInfo.name);

  useEffect(() => {
    if (editExpense) {
      setReason(editExpense.reason);
      setAmount(String(editExpense.amount));
      setDate(new Date(editExpense.date));
      if (editExpense.splits && editExpense.splits.length > 0) {
        setDirection(editExpense.splits[0].direction);
      }
    } else {
      resetForm();
    }
  }, [visible, editExpense]);

  const resetForm = () => {
    setReason('');
    setAmount('');
    setDate(new Date());
    setDirection('theyOwe');
  };

  const totalAmount = parseCurrency(amount);
  const canSave = reason.trim() && totalAmount > 0;

  const handleSave = () => {
    const expense = {
      id: editExpense?.id,
      reason: reason.trim(),
      amount: totalAmount,
      date: date.toISOString(),
      category: categoryInfo.name,
      emoji: categoryInfo.emoji,
      type: 'split',
      splits: friendId && friendName ? [
        {
          friendId,
          friendName,
          amount: totalAmount,
          direction,
          paid: false,
        }
      ] : null,
    };
    onSave(expense);
    resetForm();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <KeyboardAvoidingView 
        style={styles.backdrop} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.dimArea} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <ThemedText variant="h2" color="primary">
              {editExpense ? 'Edit Expense ✏' : 'Add Expense 💵'}
            </ThemedText>
            <Pressable onPress={onClose} style={[WEB_STYLES.cursor]}>
              <Ionicons name="close" size={24} color={colors.textSecondary} style={{ padding: 4 }} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Reason */}
            <ThemedText variant="bodySmall" color="secondary" style={styles.fieldLabel}>What was it for?</ThemedText>
            <View style={styles.reasonRow}>
              <ThemedText variant="h1" style={styles.reasonEmoji}>{emoji}</ThemedText>
              <AutocompleteInput
                placeholder="e.g. Lunch, Uber, Groceries..."
                value={reason}
                onChangeText={setReason}
                suggestions={pastReasons}
                onSelect={setReason}
                style={styles.reasonInput}
              />
            </View>

            {/* Amount */}
            <View style={{ height: 12 }} />
            <ThemedInput
              label="How much?"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              icon={<ThemedText variant="body" color="secondary" style={{ fontSize: 18, marginRight: 4 }}>₹</ThemedText>}
              keyboardType="decimal-pad"
            />

            {/* Date */}
            <ThemedText variant="bodySmall" color="secondary" style={styles.fieldLabel}>When?</ThemedText>
            <Pressable 
              onPress={() => setShowDatePicker(true)} 
              style={[
                styles.datePill, 
                { 
                  backgroundColor: colors.surfaceSecondary, 
                  borderColor: colors.border,
                  borderRadius: radius.md,
                }, 
                WEB_STYLES.cursor
              ]}
            >
              <ThemedText style={styles.dateIcon}>📅</ThemedText>
              <ThemedText style={styles.dateText}>{formatDate(date)}</ThemedText>
            </Pressable>

            {/* Direction toggle */}
            <ThemedText variant="bodySmall" color="secondary" style={styles.fieldLabel}>Direction</ThemedText>
            <View style={styles.directionRow}>
              <Pressable
                onPress={() => setDirection('theyOwe')}
                style={[
                  styles.directionBtn,
                  { 
                    backgroundColor: colors.surfaceSecondary, 
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  },
                  direction === 'theyOwe' && { borderColor: colors.success, backgroundColor: colors.success + '15' },
                  WEB_STYLES.cursor
                ]}
              >
                <ThemedText style={styles.directionIcon}>🟢</ThemedText>
                <ThemedText style={[styles.directionText, direction === 'theyOwe' && { color: colors.success, fontWeight: '700' }]}>Pay to me</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setDirection('iOwe')}
                style={[
                  styles.directionBtn,
                  { 
                    backgroundColor: colors.surfaceSecondary, 
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  },
                  direction === 'iOwe' && { borderColor: colors.danger, backgroundColor: colors.danger + '15' },
                  WEB_STYLES.cursor
                ]}
              >
                <ThemedText style={styles.directionIcon}>🔴</ThemedText>
                <ThemedText style={[styles.directionText, direction === 'iOwe' && { color: colors.danger, fontWeight: '700' }]}>Pay to you</ThemedText>
              </Pressable>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          <PrimaryButton
            title={editExpense ? 'Update Expense' : 'Save Expense'}
            variant="success"
            onPress={handleSave}
            disabled={!canSave}
          />
        </View>
        <DateRangePicker visible={showDatePicker} onClose={() => setShowDatePicker(false)} onSelect={(r) => setDate(r.start)} singleDate />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      },
      default: {
        justifyContent: 'flex-end',
      },
    }),
  },
  dimArea: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    padding: 20,
    paddingBottom: 32,
    maxHeight: '85%',
    borderWidth: 1,
    borderBottomWidth: 0,
    ...Platform.select({
      web: {
        maxWidth: 520,
        width: '90%',
        alignSelf: 'center',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
      },
      default: {},
    }),
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  scroll: { maxHeight: Platform.OS === 'web' ? 400 : 320 },
  fieldLabel: { fontWeight: '600', marginBottom: 8, marginTop: 16 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reasonEmoji: { fontSize: 28 },
  reasonInput: { flex: 1 },
  datePill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1.5 },
  dateIcon: { fontSize: 16 },
  dateText: { fontSize: 15, fontWeight: '600' },
  directionRow: { flexDirection: 'row', gap: 12 },
  directionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderWidth: 1.5 },
  directionIcon: { fontSize: 16 },
  directionText: { fontSize: 14, fontWeight: '600' },
});
