import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import GlassCard from './GlassCard';
import { COLORS, SHADOWS, WEB_STYLES } from '../styles/theme';
import { formatCurrency } from '../utils/currencyUtils';
import { formatShortDate } from '../utils/dateUtils';
import { FRIEND_GRADIENTS } from '../state/useFriendsStore';

export default function FriendCard({ friend, balance, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const gradient = friend.gradient || FRIEND_GRADIENTS[friend.gradientIndex || 0];
  const onIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 10 }).start();
  const onOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();


  const greenPercent = Math.min(balance.greenPercent !== undefined ? balance.greenPercent : 100, 100);
  const redPercent = Math.min(balance.redPercent !== undefined ? balance.redPercent : 100, 100);
  
  const net = (balance.theyOweMe || 0) - (balance.iOweThem || 0);
  let cardGlow = undefined;
  let customCardStyle = {};
  if (net > 0) {
    cardGlow = 'rgba(52, 211, 153, 0.35)'; // Emerald Green Glow
    customCardStyle = { backgroundColor: 'rgba(52, 211, 153, 0.03)', borderColor: 'rgba(52, 211, 153, 0.25)' };
  } else if (net < 0) {
    cardGlow = 'rgba(251, 113, 133, 0.35)'; // Rose Red Glow
    customCardStyle = { backgroundColor: 'rgba(251, 113, 133, 0.03)', borderColor: 'rgba(251, 113, 133, 0.25)' };
  }

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut} style={[WEB_STYLES.cursor]}>
        <GlassCard style={[styles.card, customCardStyle]} glowColor={cardGlow}>
          <View style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: gradient[0] + '30', borderColor: gradient[0] + '50' }]}>
              <Text style={styles.initials}>{friend.initials}</Text>
            </View>
            <View style={styles.center}>
              <Text style={styles.name}>{friend.name}</Text>
              {balance.lastExpense && (
                <Text style={styles.lastExpense} numberOfLines={1}>
                  {balance.lastExpense.reason} • {formatShortDate(balance.lastExpense.date)}
                </Text>
              )}
              <View style={styles.chip}>
                <Text style={styles.chipText}>{balance.expenseCount || 0} expense{(balance.expenseCount || 0) !== 1 ? 's' : ''}</Text>
              </View>
            </View>
            <View style={styles.right}>
              <Text style={styles.owes}>🟢 {formatCurrency(balance.theyOweMe || 0)}</Text>
              <Text style={styles.iOwe}>🔴 {formatCurrency(balance.iOweThem || 0)}</Text>
            </View>
          </View>
          {/* Two Progress bars */}
          <View style={styles.twoBarsContainer}>
            <View style={styles.barWrapper}>
              <Text style={styles.barLabel}>🟢 Pay to me</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${greenPercent}%`, backgroundColor: COLORS.positive }]} />
              </View>
            </View>
            <View style={styles.barWrapper}>
              <Text style={styles.barLabel}>🔴 Pay to you</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${redPercent}%`, backgroundColor: COLORS.negative }]} />
              </View>
            </View>
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 12 },
  card: { padding: 16 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  initials: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  center: { flex: 1 },
  name: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  lastExpense: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  chip: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },
  chipText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  right: { alignItems: 'flex-end', gap: 4 },
  owes: { color: COLORS.positive, fontSize: 13, fontWeight: '700' },
  iOwe: { color: COLORS.negative, fontSize: 13, fontWeight: '700' },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  twoBarsContainer: { gap: 8, marginTop: 12 },
  barWrapper: { gap: 4 },
  barLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
});
