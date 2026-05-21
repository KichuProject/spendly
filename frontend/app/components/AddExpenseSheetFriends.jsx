import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, GLASS, WEB_STYLES } from '../styles/theme';
import GlassButton from './GlassButton';
import GlassInput from './GlassInput';
import AutocompleteInput from './AutocompleteInput';
import DateRangePicker from './DateRangePicker';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency, parseCurrency } from '../utils/currencyUtils';
import { getCategoryInfo, getCategoryKeywords } from '../utils/categoryUtils';
import useExpenseStore from '../state/useExpenseStore';

export default function AddExpenseSheetFriends({ visible, onClose, onSave, friendId, friendName, editExpense }) {
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

  const resetForm = () => { setReason(''); setAmount(''); setDate(new Date()); setDirection('theyOwe'); };



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
        behavior="padding"
      >
        <Pressable style={styles.dimArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editExpense ? 'Edit Expense ✏️' : 'Add Expense 💵'}
            </Text>
            <Pressable onPress={onClose} style={[WEB_STYLES.cursor]}><Text style={styles.close}>✕</Text></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Reason */}
            <Text style={styles.fieldLabel}>What was it for?</Text>
            <View style={styles.reasonRow}>
              <Text style={styles.reasonEmoji}>{emoji}</Text>
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
            <Text style={styles.fieldLabel}>How much?</Text>
            <GlassInput
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              prefix="₹"
              large
              keyboardType="decimal-pad"
            />

            {/* Date */}
            <Text style={styles.fieldLabel}>When?</Text>
            <Pressable onPress={() => setShowDatePicker(true)} style={[styles.datePill, WEB_STYLES.cursor]}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </Pressable>

            {/* Direction toggle */}
            <Text style={styles.fieldLabel}>Direction</Text>
            <View style={styles.directionRow}>
              <Pressable onPress={() => setDirection('theyOwe')} style={[styles.directionBtn, direction === 'theyOwe' && styles.directionBtnActive, WEB_STYLES.cursor]}>
                <Text style={styles.directionIcon}>🟢</Text>
                <Text style={[styles.directionText, direction === 'theyOwe' && styles.directionTextActive]}>Pay to me</Text>
              </Pressable>
              <Pressable onPress={() => setDirection('iOwe')} style={[styles.directionBtn, direction === 'iOwe' && styles.directionBtnActive, WEB_STYLES.cursor]}>
                <Text style={styles.directionIcon}>🔴</Text>
                <Text style={[styles.directionText, direction === 'iOwe' && styles.directionTextActive]}>Pay to you</Text>
              </Pressable>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          <GlassButton
            title={editExpense ? '💾 Update Expense' : '💾 Save Expense'}
            variant="success"
            fullWidth
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
    justifyContent: 'flex-end',
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
      default: {},
    }),
  },
  dimArea: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: 'rgba(20,16,50,0.98)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '85%',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    borderBottomWidth: 0,
    ...Platform.select({
      web: { maxWidth: 480, width: '100%', alignSelf: 'center' },
      default: {},
    }),
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700' },
  close: { color: COLORS.textMuted, fontSize: 22, padding: 4 },
  scroll: { maxHeight: Platform.OS === 'web' ? 400 : 250 },
  fieldLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reasonEmoji: { fontSize: 28 },
  reasonInput: { flex: 1 },
  datePill: { flexDirection: 'row', alignItems: 'center', gap: 8, ...GLASS.input, paddingHorizontal: 16, paddingVertical: 14 },
  dateIcon: { fontSize: 16 },
  dateText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  directionRow: { flexDirection: 'row', gap: 12 },
  directionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...GLASS.input, paddingVertical: 16, borderRadius: 20 },
  directionBtnActive: { borderColor: COLORS.glassActiveBorder, backgroundColor: 'rgba(124,58,237,0.12)' },
  directionIcon: { fontSize: 16 },
  directionText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  directionTextActive: { color: COLORS.textPrimary },
  categoryHintCard: { marginTop: 8, padding: 10, borderRadius: 12, borderWidth: 1, gap: 4 },
  categoryHintHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryHintBulb: { fontSize: 13 },
  categoryHintLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  categoryHintBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  categoryHintBadgeText: { fontSize: 11, fontWeight: '800' },
  categoryHintKeywords: { color: COLORS.textMuted, fontSize: 11, fontWeight: '500', fontStyle: 'italic', marginLeft: 19 },
});
