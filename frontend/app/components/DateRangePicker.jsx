import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Modal, Platform } from 'react-native';
import ThemedText from './common/ThemedText';
import PrimaryButton from './buttons/PrimaryButton';
import SecondaryButton from './buttons/SecondaryButton';
import { getCalendarGrid, isFuture, isToday, toDateKey } from '../utils/dateUtils';
import { useTheme } from '../styles/ThemeContext';
import { WEB_STYLES } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const DAYS_HEADER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DateRangePicker({ visible, onClose, onSelect, singleDate = false, installDate }) {
  const { colors, radius } = useTheme();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  if (!visible) return null;

  const grid = getCalendarGrid(year, month);

  const handleDayPress = (day) => {
    if (!day) return;
    const d = new Date(year, month, day);
    if (isFuture(d)) return;

    if (installDate) {
      const inst = new Date(installDate);
      inst.setHours(0, 0, 0, 0);
      if (d < inst) return;
    }

    if (singleDate) { onSelect({ start: d, end: d }); onClose(); return; }
    if (!startDate || (startDate && endDate)) { setStartDate(d); setEndDate(null); }
    else if (d < startDate) { setStartDate(d); }
    else { setEndDate(d); }
  };

  const isInRange = (day) => {
    if (!day || !startDate) return false;
    const d = new Date(year, month, day);
    if (endDate) return d >= startDate && d <= endDate;
    return toDateKey(d) === toDateKey(startDate);
  };

  const isStart = (day) => day && startDate && toDateKey(new Date(year, month, day)) === toDateKey(startDate);
  const isEnd = (day) => day && endDate && toDateKey(new Date(year, month, day)) === toDateKey(endDate);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { const n = new Date(); if (year === n.getFullYear() && month >= n.getMonth()) return; if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <Pressable onPress={prevMonth} style={[WEB_STYLES.cursor]}>
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} style={{ paddingHorizontal: 12 }} />
            </Pressable>
            <ThemedText variant="h2" color="primary">{monthNames[month]} {year}</ThemedText>
            <Pressable onPress={nextMonth} style={[WEB_STYLES.cursor]}>
              <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} style={{ paddingHorizontal: 12 }} />
            </Pressable>
          </View>
          <View style={styles.daysHeader}>
            {DAYS_HEADER.map((d) => (
              <ThemedText key={d} variant="caption" color="secondary" style={styles.dayLabel}>{d}</ThemedText>
            ))}
          </View>
          {grid.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((day, di) => {
                const dateObj = day ? new Date(year, month, day) : null;
                const future = dateObj ? isFuture(dateObj) : false;

                let beforeInstall = false;
                if (dateObj && installDate) {
                  const inst = new Date(installDate);
                  inst.setHours(0, 0, 0, 0);
                  if (dateObj < inst) {
                    beforeInstall = true;
                  }
                }

                const disabled = future || beforeInstall;
                const today = dateObj ? isToday(dateObj) : false;
                const inRange = isInRange(day);
                const start = isStart(day);
                const end = isEnd(day);

                return (
                  <Pressable
                    key={di}
                    onPress={() => !disabled && handleDayPress(day)}
                    style={[
                      styles.dayCell,
                      inRange && { backgroundColor: colors.primary + '15' },
                      start && { backgroundColor: colors.primary, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
                      end && { backgroundColor: colors.primary, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
                      day && !disabled ? WEB_STYLES.cursor : {}
                    ]}
                  >
                    <ThemedText
                      variant="bodySmall"
                      color={start || end ? 'inverse' : disabled ? 'secondary' : today ? 'warning' : 'primary'}
                      style={[
                        styles.dayText,
                        disabled && { opacity: 0.3 },
                        today && { fontWeight: '800' },
                        (start || end) && { fontWeight: '700', color: colors.textInverse },
                      ]}
                    >
                      {day || ''}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          ))}
          <View style={styles.footer}>
            <SecondaryButton title="Cancel" variant="muted" onPress={onClose} style={{ flex: 1 }} />
            <PrimaryButton 
              title={singleDate ? 'Select' : 'Apply Range'} 
              onPress={() => { if (startDate) { onSelect({ start: startDate, end: endDate || startDate }); onClose(); } }} 
              disabled={!startDate} 
              style={{ flex: 1 }} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
      default: {},
    }),
  },
  sheet: {
    padding: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    ...Platform.select({
      web: { maxWidth: 480, width: '100%', alignSelf: 'center' },
      default: {},
    }),
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  daysHeader: { flexDirection: 'row', marginBottom: 8 },
  dayLabel: { flex: 1, textAlign: 'center', fontWeight: '600' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  dayCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, maxHeight: 44 },
  dayText: { fontSize: 15, fontWeight: '500' },
  footer: { flexDirection: 'row', gap: 12, marginTop: 16 },
});
