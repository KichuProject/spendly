import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ThemedView from '../components/common/ThemedView';
import ThemedText from '../components/common/ThemedText';
import ThemedCard from '../components/common/ThemedCard';
import SummaryCard from '../components/SummaryCard';
import FilterBar from '../components/FilterBar';
import AddExpenseSheetFriends from '../components/AddExpenseSheetFriends';
import EditFriendSheet from '../components/EditFriendSheet';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import FadeIn from '../components/animations/FadeIn';
import SlideUp from '../components/animations/SlideUp';

import { useToast } from '../components/ToastNotification';
import useExpenseStore from '../state/useExpenseStore';
import useFriendsStore from '../state/useFriendsStore';
import useFilterStore from '../state/useFilterStore';
import { useTheme } from '../styles/ThemeContext';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';
import { getScreenPaddingTop } from '../utils/platformUtils';
import { WEB_STYLES } from '../styles/theme';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'theyOwe', label: 'Pay to me' },
  { key: 'iOwe', label: 'Pay to you' },
  { key: 'settled', label: 'Settled' },
  { key: 'unsettled', label: 'Unsettled' },
];

export default function FriendDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing } = useTheme();
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
    showToast('All settled!', 'success', 3000, <Ionicons name="checkmark-done-circle-outline" size={20} color={colors.success} />);
  };

  const handleSaveExpenseFriends = (expense) => {
    addExpense(expense);
    showToast('Expense added!', 'success', 3000, <Ionicons name="receipt-outline" size={20} color={colors.success} />);
  };

  const handleDeleteExpense = () => {
    if (deleteId) {
      deleteExpense(deleteId);
      setDeleteId(null);
      showToast('Expense deleted', 'info', 3000, <Ionicons name="trash-outline" size={20} color={colors.accent} />);
    }
  };

  const handleUpdateFriendName = async (newName) => {
    const success = await updateFriend(friendId, { name: newName });
    if (success) {
      showToast('Name updated successfully!', 'success', 3000, <Ionicons name="person-outline" size={20} color={colors.success} />);
    } else {
      showToast('Failed to update name', 'error');
    }
  };

  const handleDeleteFriend = async () => {
    const success = await removeFriend(friendId);
    setShowDeleteFriendConfirm(false);
    if (success) {
      showToast('Friend removed successfully', 'info', 3000, <Ionicons name="person-remove-outline" size={20} color={colors.accent} />);
      navigation.goBack();
    } else {
      showToast('Failed to remove friend', 'error');
    }
  };

  if (!friend) return null;

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
          <View style={[styles.avatar, { backgroundColor: `${friend.gradient?.[0] || colors.primary}20`, borderColor: friend.gradient?.[0] || colors.primary }]}>
            <ThemedText variant="body" color="primary" style={[styles.avatarText, { fontWeight: '700' }]}>{friend.initials}</ThemedText>
          </View>
          <ThemedText variant="h3" color="primary" style={styles.friendName} numberOfLines={1}>{friend.name}</ThemedText>
          
          <View style={styles.headerActions}>
            <Pressable 
              onPress={() => setShowEditFriend(true)} 
              style={({ pressed }) => [
                styles.actionBtn, 
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                pressed && { opacity: 0.7 },
                WEB_STYLES.cursor
              ]}
            >
              <Ionicons name="pencil-outline" size={15} color={colors.textPrimary} />
            </Pressable>
            <Pressable 
              onPress={() => setShowDeleteFriendConfirm(true)} 
              style={({ pressed }) => [
                styles.actionBtn, 
                styles.actionBtnDanger, 
                { backgroundColor: colors.dangerLight, borderColor: colors.danger },
                pressed && { opacity: 0.7 },
                WEB_STYLES.cursor
              ]}
            >
              <Ionicons name="trash-outline" size={15} color={colors.danger} />
            </Pressable>
          </View>
        </View>
      </SlideUp>

      <FadeIn direction="left" delay={50}>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsRow}
        style={styles.statsContainer}
      >
        <SummaryCard emoji="🟢" label="Pay to me" value={balance.theyOweMe} glowColor={`${colors.success}30`} />
        <SummaryCard emoji="🔴" label="Pay to you" value={balance.iOweThem} glowColor={`${colors.danger}30`} />
        <SummaryCard emoji="💜" label="Net Balance" value={Math.abs(balance.net)} glowColor={`${colors.primary}30`} />
        <SummaryCard emoji="🔗" label="Total Shared" value={balance.totalShared} glowColor={`${colors.accent}30`} />
      </ScrollView>
      </FadeIn>

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
          const isTheyOwe = split.direction === 'theyOwe';
          const cardBorderColor = isTheyOwe ? `${colors.primary}50` : `${colors.accent}50`;
          const cardBgColor = isTheyOwe ? `${colors.primary}05` : `${colors.accent}05`;

          return (
            <Pressable key={exp.id} style={styles.expCard} onPress={() => {}} >
              <ThemedCard style={[styles.expCardInner, { borderColor: cardBorderColor, backgroundColor: cardBgColor }]}>
                <View style={styles.expRow}>
                  <View style={[styles.expEmojiContainer, { backgroundColor: colors.surface, borderRadius: radius.md }]}>
                    <Text style={styles.expEmoji}>{exp.emoji}</Text>
                  </View>
                  <View style={styles.expCenter}>
                    <ThemedText variant="body" color="primary" style={{ fontWeight: '700' }}>{exp.reason}</ThemedText>
                    <ThemedText variant="caption" color="secondary" style={{ marginTop: 2 }}>{formatDate(exp.date)}</ThemedText>
                    <ThemedText variant="caption" color="tertiary" style={{ marginTop: 2 }}>Total: {formatCurrency(exp.amount)}</ThemedText>
                  </View>
                  <View style={styles.expRight}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-end' }}>
                      <ThemedText variant="body" color="primary" style={{ fontWeight: '800' }}>{formatCurrency(split.amount)}</ThemedText>
                      <Pressable
                        onPress={() => setDeleteId(exp.id)}
                        style={({ pressed }) => [
                          styles.friendDeleteBtn,
                          { backgroundColor: colors.dangerLight, borderColor: colors.danger },
                          pressed && { opacity: 0.7 },
                          WEB_STYLES.cursor
                        ]}
                      >
                        <Ionicons name="trash-outline" size={14} color={colors.danger} />
                      </Pressable>
                    </View>
                    <ThemedText variant="caption" color={isTheyOwe ? 'primaryText' : 'accent'} style={{ fontWeight: '700', marginTop: 4 }}>
                      {isTheyOwe ? '↑ I paid for them' : '↓ They paid for me'}
                    </ThemedText>
                  </View>
                </View>
                <Pressable
                  onPress={() => updateSplitSettlement(exp.id, friendId, !split.paid)}
                  style={[
                    styles.settlementBtn,
                    {
                      borderColor: split.paid ? colors.success : colors.danger,
                      backgroundColor: split.paid ? `${colors.success}10` : `${colors.danger}10`,
                    },
                    WEB_STYLES.cursor
                  ]}
                >
                  <ThemedText variant="caption" color={split.paid ? "success" : "danger"} style={styles.settlementText}>
                    {split.paid ? 'Paid ✓' : 'Pending'}
                  </ThemedText>
                </Pressable>
              </ThemedCard>
            </Pressable>
          );
        }) : (
          <EmptyState emoji="🔗" title="No shared expenses" message="Start splitting expenses with this friend!" />
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.bottomActions}>
        {balance.unsettled > 0 && (
          <Pressable
            onPress={() => setShowSettleAll(true)}
            style={({ pressed }) => [
              styles.settleAllBtn,
              { backgroundColor: `${colors.success}15`, borderColor: colors.success },
              pressed && { opacity: 0.8 },
              WEB_STYLES.cursor,
            ]}
          >
            <ThemedText variant="buttonSmall" color="success" style={styles.settleAllText}>✓ Settle All</ThemedText>
          </Pressable>
        )}
        <Pressable
          onPress={() => setShowAddSheetFriends(true)}
          style={({ pressed }) => [
            styles.addWithBtn,
            { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
            balance.unsettled <= 0 && { flex: 1 },
            pressed && { opacity: 0.8 },
            WEB_STYLES.cursor,
          ]}
        >
          <ThemedText variant="buttonSmall" color="blue" style={styles.addWithText}>+ Add Shared Expense</ThemedText>
        </Pressable>
      </View>

      <AddExpenseSheetFriends visible={showAddSheetFriends} onClose={() => setShowAddSheetFriends(false)} onSave={handleSaveExpenseFriends} friendId={friendId} friendName={friend.name} />
      <EditFriendSheet visible={showEditFriend} onClose={() => setShowEditFriend(false)} friend={friend} onSave={handleUpdateFriendName} />
      <ConfirmModal visible={showSettleAll} title="Settle All" message={`Mark all expenses with ${friend.name} as settled?`} confirmText="Settle All" onConfirm={handleSettleAll} onCancel={() => setShowSettleAll(false)} />
      <ConfirmModal visible={!!deleteId} title="Delete Shared Expense" message="This will delete the entire shared expense. This action cannot be undone." confirmText="Delete" onConfirm={handleDeleteExpense} onCancel={() => setDeleteId(null)} destructive />
      <ConfirmModal visible={showDeleteFriendConfirm} title="Delete Friend" message={`Are you sure you want to delete ${friend.name}? This will remove them from your friends list, but their shared expense history will remain.`} confirmText="Delete Friend" onConfirm={handleDeleteFriend} onCancel={() => setShowDeleteFriendConfirm(false)} destructive />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, alignSelf: 'center', width: '100%', height: Platform.OS === 'web' ? '100%' : undefined },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, gap: 10, flexShrink: 0 },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  avatarText: { fontSize: 13, fontWeight: '700' },
  friendName: { flex: 1, fontWeight: '700', marginRight: 8 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  actionBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  actionBtnDanger: { borderWidth: 1 },
  statsContainer: { flexGrow: 0, flexShrink: 0, height: 125 },
  statsRow: { paddingHorizontal: 16, alignItems: 'center' },
  expCard: { marginHorizontal: 16, marginBottom: 10 },
  expCardInner: { padding: 14 },
  expRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  expEmojiContainer: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  expEmoji: { fontSize: 20 },
  expCenter: { flex: 1 },
  expRight: { alignItems: 'flex-end' },
  friendDeleteBtn: { padding: 5, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  settlementBtn: { marginTop: 10, paddingVertical: 8, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  settlementText: { fontSize: 13, fontWeight: '700' },
  scrollContainer: { flex: 1, minHeight: 0, marginBottom: 150 },
  bottomActions: { position: 'absolute', bottom: 90, left: 16, right: 16, flexDirection: 'row', gap: 10 },
  settleAllBtn: { flex: 1, borderWidth: 1.5, borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
  settleAllText: { fontSize: 14, fontWeight: '700' },
  addWithBtn: { flex: 1.5, borderWidth: 1.5, borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
  addWithText: { fontSize: 13, fontWeight: '700' },
});
