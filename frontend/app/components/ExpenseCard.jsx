import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import SplitPersonRow from './SplitPersonRow';
import CategoryIcon from './CategoryIcon';
import { COLORS, WEB_STYLES } from '../styles/theme';
import { formatCurrency } from '../utils/currencyUtils';
import { formatTime } from '../utils/dateUtils';

export default function ExpenseCard({ expense, onEdit, onDelete, onToggleSettlement }) {
  const [expanded, setExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isSplit = expense.type === 'split' && expense.splits?.length > 0;
  const isSingleSplit = isSplit && expense.splits.length === 1;
  const singleSplitFriend = isSingleSplit ? expense.splits[0] : null;
  const isMultipleSplit = isSplit && expense.splits.length > 1;

  const onIn = () => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, tension: 300, friction: 10 }).start();
  const onOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();

  const [showActions, setShowActions] = useState(false);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={() => isMultipleSplit && setExpanded(!expanded)}
        onPressIn={onIn}
        onPressOut={onOut}
        onLongPress={() => setShowActions(!showActions)}
        style={[WEB_STYLES.cursor]}
      >
        <GlassCard style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.emojiCircle, { borderColor: expense.categoryColor + '50' }]}>
              <CategoryIcon
                emoji={expense.emoji}
                size={20}
                color={expense.categoryColor || '#FFFFFF'}
                style={styles.emoji}
              />
            </View>
            <View style={styles.center}>
              <Text style={styles.reason} numberOfLines={1}>{expense.reason}</Text>
              {singleSplitFriend && <Text style={styles.friendName}>with {singleSplitFriend.friendName}</Text>}
              <Text style={styles.time}>{formatTime(expense.createdAt || expense.date)}</Text>
              <View style={styles.badges}>
                {isMultipleSplit ? (
                  <View style={[styles.typeBadge, styles.splitBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                    <CategoryIcon emoji="👥" size={11} color="#A78BFA" />
                    <Text style={[styles.typeText, styles.splitText]}>Split</Text>
                  </View>
                ) : isSingleSplit ? (
                  <View style={[styles.typeBadge, styles.friendBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                    <CategoryIcon
                      emoji={singleSplitFriend.direction === 'theyOwe' ? '🟢' : '🔴'}
                      size={11}
                      color={singleSplitFriend.direction === 'theyOwe' ? '#10B981' : '#FB7185'}
                    />
                    <Text style={[styles.typeText, styles.friendText]}>
                      {singleSplitFriend.direction === 'theyOwe' ? 'Owed' : 'Owe'}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.typeBadge, styles.soloBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                    <CategoryIcon emoji="🧍" size={11} color="#7DD3FC" />
                    <Text style={[styles.typeText, styles.soloText]}>Solo</Text>
                  </View>
                )}
                {isMultipleSplit && expanded && <Text style={styles.expandHint}>▲</Text>}
                {isMultipleSplit && !expanded && <Text style={styles.expandHint}>▼</Text>}
              </View>
            </View>
            <View style={styles.rightContainer}>
              <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete?.(expense.id);
                }}
                style={({ pressed }) => [
                  styles.directDeleteBtn,
                  pressed && { opacity: 0.7 },
                  WEB_STYLES.cursor
                ]}
              >
                <Ionicons name="trash-outline" size={15} color="#FB7185" />
              </Pressable>
            </View>
          </View>

          {isMultipleSplit && expanded && (
            <View style={styles.splitSection}>
              {expense.splits.map((split, i) => (
                <SplitPersonRow
                  key={split.friendId || i}
                  split={split}
                  onToggle={() => onToggleSettlement?.(expense.id, split.friendId, !split.paid)}
                />
              ))}
            </View>
          )}

          {showActions && (
            <View style={styles.actions}>
              <Pressable onPress={() => { setShowActions(false); onEdit?.(expense); }} style={[styles.actionBtn, styles.editBtn, WEB_STYLES.cursor]}>
                <Text style={styles.actionText}>✏️ Edit</Text>
              </Pressable>
              <Pressable onPress={() => { setShowActions(false); onDelete?.(expense.id); }} style={[styles.actionBtn, styles.deleteBtn, WEB_STYLES.cursor]}>
                <Text style={styles.actionText}>🗑️ Delete</Text>
              </Pressable>
            </View>
          )}
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 10 },
  card: { padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 20 },
  center: { flex: 1 },
  reason: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  friendName: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  time: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  splitBadge: { backgroundColor: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.3)' },
  soloBadge: { backgroundColor: 'rgba(14,165,233,0.15)', borderColor: 'rgba(14,165,233,0.3)' },
  friendBadge: { backgroundColor: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.3)' },
  typeText: { fontSize: 10, fontWeight: '700' },
  splitText: { color: '#A78BFA' },
  soloText: { color: '#7DD3FC' },
  friendText: { color: '#60A5FA', fontSize: 12, fontWeight: '700' },
  expandHint: { color: COLORS.textMuted, fontSize: 10 },
  amount: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  rightContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  directDeleteBtn: { padding: 6, borderRadius: 8, backgroundColor: 'rgba(244,63,94,0.12)', borderColor: 'rgba(244,63,94,0.25)', borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  splitSection: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', gap: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  editBtn: { backgroundColor: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.3)' },
  deleteBtn: { backgroundColor: 'rgba(244,63,94,0.15)', borderColor: 'rgba(244,63,94,0.3)' },
  actionText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
});
