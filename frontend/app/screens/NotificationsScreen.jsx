import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LiquidBackground from '../components/LiquidBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import EmptyState from '../components/EmptyState';
import useExpenseStore from '../state/useExpenseStore';
import { formatDateLong, parseDateSafely } from '../utils/dateUtils';
import { COLORS, WEB_STYLES } from '../styles/theme';
import { getScreenPaddingTop } from '../utils/platformUtils';

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
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
    <LiquidBackground>
      <View style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={[styles.backBtn, WEB_STYLES.cursor]}>
            <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.pageTitle}>Notifications</Text>
          {visibleNotifications.length > 0 && (
            <Pressable 
              onPress={handleClearAll} 
              style={({ pressed }) => [
                styles.clearAllBtn, 
                pressed && { opacity: 0.7 },
                WEB_STYLES.cursor
              ]}
            >
              <Ionicons name="trash-outline" size={15} color="#FB7185" />
              <Text style={styles.clearAllText}>Clear All</Text>
            </Pressable>
          )}
        </View>

        <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {visibleNotifications.length > 0 ? (
            visibleNotifications.map((n) => {
              const d = parseDateSafely(n.dateKey);
              const formattedDate = formatDateLong(d);
              
              return (
                <GlassCard 
                  key={n.dateKey} 
                  style={[styles.card, n.isSolved && styles.solvedCard]} 
                  glowColor={n.isSolved ? "rgba(16,185,129,0.15)" : "rgba(124,58,237,0.3)"}
                >
                  <View style={styles.row}>
                    <View style={[styles.iconContainer, n.isSolved && styles.solvedIconContainer]}>
                      <MaterialCommunityIcons 
                        name={n.isSolved ? "checkbox-marked-circle-outline" : "party-popper"} 
                        size={22} 
                        color={n.isSolved ? "#10B981" : "#A78BFA"} 
                      />
                    </View>
                    <View style={styles.cardBody}>
                      <View style={styles.titleRow}>
                        <Text style={styles.cardTitle}>
                          {n.isSolved ? "Day Logs Completed! 🎉" : "Incomplete Day Reminder"}
                        </Text>
                        <View style={styles.timeBadge}>
                          <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
                          <Text style={styles.timeBadgeText}>10:00 PM</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.cardText}>
                        {n.isSolved 
                          ? `You completed your logs for `
                          : `Your completion reminder arrived on `}
                        <Text style={styles.highlightText}>{formattedDate}</Text>.
                        {n.isSolved 
                          ? " Great job maintaining your tracking habit!"
                          : " Please check your budget logs for this day to complete it."}
                      </Text>
                    </View>
                    
                    {/* Inline Delete Button */}
                    <Pressable 
                      onPress={() => handleDelete(n.dateKey)} 
                      style={({ pressed }) => [
                        styles.deleteBtn,
                        pressed && { opacity: 0.7 },
                        WEB_STYLES.cursor
                      ]}
                    >
                      <Ionicons name="close-circle-outline" size={20} color="rgba(255, 255, 255, 0.4)" />
                    </Pressable>
                  </View>
                  
                  <View style={styles.actionsRow}>
                    <GlassButton 
                      title={n.isSolved ? "Review Completed Day" : "Review & Complete Day"} 
                      icon={<Ionicons name={n.isSolved ? "checkmark-circle-outline" : "eye-outline"} size={16} color="#fff" />} 
                      variant={n.isSolved ? "secondary" : "primary"} 
                      fullWidth 
                      small 
                      onPress={() => handleReviewDay(n.dateKey)} 
                    />
                  </View>
                </GlassCard>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <EmptyState 
                icon={<Ionicons name="checkmark-circle" size={54} color="#10B981" />}
                title="All Caught Up!" 
                message="No notifications at the moment. Keep tracking your daily expenses!"
                buttonTitle="Go Back"
                onButtonPress={() => navigation.goBack()}
              />
            </View>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, alignSelf: 'center', width: '100%', height: Platform.OS === 'web' ? '100%' : undefined },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(251,113,133,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.2)',
  },
  clearAllText: {
    color: '#FB7185',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: { paddingHorizontal: 16 },
  card: { padding: 16, marginBottom: 14, overflow: 'hidden' },
  solvedCard: {
    borderColor: 'rgba(16,185,129,0.2)',
    backgroundColor: 'rgba(16,185,129,0.03)',
  },
  row: { flexDirection: 'row', gap: 10 },
  iconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(167,139,250,0.12)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  solvedIconContainer: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderColor: 'rgba(16,185,129,0.3)',
  },
  cardBody: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginRight: 4 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  timeBadgeText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  cardText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },
  highlightText: { color: COLORS.textPrimary, fontWeight: '700' },
  deleteBtn: {
    padding: 4,
    alignSelf: 'flex-start',
    marginTop: -4,
    marginRight: -4,
  },
  actionsRow: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  emptyContainer: { marginTop: 40 },
});
