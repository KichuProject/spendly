import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import ThemedCard from './common/ThemedCard';
import ThemedText from './common/ThemedText';
import { useTheme } from '../styles/ThemeContext';
import { formatCurrency } from '../utils/currencyUtils';
import { formatShortDate } from '../utils/dateUtils';
import { FRIEND_GRADIENTS } from '../state/useFriendsStore';
import { WEB_STYLES } from '../styles/theme';

export default function FriendCard({ friend, balance, onPress }) {
  const { colors, radius, spacing } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const gradient = friend.gradient || FRIEND_GRADIENTS[friend.gradientIndex || 0];

  const greenPercent = Math.min(balance.greenPercent !== undefined ? balance.greenPercent : 100, 100);
  const redPercent = Math.min(balance.redPercent !== undefined ? balance.redPercent : 100, 100);
  
  const net = (balance.theyOweMe || 0) - (balance.iOweThem || 0);
  let cardBorderColor = colors.border;
  let customCardStyle = {};

  if (net > 0) {
    cardBorderColor = `${colors.success}50`;
    customCardStyle = { backgroundColor: `${colors.success}05` };
  } else if (net < 0) {
    cardBorderColor = `${colors.danger}50`;
    customCardStyle = { backgroundColor: `${colors.danger}05` };
  }

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, damping: 20, stiffness: 400 }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 400 }).start()}
        style={[WEB_STYLES.cursor]}
      >
        <ThemedCard style={[styles.card, customCardStyle, { borderColor: cardBorderColor }]} elevated>
          <View style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: `${gradient[0]}20`, borderColor: gradient[0] }]}>
              <ThemedText variant="body" color="primary" style={[styles.initials, { fontWeight: '700' }]}>{friend.initials}</ThemedText>
            </View>
            <View style={styles.center}>
              <ThemedText variant="body" color="primary" style={{ fontWeight: '700' }}>{friend.name}</ThemedText>
              {balance.lastExpense && (
                <ThemedText variant="caption" color="secondary" style={{ marginTop: 2 }} numberOfLines={1}>
                  {balance.lastExpense.reason} · {formatShortDate(balance.lastExpense.date)}
                </ThemedText>
              )}
              <View style={[styles.chip, { backgroundColor: colors.borderLight }]}>
                <ThemedText variant="caption" color="secondary" style={styles.chipText}>
                  {balance.expenseCount || 0} expense{(balance.expenseCount || 0) !== 1 ? 's' : ''}
                </ThemedText>
              </View>
            </View>
            <View style={styles.right}>
              <ThemedText variant="bodySmall" color="success" style={styles.owes}>🟢 {formatCurrency(balance.theyOweMe || 0)}</ThemedText>
              <ThemedText variant="bodySmall" color="danger" style={styles.iOwe}>🔴 {formatCurrency(balance.iOweThem || 0)}</ThemedText>
            </View>
          </View>

          {/* Two Progress bars */}
          <View style={styles.twoBarsContainer}>
            <View style={styles.barWrapper}>
              <ThemedText variant="caption" color="tertiary" style={{ fontWeight: '700' }}>🟢 Pay to me</ThemedText>
              <View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}>
                <View style={[styles.progressFill, { width: `${greenPercent}%`, backgroundColor: colors.success }]} />
              </View>
            </View>
            <View style={styles.barWrapper}>
              <ThemedText variant="caption" color="tertiary" style={{ fontWeight: '700' }}>🔴 Pay to you</ThemedText>
              <View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}>
                <View style={[styles.progressFill, { width: `${redPercent}%`, backgroundColor: colors.danger }]} />
              </View>
            </View>
          </View>
        </ThemedCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  initials: {
    fontSize: 14,
    fontWeight: '700',
  },
  center: {
    flex: 1,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  owes: {
    fontSize: 13,
    fontWeight: '700',
  },
  iOwe: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  twoBarsContainer: {
    gap: 8,
    marginTop: 12,
  },
  barWrapper: {
    gap: 4,
  },
});
