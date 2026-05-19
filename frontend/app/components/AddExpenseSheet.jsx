import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, GLASS, SPACING, SHADOWS, WEB_STYLES } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import GlassButton from './GlassButton';
import GlassInput from './GlassInput';
import AutocompleteInput from './AutocompleteInput';
import DateRangePicker from './DateRangePicker';
import { formatDate, toDateKey } from '../utils/dateUtils';
import { formatCurrency, parseCurrency } from '../utils/currencyUtils';
import { getCategoryInfo, getCategoryKeywords } from '../utils/categoryUtils';
import { getInitials } from '../state/useFriendsStore';
import useExpenseStore from '../state/useExpenseStore';
import useFriendsStore from '../state/useFriendsStore';
import CategoryIcon from './CategoryIcon';

export default function AddExpenseSheet({ visible, onClose, onSave, preselectedFriend, editExpense }) {
  const pastReasons = useExpenseStore((s) => s.pastReasons);
  const friends = useFriendsStore((s) => s.friends);
  const addFriend = useFriendsStore((s) => s.addFriend);

  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState('solo');
  const [splits, setSplits] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [direction, setDirection] = useState('theyOwe');
  const categoryInfo = getCategoryInfo(reason);
  const emoji = categoryInfo.emoji;
  const keywords = getCategoryKeywords(categoryInfo.name);

  useEffect(() => {
    if (editExpense) {
      setReason(editExpense.reason);
      setAmount(String(editExpense.amount));
      setDate(new Date(editExpense.date));
      setType(editExpense.type);
      if (editExpense.type === 'friend') {
        const split = editExpense.splits?.[0];
        if (split) {
          const fr = friends.find((f) => f._id === split.friendId);
          setSelectedFriend(fr || { _id: split.friendId, name: split.friendName });
          setDirection(split.direction);
        }
      } else {
        setSplits(editExpense.splits || []);
      }
    } else {
      resetForm();
    }
    if (preselectedFriend) {
      setType('friend');
      const f = friends.find((fr) => fr._id === preselectedFriend);
      if (f) {
        setSelectedFriend(f);
      }
    }
  }, [visible, editExpense, preselectedFriend]);

  const resetForm = () => { 
    setReason(''); 
    setAmount(''); 
    setDate(new Date()); 
    setType('solo'); 
    setSplits([]); 
    setFriendSearch(''); 
    setSelectedFriend(null); 
    setDirection('theyOwe'); 
  };

  const addSplitPerson = (name) => {
    console.log('🔍 addSplitPerson called with:', name);
    if (!name || !name.trim()) {
      console.log('❌ Name is empty, returning early');
      return;
    }
    
    const trimmedName = name.trim();
    console.log('🔍 Looking for friend:', trimmedName);
    
    // Find existing friend - first check exact match, then case-insensitive
    let friend = friends.find((f) => f.name.toLowerCase() === trimmedName.toLowerCase());
    console.log('🔍 Found existing friend:', friend ? friend.name : 'none');
    
    // If not found, create new friend and wait for it
    if (!friend) {
      console.log('🔍 Creating new friend:', trimmedName);
      const newFriend = addFriend(trimmedName);
      friend = newFriend;
      console.log('🔍 New friend created:', friend ? friend.name : 'failed');
    }
    
    // Prevent duplicates
    if (friend && !splits.some((s) => s.friendId === friend._id)) {
      console.log('✅ Adding to splits:', friend.name);
      setSplits(prev => {
        const newSplits = [...prev, {
          friendId: friend._id,
          friendName: friend.name,
          amount: 0,
          direction: 'theyOwe',
          paid: false,
        }];
        console.log('✅ Splits updated:', newSplits.length);
        return newSplits;
      });
    } else if (friend) {
      console.log('⚠️ Friend already in splits');
    } else {
      console.log('❌ Friend is null, cannot add');
    }
    
    // Always clear the search
    console.log('🔍 Clearing friendSearch');
    setFriendSearch('');
  };

  const removeSplitPerson = (friendId) => { setSplits(splits.filter((s) => s.friendId !== friendId)); };

  const updateSplitAmount = (friendId, val) => {
    setSplits(splits.map((s) => s.friendId === friendId ? { ...s, amount: parseCurrency(val) } : s));
  };

  const splitEqually = () => {
    const total = parseCurrency(amount);
    if (total <= 0 || splits.length === 0) return;
    const share = Math.round((total / (splits.length + 1)) * 100) / 100;
    setSplits(splits.map((s) => ({ ...s, amount: share })));
  };

  const totalAmount = parseCurrency(amount);
  const splitsTotal = splits.reduce((s, sp) => s + sp.amount, 0);
  const myShare = totalAmount - splitsTotal;
  const mismatch = type === 'split' && splits.length > 0 && Math.abs(myShare) < 0 ;
  const canSave = reason.trim() && totalAmount > 0 && (
    type === 'solo' || 
    (type === 'split' && splits.length > 0) ||
    (type === 'friend' && selectedFriend)
  );

  const handleSave = () => {
    let savedSplits = null;
    if (type === 'split') {
      savedSplits = splits;
    } else if (type === 'friend' && selectedFriend) {
      savedSplits = [
        {
          friendId: selectedFriend._id,
          friendName: selectedFriend.name,
          amount: totalAmount,
          direction: direction,
          paid: false,
        }
      ];
    }

    const expense = {
      id: editExpense?.id,
      reason: reason.trim(),
      amount: totalAmount,
      date: date.toISOString(),
      category: categoryInfo.name,
      emoji: categoryInfo.emoji,
      type,
      splits: savedSplits,
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.headerTitle}>
                {editExpense ? 'Edit Expense' : 'Add Expense'}
              </Text>
              <Ionicons name={editExpense ? 'create-outline' : 'sparkles'} size={20} color={editExpense ? '#38BDF8' : '#FBBF24'} />
            </View>
            <Pressable onPress={onClose} style={[WEB_STYLES.cursor]}><Text style={styles.close}>✕</Text></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Reason */}
            <Text style={styles.fieldLabel}>What was it for?</Text>
            <View style={styles.reasonRow}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <CategoryIcon emoji={emoji} size={22} color={categoryInfo.color} />
              </View>
              <AutocompleteInput
                placeholder="e.g. Lunch, Uber, Groceries..."
                value={reason}
                onChangeText={setReason}
                suggestions={pastReasons}
                onSelect={setReason}
                style={styles.reasonInput}
              />
            </View>

            {reason.trim().length > 0 && categoryInfo && categoryInfo.name !== 'Other' && (
              <View style={[styles.categoryHintCard, { borderColor: categoryInfo.color + '25', backgroundColor: categoryInfo.color + '0a' }]}>
                <View style={styles.categoryHintHeader}>
                  <Text style={styles.categoryHintBulb}>✨</Text>
                  <Text style={styles.categoryHintLabel}>Auto-detected:</Text>
                  <View style={[styles.categoryHintBadge, { backgroundColor: categoryInfo.color + '15', borderColor: categoryInfo.color + '30' }]}>
                    <Text style={[styles.categoryHintBadgeText, { color: categoryInfo.color }]}>
                      {categoryInfo.emoji} {categoryInfo.name}
                    </Text>
                  </View>
                </View>
                {keywords.length > 0 && (
                  <Text style={styles.categoryHintKeywords} numberOfLines={1}>
                    💡 Also in this category: {keywords.join(', ')}
                  </Text>
                )}
              </View>
            )}

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
              <Ionicons name="calendar-outline" size={16} color="#A78BFA" />
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </Pressable>

            {/* Type toggle */}
            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.typeRow}>
              <Pressable
                onPress={() => setType('solo')}
                style={[
                  styles.typeBtn,
                  type === 'solo' && { borderColor: 'rgba(56, 189, 248, 0.5)', backgroundColor: 'rgba(56, 189, 248, 0.12)' },
                  WEB_STYLES.cursor
                ]}
              >
                <Ionicons name="person-outline" size={18} color={type === 'solo' ? '#38BDF8' : COLORS.textMuted} />
                <Text style={[styles.typeText, type === 'solo' && { color: '#38BDF8' }]}>Solo</Text>
              </Pressable>
              <Pressable
                onPress={() => setType('split')}
                style={[
                  styles.typeBtn,
                  type === 'split' && { borderColor: 'rgba(192, 132, 252, 0.5)', backgroundColor: 'rgba(192, 132, 252, 0.12)' },
                  WEB_STYLES.cursor
                ]}
              >
                <Ionicons name="people-outline" size={18} color={type === 'split' ? '#C084FC' : COLORS.textMuted} />
                <Text style={[styles.typeText, type === 'split' && { color: '#C084FC' }]}>Split</Text>
              </Pressable>
              <Pressable
                onPress={() => setType('friend')}
                style={[
                  styles.typeBtn,
                  type === 'friend' && { borderColor: 'rgba(52, 211, 153, 0.5)', backgroundColor: 'rgba(52, 211, 153, 0.12)' },
                  WEB_STYLES.cursor
                ]}
              >
                <Ionicons name="person-add-outline" size={18} color={type === 'friend' ? '#34D399' : COLORS.textMuted} />
                <Text style={[styles.typeText, type === 'friend' && { color: '#34D399' }]}>Friend</Text>
              </Pressable>
            </View>

            {/* Friend Section */}
            {type === 'friend' && (
              <View style={styles.splitSection}>
                <AutocompleteInput
                  placeholder="Search or add friend..."
                  value={friendSearch}
                  onChangeText={setFriendSearch}
                  suggestions={friends.map((f) => f.name)}
                  onSelect={(name) => {
                    if (!name || !name.trim()) return;
                    const trimmedName = name.trim();
                    let friend = friends.find((f) => f.name.toLowerCase() === trimmedName.toLowerCase());
                    if (!friend) {
                      friend = addFriend(trimmedName);
                    }
                    if (friend) {
                      setSelectedFriend(friend);
                    }
                    setFriendSearch('');
                  }}
                  icon="🔍"
                />
                {friendSearch.trim().length > 0 && !friends.find((f) => f.name.toLowerCase() === friendSearch.toLowerCase()) && (
                  <Pressable 
                    onPress={() => {
                      const newFr = addFriend(friendSearch.trim());
                      if (newFr) setSelectedFriend(newFr);
                      setFriendSearch('');
                    }} 
                    style={[styles.addNewFriend, WEB_STYLES.cursor]}
                  >
                    <Text style={styles.addNewText}>+ Add "{friendSearch.trim()}" as new friend</Text>
                  </Pressable>
                )}

                {selectedFriend && (
                  <View style={[styles.splitRow, { borderBottomWidth: 0, marginTop: 4 }]}>
                    <View style={styles.splitAvatar}>
                      <Text style={styles.splitInitials}>{getInitials(selectedFriend.name)}</Text>
                    </View>
                    <Text style={styles.splitName} numberOfLines={1}>{selectedFriend.name}</Text>
                    <Pressable onPress={() => setSelectedFriend(null)} style={[WEB_STYLES.cursor]}>
                      <Text style={styles.removeBtn}>✕</Text>
                    </Pressable>
                  </View>
                )}

                {selectedFriend && (
                  <>
                    <Text style={styles.fieldLabel}>Direction</Text>
                    <View style={styles.directionRow}>
                      <Pressable 
                        onPress={() => setDirection('theyOwe')} 
                        style={[
                          styles.directionBtn, 
                          direction === 'theyOwe' && { borderColor: 'rgba(52, 211, 153, 0.5)', backgroundColor: 'rgba(52, 211, 153, 0.12)' }, 
                          WEB_STYLES.cursor
                        ]}
                      >
                        <Text style={styles.directionIcon}>🟢</Text>
                        <Text style={[styles.directionText, direction === 'theyOwe' && { color: COLORS.positive }]}>Pay to me</Text>
                      </Pressable>
                      <Pressable 
                        onPress={() => setDirection('iOwe')} 
                        style={[
                          styles.directionBtn, 
                          direction === 'iOwe' && { borderColor: 'rgba(251, 113, 133, 0.5)', backgroundColor: 'rgba(251, 113, 133, 0.12)' }, 
                          WEB_STYLES.cursor
                        ]}
                      >
                        <Text style={styles.directionIcon}>🔴</Text>
                        <Text style={[styles.directionText, direction === 'iOwe' && { color: COLORS.negative }]}>Pay to you</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Split section */}
            {type === 'split' && (
              <View style={styles.splitSection}>
                <AutocompleteInput
                  placeholder="Search or add friend..."
                  value={friendSearch}
                  onChangeText={setFriendSearch}
                  suggestions={friends.filter(f => !splits.some(s => s.friendId === f._id)).map((f) => f.name)}
                  onSelect={addSplitPerson}
                  icon="🔍"
                />
                {friendSearch.trim().length > 0 && !friends.find((f) => f.name.toLowerCase() === friendSearch.toLowerCase()) && (
                  <Pressable onPress={() => addSplitPerson(friendSearch.trim())} style={[styles.addNewFriend, WEB_STYLES.cursor]}>
                    <Text style={styles.addNewText}>+ Add "{friendSearch.trim()}" as new friend</Text>
                  </Pressable>
                )}
                {splits.map((split) => (
                  <View key={split.friendId} style={styles.splitRow}>
                    <View style={styles.splitAvatar}>
                      <Text style={styles.splitInitials}>{getInitials(split.friendName)}</Text>
                    </View>
                    <Text style={styles.splitName} numberOfLines={1}>{split.friendName}</Text>
                    <View style={styles.splitAmountWrap}>
                      <Text style={styles.splitPrefix}>₹</Text>
                      <TextInput
                        style={styles.splitAmountInput}
                        value={split.amount > 0 ? String(split.amount) : ''}
                        onChangeText={(v) => updateSplitAmount(split.friendId, v)}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                    <Pressable onPress={() => removeSplitPerson(split.friendId)} style={[WEB_STYLES.cursor]}>
                      <Text style={styles.removeBtn}>✕</Text>
                    </Pressable>
                  </View>
                ))}
                {splits.length > 0 && (
                  <>
                    <GlassButton title="🔀 Split Equally" variant="ghost" onPress={splitEqually} small />
                    <View style={styles.totalCheck}>
                      <Text style={styles.totalLabel}>Total: {formatCurrency(totalAmount)}</Text>
                      <Text style={styles.totalLabel}>Friends: {formatCurrency(splitsTotal)}</Text>
                      <Text style={[styles.totalLabel, { color: myShare >= 0 ? COLORS.positive : COLORS.warning }]}>
                        Your share: {formatCurrency(Math.max(myShare, 0))} {myShare >= 0 ? '✅' : '⚠️'}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}
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
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...GLASS.input, paddingVertical: 16, borderRadius: 20 },
  typeBtnActive: { borderColor: COLORS.glassActiveBorder, backgroundColor: 'rgba(124,58,237,0.12)' },
  typeIcon: { fontSize: 20 },
  typeText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '700' },
  typeTextActive: { color: COLORS.textPrimary },
  splitSection: { marginTop: 12, gap: 10 },
  addNewFriend: { padding: 12, borderRadius: 12, backgroundColor: 'rgba(124,58,237,0.1)' },
  addNewText: { color: '#A78BFA', fontSize: 13, fontWeight: '600' },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  splitAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(124,58,237,0.2)', alignItems: 'center', justifyContent: 'center' },
  splitInitials: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '700' },
  splitName: { flex: 1, color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  splitAmountWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10, paddingHorizontal: 8, width: 80 },
  splitPrefix: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  splitAmountInput: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 6,
    flex: 1,
    textAlign: 'right',
    ...Platform.select({
      web: { outlineStyle: 'none' },
      default: {},
    }),
  },
  paidToggle: { padding: 6, borderRadius: 10, borderWidth: 1 },
  paidYes: { backgroundColor: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.3)' },
  paidNo: { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: 'rgba(251,113,133,0.3)' },
  paidText: { fontSize: 14 },
  removeBtn: { color: COLORS.textMuted, fontSize: 16, paddingHorizontal: 4 },
  totalCheck: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: 12, gap: 4 },
  totalLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  categoryHintCard: { marginTop: 8, padding: 10, borderRadius: 12, borderWidth: 1, gap: 4 },
  categoryHintHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryHintBulb: { fontSize: 13 },
  categoryHintLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  categoryHintBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  categoryHintBadgeText: { fontSize: 11, fontWeight: '800' },
  categoryHintKeywords: { color: COLORS.textMuted, fontSize: 11, fontWeight: '500', fontStyle: 'italic', marginLeft: 19 },
  directionRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  directionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...GLASS.input, paddingVertical: 14, borderRadius: 16 },
  directionIcon: { fontSize: 16 },
  directionText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
});
