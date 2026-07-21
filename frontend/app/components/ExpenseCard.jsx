import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedCard from './common/ThemedCard';
import ThemedText from './common/ThemedText';
import SplitPersonRow from './SplitPersonRow';
import { useTheme } from '../styles/ThemeContext';
import { formatCurrency } from '../utils/currencyUtils';
import { formatTime } from '../utils/dateUtils';
import { WEB_STYLES } from '../styles/theme';

export default function ExpenseCard({ expense, onEdit, onDelete, onToggleSettlement }) {
  const { colors, radius, spacing } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isSplit = expense.type === 'split' && expense.splits?.length > 0;
  const isSingleSplit = isSplit && expense.splits.length === 1;
  const singleSplitFriend = isSingleSplit ? expense.splits[0] : null;
  const isMultipleSplit = isSplit && expense.splits.length > 1;

  const [showActions, setShowActions] = useState(false);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={() => isMultipleSplit && setExpanded(!expanded)}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, damping: 20, stiffness: 400 }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 400 }).start()}
        onLongPress={() => setShowActions(!showActions)}
        style={[WEB_STYLES.cursor]}
      >
        <ThemedCard style={styles.card} elevated>
          <View style={styles.row}>
            <View style={[styles.emojiCircle, { borderColor: expense.categoryColor ? `${expense.categoryColor}40` : colors.border, backgroundColor: colors.surfaceSecondary }]}>
              <Text style={styles.emoji}>{expense.emoji || '💰'}</Text>
            </View>
            <View style={styles.center}>
              <ThemedText variant="body" color="primary" style={{ fontWeight: '700' }} numberOfLines={1}>
                {expense.reason}
              </ThemedText>
              {singleSplitFriend && (
                <ThemedText variant="caption" color="secondary" style={{ marginTop: 2 }}>
                  with {singleSplitFriend.friendName}
                </ThemedText>
              )}
              <ThemedText variant="caption" color="tertiary" style={{ marginTop: 2 }}>
                {formatTime(expense.createdAt || expense.date)}
              </ThemedText>
              <View style={styles.badges}>
                {isMultipleSplit ? (
                  <View style={[styles.typeBadge, { backgroundColor: `${colors.accent}15`, borderColor: `${colors.accent}30` }]}>
                    <ThemedText variant="caption" color="accent" style={{ fontWeight: '700', fontSize: 10 }}>Split</ThemedText>
                  </View>
                ) : isSingleSplit ? (
                  <View style={[
                    styles.typeBadge,
                    {
                      backgroundColor: singleSplitFriend.direction === 'theyOwe' ? `${colors.success}15` : `${colors.danger}15`,
                      borderColor: singleSplitFriend.direction === 'theyOwe' ? `${colors.success}30` : `${colors.danger}30`,
                    }
                  ]}>
                    <Text style={{ fontWeight: '700', fontSize: 10, color: singleSplitFriend.direction === 'theyOwe' ? colors.success : colors.danger }}>
                      {singleSplitFriend.direction === 'theyOwe' ? 'Owed' : 'Owe'}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.typeBadge, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
                    <ThemedText variant="caption" color="blue" style={{ fontWeight: '700', fontSize: 10 }}>Solo</ThemedText>
                  </View>
                )}
                {isMultipleSplit && <Text style={{ color: colors.textTertiary, fontSize: 10 }}>{expanded ? '▲' : '▼'}</Text>}
              </View>
            </View>
            <View style={styles.rightContainer}>
              <ThemedText variant="body" color="primary" style={{ fontWeight: '800' }}>
                {formatCurrency(expense.amount)}
              </ThemedText>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete?.(expense.id);
                }}
                style={({ pressed }) => [
                  styles.directDeleteBtn,
                  { backgroundColor: colors.dangerLight, borderColor: colors.danger },
                  pressed && { opacity: 0.7 },
                  WEB_STYLES.cursor
                ]}
              >
                <Ionicons name="trash-outline" size={15} color={colors.danger} />
              </Pressable>
            </View>
          </View>

          {isMultipleSplit && expanded && (
            <View style={[styles.splitSection, { borderTopColor: colors.border }]}>
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
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              <Pressable
                onPress={() => { setShowActions(false); onEdit?.(expense); }}
                style={[
                  styles.actionBtn,
                  { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
                  WEB_STYLES.cursor
                ]}
              >
                <Text style={[styles.actionText, { color: colors.primary }]}>✏️ Edit</Text>
              </Pressable>
              <Pressable
                onPress={() => { setShowActions(false); onDelete?.(expense.id); }}
                style={[
                  styles.actionBtn,
                  { backgroundColor: `${colors.danger}15`, borderColor: colors.danger },
                  WEB_STYLES.cursor
                ]}
              >
                <Text style={[styles.actionText, { color: colors.danger }]}>🗑️ Delete</Text>
              </Pressable>
            </View>
          )}
        </ThemedCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 10 },
  card: { padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 20 },
  center: { flex: 1 },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  rightContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  directDeleteBtn: { padding: 6, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  splitSection: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, gap: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 10, borderTopWidth: 1 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  actionText: { fontSize: 13, fontWeight: '600' },
});
