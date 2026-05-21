import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LiquidBackground from '../components/LiquidBackground';
import GlassCard from '../components/GlassCard';
import FilterBar from '../components/FilterBar';
import CategoryIcon from '../components/CategoryIcon';
import FriendCard from '../components/FriendCard';
import EmptyState from '../components/EmptyState';
import AddFriendSheet from '../components/AddFriendSheet';
import FAB from '../components/FAB';
import { useToast } from '../components/ToastNotification';
import { Ionicons } from '@expo/vector-icons';
import useExpenseStore from '../state/useExpenseStore';
import useFriendsStore from '../state/useFriendsStore';
import useFilterStore from '../state/useFilterStore';
import { formatCurrency } from '../utils/currencyUtils';
import { COLORS } from '../styles/theme';
import { getScreenPaddingTop } from '../utils/platformUtils';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'theyOwe', label: 'Pay to me' },
  { key: 'iOwe', label: 'Pay to you' },
  { key: 'settled', label: 'Settled' },
  { key: 'unsettled', label: 'Unsettled' },
];

export default function FriendsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const expenses = useExpenseStore((s) => s.expenses);
  const friends = useFriendsStore((s) => s.friends);
  const addFriend = useFriendsStore((s) => s.addFriend);
  const getFriendBalance = useFriendsStore((s) => s.getFriendBalance);
  const getTotalBalances = useFriendsStore((s) => s.getTotalBalances);
  const { friendsFilter, setFriendsFilter } = useFilterStore();
  const showToast = useToast();

  const [showAddFriend, setShowAddFriend] = useState(false);

  const totals = getTotalBalances(expenses);

  const friendsWithBalance = useMemo(() => {
    return friends.map((f) => ({ friend: f, balance: getFriendBalance(f._id, expenses) }));
  }, [friends, expenses]);

  const filtered = useMemo(() => {
    const list = friendsWithBalance.filter(({ balance }) => {
      switch (friendsFilter) {
        case 'theyOwe': return balance.theyOweMe > 0;
        case 'iOwe': return balance.iOweThem > 0;
        case 'settled': return balance.unsettled === 0 && balance.totalShared > 0;
        case 'unsettled': return balance.unsettled > 0;
        default: return true;
      }
    });
    return list.sort((a, b) => a.friend.name.localeCompare(b.friend.name));
  }, [friendsWithBalance, friendsFilter]);

  const handleAddFriend = (name) => {
    addFriend(name);
    showToast('Friend added!', 'success', 3000, <Ionicons name="person-add-outline" size={20} color="#10B981" />);
  };

  const netColor = totals.net > 0 ? COLORS.positive : totals.net < 0 ? COLORS.negative : COLORS.textMuted;

  return (
    <LiquidBackground>
      <View style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.title}>Friends & Splits</Text>
            <CategoryIcon emoji="👥" size={24} color="#A78BFA" />
          </View>
        </View>

        {/* Summary banner */}
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>🟢 Pay to me</Text>
              <Text style={[styles.summaryValue, { color: COLORS.positive }]}>{formatCurrency(totals.totalTheyOwe)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>🔴 Pay to you</Text>
              <Text style={[styles.summaryValue, { color: COLORS.negative }]}>{formatCurrency(totals.totalIOwe)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>💜 Net</Text>
              <Text style={[styles.summaryValue, { color: netColor }]}>{formatCurrency(Math.abs(totals.net))}</Text>
            </View>
          </View>
        </GlassCard>

        <FilterBar filters={FILTERS} activeFilter={friendsFilter} onFilterChange={setFriendsFilter} />

        <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false}>
          {filtered.length > 0 ? (
            filtered.map(({ friend, balance }) => (
              <FriendCard
                key={friend._id}
                friend={friend}
                balance={balance}
                onPress={() => navigation.navigate('FriendDetail', { friendId: friend._id })}
              />
            ))
          ) : (
            <EmptyState emoji="👥" title="No friends yet" message="Add someone to start splitting!" buttonTitle="+ Add Friend" onButtonPress={() => setShowAddFriend(true)} />
          )}
          <View style={{ height: 120 }} />
        </ScrollView>

        <AddFriendSheet
          visible={showAddFriend}
          onClose={() => setShowAddFriend(false)}
          onSave={handleAddFriend}
        />

        <FAB onPress={() => setShowAddFriend(true)} />
      </View>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, alignSelf: 'center', width: '100%', height: Platform.OS === 'web' ? '100%' : undefined },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
  summaryCard: { marginHorizontal: 16, marginBottom: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 15, fontWeight: '800' },
  summaryDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
});
