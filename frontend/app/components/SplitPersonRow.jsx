import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, WEB_STYLES } from '../styles/theme';
import { formatCurrency } from '../utils/currencyUtils';
import { getInitials } from '../state/useFriendsStore';

export default function SplitPersonRow({ split, onToggle }) {
  const initials = split.friendName ? getInitials(split.friendName) : '??';
  const isPaid = split.paid;
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, isPaid ? styles.avatarPaid : styles.avatarOwes]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{split.friendName || 'Unknown'}</Text>
        <Text style={styles.share}>{formatCurrency(split.amount)}</Text>
      </View>
      <Pressable onPress={onToggle} style={[styles.toggle, isPaid ? styles.togglePaid : styles.toggleOwes, WEB_STYLES.cursor]}>
        <Text style={[styles.toggleText, isPaid ? styles.paidText : styles.owesText]}>
          {isPaid ? '💚 Paid' : '🔴 Owes'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  avatarPaid: { backgroundColor: 'rgba(52,211,153,0.15)', borderColor: 'rgba(52,211,153,0.3)' },
  avatarOwes: { backgroundColor: 'rgba(251,113,133,0.15)', borderColor: 'rgba(251,113,133,0.3)' },
  initials: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '700' },
  info: { flex: 1 },
  name: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  share: { color: COLORS.textMuted, fontSize: 12 },
  toggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  togglePaid: { backgroundColor: 'rgba(52,211,153,0.12)', borderColor: 'rgba(52,211,153,0.3)' },
  toggleOwes: { backgroundColor: 'rgba(251,113,133,0.12)', borderColor: 'rgba(251,113,133,0.3)' },
  toggleText: { fontSize: 11, fontWeight: '700' },
  paidText: { color: '#34D399' },
  owesText: { color: '#FB7185' },
});
