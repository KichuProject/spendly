import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, TextInput, KeyboardAvoidingView, Platform, Animated, Keyboard } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ThemedText from './common/ThemedText';
import ThemedInput from './common/ThemedInput';
import PrimaryButton from './buttons/PrimaryButton';
import SecondaryButton from './buttons/SecondaryButton';
import DateRangePicker from './DateRangePicker';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currencyUtils';
import useExpenseStore from '../state/useExpenseStore';
import CategoryIcon from './CategoryIcon';
import { useTheme } from '../styles/ThemeContext';
import { WEB_STYLES } from '../styles/theme';

export const INCOME_CATEGORIES = [
  { name: 'Salary', emoji: '💼', color: '#10B981' },
  { name: 'Freelance', emoji: '👨‍💻', color: '#3B82F6' },
  { name: 'Business', emoji: '🏢', color: '#8B5CF6' },
  { name: 'Investment', emoji: '📈', color: '#F59E0B' },
  { name: 'Dividend', emoji: '📊', color: '#EF4444' },
  { name: 'Interest', emoji: '🏦', color: '#06B6D4' },
  { name: 'Rental Income', emoji: '🏠', color: '#EC4899' },
  { name: 'Bonus', emoji: '🎁', color: '#10B981' },
  { name: 'Gift', emoji: '✉️', color: '#A855F7' },
  { name: 'Cashback', emoji: '💰', color: '#F59E0B' },
  { name: 'Refund', emoji: '🔄', color: '#6B7280' },
  { name: 'Scholarship', emoji: '🎓', color: '#3B82F6' },
  { name: 'Pension', emoji: '👴', color: '#8B5CF6' },
  { name: 'Commission', emoji: '🤝', color: '#EC4899' },
  { name: 'Side Hustle', emoji: '⚡', color: '#F59E0B' },
  { name: 'Other', emoji: '💵', color: '#6B7280' }
];

export const INCOME_SOURCES = [
  'Employer',
  'Client',
  'Business',
  'Bank Interest',
  'Government',
  'Investment',
  'Family',
  'Cash',
  'Other'
];

export const ACCOUNTS = [
  'Cash',
  'Bank Account',
  'Savings Account',
  'Wallet',
  'UPI',
  'PayPal',
  'Business Account'
];

