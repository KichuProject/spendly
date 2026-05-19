import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LiquidBackground from '../components/LiquidBackground';
import GlassCard from '../components/GlassCard';
import CategoryIcon from '../components/CategoryIcon';
import SummaryCard from '../components/SummaryCard';
import FilterBar from '../components/FilterBar';
import AddExpenseSheetFriends from '../components/AddExpenseSheetFriends';
import EditFriendSheet from '../components/EditFriendSheet';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/ToastNotification';
import useExpenseStore from '../state/useExpenseStore';
import useFriendsStore from '../state/useFriendsStore';
import useFilterStore from '../state/useFilterStore';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';
import { COLORS, WEB_STYLES } from '../styles/theme';
import { getScreenPaddingTop } from '../utils/platformUtils';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'theyOwe', label: 'Pay to me' },
  { key: 'iOwe', label: 'Pay to you' },
  { key: 'settled', label: 'Settled' },
  { key: 'unsettled', label: 'Unsettled' },
];

export default function FriendDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { friendId } = route.params;
  const expenses = useExpenseStore((s) => s.expenses);
  const updateSplitSettlement = useExpenseStore((s) => s.updateSplitSettlement);
  const settleAllWithFriend = useExpenseStore((s) => s.settleAllWithFriend);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const friend = useFriendsStore((s) => s.getFriend)(friendId);
  const updateFriend = useFriendsStore((s) => s.updateFriend);
  const removeFriend = useFriendsStore((s) => s.removeFriend);
  const getFriendBalance = useFriendsStore((s) => s.getFriendBalance);
  const getFriendExpenses = useFriendsStore((s) => s.getFriendExpenses);
  const { friendDetailFilter, setFriendDetailFilter } = useFilterStore();
  const showToast = useToast();

  const [showAddSheetFriends, setShowAddSheetFriends] = useState(false);
  const [showEditFriend, setShowEditFriend] = useState(false);
  const [showDeleteFriendConfirm, setShowDeleteFriendConfirm] = useState(false);
  const [showSettleAll, setShowSettleAll] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const balance = getFriendBalance(friendId, expenses);
  const friendExpenses = useMemo(() => {
    const list = getFriendExpenses(friendId, expenses);
    return list.sort((a, b) => {
      const splitA = a.splits?.find((s) => s.friendId === friendId);
      const splitB = b.splits?.find((s) => s.friendId === friendId);
      const pendingA = splitA ? !splitA.paid : false;
      const pendingB = splitB ? !splitB.paid : false;

      if (pendingA !== pendingB) {
        return pendingA ? -1 : 1; // Pending first!
      }
      return new Date(b.date) - new Date(a.date); // Then latest date first
    });
  }, [friendId, expenses]);

  const filtered = useMemo(() => {
    return friendExpenses.filter((exp) => {
      const split = exp.splits?.find((s) => s.friendId === friendId);
      if (!split) return false;
      switch (friendDetailFilter) {
        case 'theyOwe': return split.direction === 'theyOwe';
        case 'iOwe': return split.direction === 'iOwe';
        case 'settled': return split.paid;
        case 'unsettled': return !split.paid;
        default: return true;
      }
    });
  }, [friendExpenses, friendDetailFilter, friendId]);

  const handleSettleAll = () => {
    settleAllWithFriend(friendId);
    setShowSettleAll(false);
    showToast('All settled! ✅', 'success');
  };

  const handleSaveExpenseFriends = (expense) => {
    addExpense(expense);
    showToast('Expense added! 💾', 'success');
  };

  const handleDeleteExpense = () => {
    if (deleteId) {
      deleteExpense(deleteId);
      setDeleteId(null);
      showToast('Expense deleted 🗑️', 'info');
    }
  };

  const handleUpdateFriendName = async (newName) => {
    const success = await updateFriend(friendId, { name: newName });
    if (success) {
      showToast('Name updated successfully! 👤', 'success');
    } else {
      showToast('Failed to update name', 'error');
    }
  };

  const handleDeleteFriend = async () => {
    const success = await removeFriend(friendId);
    setShowDeleteFriendConfirm(false);
    if (success) {
      showToast('Friend removed successfully 👥', 'info');
      navigation.goBack();
    } else {
      showToast('Failed to remove friend', 'error');
    }
  };

  if (!friend) return null;

  return (
    <LiquidBackground>
      <View style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={[styles.backBtn, WEB_STYLES.cursor]}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={[styles.avatar, { backgroundColor: (friend.gradient?.[0] || '#7C3AED') + '30', borderColor: (friend.gradient?.[0] || '#7C3AED') + '50' }]}>
            <Text style={styles.avatarText}>{friend.initials}</Text>
          </View>
          <Text style={styles.friendName} numberOfLines={1}>{friend.name}</Text>
          
          <View style={styles.headerActions}>
            <Pressable 
              onPress={() => setShowEditFriend(true)} 
              style={({ pressed }) => [
                styles.actionBtn, 
                pressed && { opacity: 0.7 },
                WEB_STYLES.cursor
              ]}
            >
              <Ionicons name="pencil-outline" size={15} color={COLORS.textPrimary} />
            </Pressable>
            <Pressable 
              onPress={() => setShowDeleteFriendConfirm(true)} 
              style={({ pressed }) => [
                styles.actionBtn, 
                styles.actionBtnDanger, 
                pressed && { opacity: 0.7 },
                WEB_STYLES.cursor
              ]}
            >
              <Ionicons name="trash-outline" size={15} color="#FB7185" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
          style={styles.statsContainer}
        >
          <SummaryCard emoji="🟢" label="Pay to me" value={formatCurrency(balance.theyOweMe)} glowColor="rgba(16,185,129,0.4)" />
          <SummaryCard emoji="🔴" label="Pay to you" value={formatCurrency(balance.iOweThem)} glowColor="rgba(251,113,133,0.4)" />
          <SummaryCard emoji="💜" label="Net Balance" value={formatCurrency(Math.abs(balance.net))} glowColor="rgba(124,58,237,0.4)" />
          <SummaryCard emoji="🔗" label="Total Shared" value={formatCurrency(balance.totalShared)} glowColor="rgba(14,165,233,0.4)" />
        </ScrollView>

        <FilterBar
          filters={FILTERS}
          activeFilter={friendDetailFilter}
          onFilterChange={setFriendDetailFilter}
          style={{ flexShrink: 0 }}
        />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
          {filtered.length > 0 ? filtered.map((exp) => {
            const split = exp.splits?.find((s) => s.friendId === friendId);
            if (!split) return null;
            return (
              <Pressable key={exp.id} style={styles.expCard} onPress={() => {}} >
                <GlassCard style={[styles.expCardInner, { 
                  borderColor: split.direction === 'theyOwe' ? 'rgba(167, 139, 250, 0.4)' : 'rgba(125, 211, 252, 0.4)',
                  backgroundColor: split.direction === 'theyOwe' ? 'rgba(167, 139, 250, 0.08)' : 'rgba(125, 211, 252, 0.08)'
                }]}>
                  <View style={styles.expRow}>
                    <CategoryIcon
                      emoji={exp.emoji}
                      size={24}
                      color={exp.categoryColor || '#FFFFFF'}
                      style={styles.expEmoji}
                    />
                    <View style={styles.expCenter}>
                      <Text style={styles.expReason}>{exp.reason}</Text>
                      <Text style={styles.expDate}>{formatDate(exp.date)}</Text>
                      <Text style={styles.expTotal}>Total: {formatCurrency(exp.amount)}</Text>
                    </View>
                    <View style={styles.expRight}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-end' }}>
                        <Text style={styles.expShare}>{formatCurrency(split.amount)}</Text>
                        <Pressable
                          onPress={() => setDeleteId(exp.id)}
                          style={({ pressed }) => [
                            styles.friendDeleteBtn,
                            pressed && { opacity: 0.7 },
                            WEB_STYLES.cursor
                          ]}
                        >
                          <Ionicons name="trash-outline" size={14} color="#FB7185" />
                        </Pressable>
                      </View>
                      <Text style={[styles.expDir, { color: split.direction === 'theyOwe' ? '#A78BFA' : '#7DD3FC' }]}>
                        {split.direction === 'theyOwe' ? '↑ I paid for them' : '↓ They paid for me'}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => updateSplitSettlement(exp.id, friendId, !split.paid)}
                    style={[styles.settlementBtn, split.paid ? styles.settlementPaid : styles.settlementPending, WEB_STYLES.cursor]}
                  >
                    <Text style={[styles.settlementText, { color: split.paid ? COLORS.positive : COLORS.negative }]}>
                      {split.paid ? 'Paid ✅' : 'Pending 🔴'}
                    </Text>
                  </Pressable>
                </GlassCard>
              </Pressable>
            );
          }) : (
            <EmptyState emoji="🔗" title="No shared expenses" message="Start splitting expenses with this friend!" />
          )}
          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.bottomActions}>
          {balance.unsettled > 0 && (
            <Pressable onPress={() => setShowSettleAll(true)} style={[styles.settleAllBtn, WEB_STYLES.cursor]}>
              <Text style={styles.settleAllText}>✅ Settle All</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setShowAddSheetFriends(true)}
            style={[
              styles.addWithBtn,
              balance.unsettled <= 0 && { flex: 1 },
              WEB_STYLES.cursor
            ]}
          >
            <Text style={styles.addWithText}>+ Add Expense with {friend.name.split(' ')[0]}</Text>
          </Pressable>
        </View>

        <AddExpenseSheetFriends visible={showAddSheetFriends} onClose={() => setShowAddSheetFriends(false)} onSave={handleSaveExpenseFriends} friendId={friendId} friendName={friend.name} />
        <EditFriendSheet visible={showEditFriend} onClose={() => setShowEditFriend(false)} friend={friend} onSave={handleUpdateFriendName} />
        <ConfirmModal visible={showSettleAll} title="Settle All" message={`Mark all expenses with ${friend.name} as settled?`} confirmText="Settle All" onConfirm={handleSettleAll} onCancel={() => setShowSettleAll(false)} />
        <ConfirmModal visible={!!deleteId} title="Delete Shared Expense" message="This will delete the entire shared expense. This action cannot be undone." confirmText="Delete" onConfirm={handleDeleteExpense} onCancel={() => setDeleteId(null)} destructive />
        <ConfirmModal visible={showDeleteFriendConfirm} title="Delete Friend" message={`Are you sure you want to delete ${friend.name}? This will remove them from your friends list, but their shared expense history will remain.`} confirmText="Delete Friend" onConfirm={handleDeleteFriend} onCancel={() => setShowDeleteFriendConfirm(false)} destructive />
      </View>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, alignSelf: 'center', width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, gap: 10, flexShrink: 0 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '300', lineHeight: 24, marginTop: -2 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  avatarText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
  friendName: { flex: 1, color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginRight: 8 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  actionBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  actionBtnDanger: { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: 'rgba(251,113,133,0.2)' },
  statsContainer: { flexGrow: 0, flexShrink: 0, height: 125 },
  statsRow: { paddingHorizontal: 16, alignItems: 'center' },
  expCard: { marginHorizontal: 16, marginBottom: 10 },
  expCardInner: { padding: 14 },
  expRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  expEmoji: { fontSize: 24 },
  expCenter: { flex: 1 },
  expReason: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  expDate: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  expTotal: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  expRight: { alignItems: 'flex-end' },
  expShare: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800' },
  friendDeleteBtn: { padding: 5, borderRadius: 8, backgroundColor: 'rgba(244,63,94,0.12)', borderColor: 'rgba(244,63,94,0.25)', borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  expDir: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  settlementBtn: { marginTop: 10, paddingVertical: 8, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  settlementPaid: { backgroundColor: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.3)' },
  settlementPending: { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: 'rgba(251,113,133,0.3)' },
  settlementText: { fontSize: 13, fontWeight: '700' },
  scrollContainer: { flex: 1, marginBottom: 150 },
  bottomActions: { position: 'absolute', bottom: 90, left: 16, right: 16, flexDirection: 'row', gap: 10 },
  settleAllBtn: { flex: 1, backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)', borderWidth: 1.5, borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
  settleAllText: { color: COLORS.positive, fontSize: 14, fontWeight: '700' },
  addWithBtn: { flex: 1.5, backgroundColor: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.3)', borderWidth: 1.5, borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
  addWithText: { color: '#A78BFA', fontSize: 13, fontWeight: '700' },
});
