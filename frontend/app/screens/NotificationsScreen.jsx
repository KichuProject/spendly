import React, { useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import ThemedView from '../components/common/ThemedView';
import ThemedText from '../components/common/ThemedText';
import ThemedCard from '../components/common/ThemedCard';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import EmptyState from '../components/EmptyState';
import FadeIn, { FadeInStagger } from '../components/animations/FadeIn';

import useExpenseStore from '../state/useExpenseStore';
import { formatDateLong, parseDateSafely } from '../utils/dateUtils';
import { useTheme } from '../styles/ThemeContext';
import { getScreenPaddingTop } from '../utils/platformUtils';
import { WEB_STYLES } from '../styles/theme';

function NotificationRowItem({ n, colors, handleDelete, handleReviewDay }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const d = parseDateSafely(n.dateKey);
  const formattedDate = formatDateLong(d);
  const cardBorderColor = n.isSolved ? `${colors.success}30` : `${colors.accent}30`;
  const cardBgColor = n.isSolved ? `${colors.success}05` : `${colors.accent}05`;

  const triggerDelete = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      handleDelete(n.dateKey);
    });
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <ThemedCard
        style={[styles.card, { borderColor: cardBorderColor, backgroundColor: cardBgColor }]}
      >
        <View style={styles.row}>
          <View style={[
            styles.iconContainer,
            {
              backgroundColor: n.isSolved ? `${colors.success}20` : `${colors.accent}20`,
              borderColor: n.isSolved ? colors.success : colors.accent,
            }
          ]}>
            <MaterialCommunityIcons
              name={n.isSolved ? "checkbox-marked-circle-outline" : "party-popper"}
              size={22}
              color={n.isSolved ? colors.success : colors.accent}
            />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.titleRow}>
              <ThemedText variant="bodySmall" color="primary" style={{ fontWeight: '700', flex: 1, marginRight: 8 }}>
                {n.isSolved ? "Day Logs Completed! 🎉" : "Incomplete Day Reminder"}
              </ThemedText>
              <View style={[styles.timeBadge, { backgroundColor: colors.borderLight }]}>
                <Ionicons name="time-outline" size={11} color={colors.textMuted} />
                <ThemedText variant="caption" color="secondary" style={styles.timeBadgeText}>10:00 PM</ThemedText>
              </View>
            </View>

            <ThemedText variant="caption" color="secondary" style={{ lineHeight: 18 }}>
              {n.isSolved
                ? `You completed your logs for `
                : `Your completion reminder arrived on `}
              <ThemedText variant="caption" color="primary" style={{ fontWeight: '700' }}>{formattedDate}</ThemedText>.
              {n.isSolved
                ? " Great job maintaining your tracking habit!"
                : " Please check your budget logs for this day to complete it."}
            </ThemedText>
          </View>

          {/* Inline Delete Button */}
          <Pressable
            onPress={triggerDelete}
            style={({ pressed }) => [
              styles.deleteBtn,
              pressed && { opacity: 0.7 },
              WEB_STYLES.cursor
            ]}
          >
            <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          {n.isSolved ? (
            <SecondaryButton
              title="Review Completed Day"
              icon={<Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />}
              onPress={() => handleReviewDay(n.dateKey)}
              size="sm"
            />
          ) : (
            <PrimaryButton
              title="Review & Complete Day"
              icon={<Ionicons name="eye-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />}
              onPress={() => handleReviewDay(n.dateKey)}
              size="sm"
            />
          )}
        </View>
      </ThemedCard>
    </Animated.View>
  );
}

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing } = useTheme();
  
  const notificationsList = useExpenseStore((s) => s.notificationsList) || [];
  const deleteNotification = useExpenseStore((s) => s.deleteNotification);
  const clearAllNotifications = useExpenseStore((s) => s.clearAllNotifications);

  const visibleNotifications = notificationsList.filter((n) => !n.deleted);

  const handleReviewDay = (dateKey) => {
    const d = parseDateSafely(dateKey);
    navigation.navigate('DayDetail', { dateKey, date: d.toISOString() });
  };

  const handleDelete = (dateKey) => {
    deleteNotification(dateKey);
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  return (
    <ThemedView variant="bg" style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
      {/* Header */}
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
        <ThemedText variant="h1" color="primary" style={styles.pageTitle}>Notifications</ThemedText>
        {visibleNotifications.length > 0 && (
          <Pressable 
            onPress={handleClearAll} 
            style={({ pressed }) => [
              styles.clearAllBtn,
              { backgroundColor: colors.dangerLight, borderColor: colors.danger },
              pressed && { opacity: 0.7 },
              WEB_STYLES.cursor
            ]}
          >
            <Ionicons name="trash-outline" size={15} color={colors.danger} />
            <ThemedText variant="bodySmall" color="danger" style={styles.clearAllText}>Clear All</ThemedText>
          </Pressable>
        )}
      </View>

      <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {visibleNotifications.length > 0 ? (
          <FadeInStagger
            items={visibleNotifications}
            renderItem={(n) => (
              <NotificationRowItem
                key={n.dateKey}
                n={n}
                colors={colors}
                handleDelete={handleDelete}
                handleReviewDay={handleReviewDay}
              />
            )}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState 
              emoji="🔔"
              title="All Caught Up!" 
              message="No notifications at the moment. Keep tracking your daily expenses!"
              buttonTitle="Go Back"
              onButtonPress={() => navigation.goBack()}
            />
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, alignSelf: 'center', width: '100%', height: Platform.OS === 'web' ? '100%' : undefined },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 24, fontWeight: '800' },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: { paddingHorizontal: 16 },
  card: { marginBottom: 14 },
  row: { flexDirection: 'row', gap: 10 },
  iconContainer: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  cardBody: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginRight: 4 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  timeBadgeText: { fontSize: 10, fontWeight: '600' },
  deleteBtn: {
    padding: 4,
    alignSelf: 'flex-start',
    marginTop: -4,
    marginRight: -4,
  },
  actionsRow: { marginTop: 14, paddingTop: 12, borderTopWidth: 1 },
  emptyContainer: { marginTop: 40 },
});
