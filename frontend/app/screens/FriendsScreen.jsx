import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ThemedView from '../components/common/ThemedView';
import ThemedText from '../components/common/ThemedText';
import ThemedCard from '../components/common/ThemedCard';
import FilterBar from '../components/FilterBar';
import FriendCard from '../components/FriendCard';
import EmptyState from '../components/EmptyState';
import AddFriendSheet from '../components/AddFriendSheet';
import FAB from '../components/FAB';
import FadeIn, { FadeInStagger } from '../components/animations/FadeIn';
import CountUp from '../components/animations/CountUp';
import SlideUp from '../components/animations/SlideUp';

import { useToast } from '../components/ToastNotification';
import useExpenseStore from '../state/useExpenseStore';
import useFriendsStore from '../state/useFriendsStore';
import useFilterStore from '../state/useFilterStore';
import { useTheme } from '../styles/ThemeContext';
import { formatCurrency } from '../utils/currencyUtils';
import { getScreenPaddingTop } from '../utils/platformUtils';
import { WEB_STYLES } from '../styles/theme';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'theyOwe', label: 'Pay to me' },
  { key: 'iOwe', label: 'Pay to you' },
  { key: 'settled', label: 'Settled' },
  { key: 'unsettled', label: 'Unsettled' },
];

export default function FriendsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing } = useTheme();

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
    return friends.map((f) => ({ friend: f, balance: getFriendBalance(f._id || f.id, expenses) }));
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
    showToast('Friend added!', 'success', 3000, <Ionicons name="person-add-outline" size={20} color={colors.success} />);
  };

  const netColor = totals.net > 0 ? 'success' : totals.net < 0 ? 'danger' : 'secondary';

  return (
    <ThemedView variant="bg" style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
      <SlideUp delay={0} distance={16}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ThemedText variant="h1" color="primary">Friends & Splits</ThemedText>
        </View>
      </View>
      </SlideUp>

      {/* Summary banner */}
      <FadeIn direction="up" delay={50}>
        <ThemedCard style={styles.summaryCard} elevated>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <ThemedText variant="caption" color="secondary" style={styles.summaryLabel}>🟢 Pay to me</ThemedText>
              <CountUp value={totals.totalTheyOwe} prefix="₹" variant="bodySmall" color="success" style={styles.summaryValue} />
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <ThemedText variant="caption" color="secondary" style={styles.summaryLabel}>🔴 Pay to you</ThemedText>
              <CountUp value={totals.totalIOwe} prefix="₹" variant="bodySmall" color="danger" style={styles.summaryValue} />
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <ThemedText variant="caption" color="secondary" style={styles.summaryLabel}>💜 Net</ThemedText>
              <CountUp value={Math.abs(totals.net)} prefix="₹" variant="bodySmall" color={netColor} style={styles.summaryValue} />
            </View>
          </View>
        </ThemedCard>
      </FadeIn>

      <FilterBar filters={FILTERS} activeFilter={friendsFilter} onFilterChange={setFriendsFilter} />

      <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false}>
        {filtered.length > 0 ? (
          <FadeInStagger
            items={filtered}
            renderItem={({ friend, balance }) => (
              <FriendCard
                key={friend._id || friend.id}
                friend={friend}
                balance={balance}
                onPress={() => navigation.navigate('FriendDetail', { friendId: friend._id || friend.id })}
              />
            )}
          />
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, alignSelf: 'center', width: '100%', height: Platform.OS === 'web' ? '100%' : undefined },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  summaryCard: { marginHorizontal: 16, marginBottom: 8, paddingVertical: 14 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontWeight: '700', marginBottom: 4 },
  summaryValue: { fontWeight: '800' },
  summaryDivider: { width: 1, height: 30 },
});