const FREQUENCIES = [
  { value: 'one-time', label: 'One Time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function AddIncomeSheet({ visible, onClose, onSave, editIncome }) {
  const { colors, radius, spacing } = useTheme();
  const addExpense = useExpenseStore((s) => s.addExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);

  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState(''); // Title
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  const [source, setSource] = useState(INCOME_SOURCES[0]);
  const [customSource, setCustomSource] = useState('');
  const [account, setAccount] = useState(ACCOUNTS[0]);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [attachment, setAttachment] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState(FREQUENCIES[4].value); // Monthly
  const [reminder, setReminder] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCustomSourceInput, setShowCustomSourceInput] = useState(false);

  const emojiScale = useRef(new Animated.Value(1)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    emojiScale.setValue(0.5);
    Animated.spring(emojiScale, {
      toValue: 1,
      damping: 12,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  }, [category.emoji]);

  useEffect(() => {
    if (editIncome) {
      setAmount(String(editIncome.amount));
      setReason(editIncome.reason);
      const cat = INCOME_CATEGORIES.find(c => c.name === editIncome.category) || INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1];
      setCategory(cat);
      if (INCOME_SOURCES.includes(editIncome.source)) {
        setSource(editIncome.source);
        setShowCustomSourceInput(false);
      } else {
        setSource('Other');
        setCustomSource(editIncome.source || '');
        setShowCustomSourceInput(true);
      }
      setAccount(editIncome.account || ACCOUNTS[0]);
      setDate(new Date(editIncome.date));
      setNotes(editIncome.notes || '');
      setTags(editIncome.tags ? editIncome.tags.join(', ') : '');
      setAttachment(editIncome.attachment || '');
      setRecurring(editIncome.recurring || false);
      setFrequency(editIncome.frequency || FREQUENCIES[4].value);
    } else {
      resetForm();
    }
  }, [visible, editIncome]);

  const resetForm = () => {
    setAmount('');
    setReason('');
    setCategory(INCOME_CATEGORIES[0]);
    setSource(INCOME_SOURCES[0]);
    setCustomSource('');
    setAccount(ACCOUNTS[0]);
    setDate(new Date());
    setNotes('');
    setTags('');
    setAttachment('');
    setRecurring(false);
    setFrequency(FREQUENCIES[4].value);
    setReminder(false);
    setShowCustomSourceInput(false);
  };

  const handleSourceSelect = (val) => {
    setSource(val);
    if (val === 'Other') {
      setShowCustomSourceInput(true);
    } else {
      setShowCustomSourceInput(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !reason) {
      return;
    }

    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return;
    }

    const finalSource = source === 'Other' ? customSource.trim() || 'Other' : source;
    const finalTags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const incomeData = {
      amount: cleanAmount,
      reason: reason.trim(),
      category: category.name,
      emoji: category.emoji,
      date: date.toISOString(),
      type: 'income',
      splits: [],
      notes: notes.trim() || null,
      paymentMethod: 'cash', // Keep consistent, or map account
      source: finalSource,
      account,
      recurring,
      frequency: recurring ? frequency : null,
      attachment: attachment.trim() || null,
    };

    if (editIncome) {
      const success = await updateExpense(editIncome._id, incomeData);
      if (success && onSave) onSave();
    } else {
      const saved = await addExpense(incomeData);
      if (saved && onSave) onSave();
    }
    onClose();
  };

  const selectCategory = (cat) => {
    setCategory(cat);
  };

  const addQuickAmount = (val) => {
    const current = Number(amount) || 0;
    setAmount(String(current + val));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.overlay, Platform.OS === 'android' && { paddingBottom: keyboardHeight }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }]}>
          <View style={[styles.handle, { backgroundColor: colors.textMuted }]} />
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                {editIncome ? 'Edit Income' : 'Add Income'}
              </Text>
              <Ionicons name={editIncome ? 'create-outline' : 'trending-up-outline'} size={20} color={colors.success} />
            </View>
            <Pressable onPress={onClose} style={[WEB_STYLES.cursor]}><Text style={[styles.close, { color: colors.textMuted }]}>✕</Text></Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Amount */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={[styles.currencySymbol, { color: colors.success }]}>₹</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.textPrimary }]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Quick Amount Suggestion Chips */}
            <View style={styles.suggestionChips}>
              {[1000, 5000, 10000, 50000].map((val) => (
                <Pressable
                  key={val}
                  onPress={() => addQuickAmount(val)}
                  style={({ pressed }) => [
                    styles.quickChip,
                    { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                    pressed && { opacity: 0.8 },
                    WEB_STYLES.cursor
                  ]}
                >
                  <Text style={[styles.quickChipText, { color: colors.success }]}>+₹{val >= 1000 ? `${val / 1000}k` : val}</Text>
                </Pressable>
              ))}
            </View>

            {/* Title / Description */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>What is this income from?</Text>
            <ThemedInput
              placeholder="e.g. July Salary, Consulting Work, Dividend payout..."
              value={reason}
              onChangeText={setReason}
              style={{ marginBottom: 16 }}
            />

            {/* Category Select Grid */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
            <View style={styles.categoryBadgeRow}>
              <Animated.View style={{ transform: [{ scale: emojiScale }] }}>
                <View style={[styles.activeCategoryCircle, { backgroundColor: category.color + '15', borderColor: category.color }]}>
                  <CategoryIcon emoji={category.emoji} size={24} color={category.color} />
                </View>
              </Animated.View>
              <ThemedText variant="bodyBold" color="primary">{category.name}</ThemedText>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={{ gap: 8, paddingBottom: 16, paddingRight: 48 }}>
              {INCOME_CATEGORIES.map((cat) => {
                const isActive = category.name === cat.name;
                return (
                  <Pressable
                    key={cat.name}
                    onPress={() => selectCategory(cat)}
                    style={({ pressed }) => [
                      styles.categoryCard,
                      {
                        backgroundColor: isActive ? cat.color + '15' : colors.surfaceSecondary,
                        borderColor: isActive ? cat.color : colors.border
                      },
                      pressed && { opacity: 0.8 },
                      WEB_STYLES.cursor
                    ]}
                  >
                    <CategoryIcon emoji={cat.emoji} size={18} color={cat.color} />
                    <Text style={[styles.categoryCardText, { color: isActive ? cat.color : colors.textSecondary, fontWeight: isActive ? '700' : '500' }]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Account Selector */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Account / Destination</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={{ gap: 8, paddingBottom: 16, paddingRight: 48 }}>
              {ACCOUNTS.map((acc) => {
                const isActive = account === acc;
                return (
                  <Pressable
                    key={acc}
                    onPress={() => setAccount(acc)}
                    style={({ pressed }) => [
                      styles.optionChip,
                      {
                        backgroundColor: isActive ? colors.success + '15' : colors.surfaceSecondary,
                        borderColor: isActive ? colors.success : colors.border
                      },
                      pressed && { opacity: 0.8 },
                      WEB_STYLES.cursor
                    ]}
                  >
                    <Text style={{ color: isActive ? colors.success : colors.textSecondary, fontWeight: isActive ? '700' : '500' }}>
                      {acc}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Source Selector */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Income Source</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={{ gap: 8, paddingBottom: 12, paddingRight: 48 }}>

              {INCOME_SOURCES.map((src) => {
                const isActive = source === src;
                return (
                  <Pressable
                    key={src}
                    onPress={() => handleSourceSelect(src)}
                    style={({ pressed }) => [
                      styles.optionChip,
                      {
                        backgroundColor: isActive ? colors.success + '15' : colors.surfaceSecondary,
                        borderColor: isActive ? colors.success : colors.border
                      },
                      pressed && { opacity: 0.8 },
                      WEB_STYLES.cursor
                    ]}
                  >
                    <Text style={{ color: isActive ? colors.success : colors.textSecondary, fontWeight: isActive ? '700' : '500' }}>
                      {src}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {showCustomSourceInput && (
              <ThemedInput
                placeholder="Enter custom source name..."
                value={customSource}
                onChangeText={setCustomSource}
                style={{ marginTop: 8, marginBottom: 16 }}
              />
            )}

            {/* Date Select */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 12 }]}>Date</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={({ pressed }) => [
                styles.dateSelector,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                pressed && { opacity: 0.8 },
                WEB_STYLES.cursor
              ]}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.success} />
              <ThemedText variant="body">{formatDate(date)}</ThemedText>
            </Pressable>

            {/* Notes & Tags & Attachment */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>Notes (Optional)</Text>
            <ThemedInput
              placeholder="Add note details..."
              value={notes}
              onChangeText={setNotes}
              style={{ marginBottom: 16 }}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Tags (Comma separated, e.g. bonus, bonus-2026)</Text>
            <ThemedInput
              placeholder="e.g. bonus, remote, consulting"
              value={tags}
              onChangeText={setTags}
              style={{ marginBottom: 16 }}
            />

            {/* Recurring Option */}
            <View style={styles.switchRow}>
              <View>
                <ThemedText variant="bodyBold">Recurring Income</ThemedText>
                <ThemedText variant="caption" color="secondary">Automatically repeat this entry in the future</ThemedText>
              </View>
              <Pressable
                onPress={() => setRecurring(!recurring)}
                style={({ pressed }) => [
                  styles.switchButton,
                  { backgroundColor: recurring ? colors.success : colors.border },
                  pressed && { opacity: 0.8 },
                  WEB_STYLES.cursor
                ]}
              >
                <View style={[styles.switchKnob, { left: recurring ? 22 : 2 }]} />
              </Pressable>
            </View>

            {recurring && (
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Repeat Interval</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={{ gap: 8, paddingBottom: 12, paddingRight: 48 }}>
                  {FREQUENCIES.map((f) => {
                    const isActive = frequency === f.value;
                    return (
                      <Pressable
                        key={f.value}
                        onPress={() => setFrequency(f.value)}
                        style={({ pressed }) => [
                          styles.optionChip,
                          {
                            backgroundColor: isActive ? colors.success + '15' : colors.surfaceSecondary,
                            borderColor: isActive ? colors.success : colors.border
                          },
                          pressed && { opacity: 0.8 },
                          WEB_STYLES.cursor
                        ]}
                      >
                        <Text style={{ color: isActive ? colors.success : colors.textSecondary, fontWeight: isActive ? '700' : '500' }}>
                          {f.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}


            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.footer}>
            <SecondaryButton title="Cancel" onPress={onClose} style={{ flex: 1 }} />
            <PrimaryButton
              title={editIncome ? "Update" : "Save Income"}
              onPress={handleSubmit}
              disabled={!amount || !reason}
              style={{ flex: 2, backgroundColor: colors.success }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <DateRangePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={(res) => {
          if (res.start) setDate(res.start);
          setShowDatePicker(false);
        }}
        singleDate
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    ...Platform.select({
      web: { justifyContent: 'center', alignItems: 'center' },
      default: { justifyContent: 'flex-end' },
    }),
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: '85%',
    paddingTop: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        maxWidth: 520,
        width: '90%',
        alignSelf: 'center',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        borderWidth: 1,
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
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  close: {
    fontSize: 20,
    fontWeight: '700',
    padding: 4,
  },
  scroll: {
    paddingHorizontal: 24,
    ...Platform.select({
      web: { maxHeight: 420 },
      default: { maxHeight: 420 },
    }),
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '800',
    marginRight: 6,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '800',
    flex: 1,
    padding: 0,
  },
  suggestionChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  activeCategoryCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  horizontalScroll: {
    marginHorizontal: -24,
    paddingLeft: 24,
    paddingRight: 24,
    marginBottom: 16,
  },

  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  categoryCardText: {
    fontSize: 13,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchButton: {
    width: 46,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});
