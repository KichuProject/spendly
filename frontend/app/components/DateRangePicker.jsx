import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, Animated, Platform } from 'react-native';
import { COLORS, GLASS, SPACING, SHADOWS, WEB_STYLES } from '../styles/theme';
import { getCalendarGrid, getDaysInMonth, isFuture, isToday, toDateKey } from '../utils/dateUtils';
import GlassButton from './GlassButton';

const DAYS_HEADER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DateRangePicker({ visible, onClose, onSelect, singleDate = false, installDate }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const grid = getCalendarGrid(year, month);

  const handleDayPress = (day) => {
    if (!day) return;
    const d = new Date(year, month, day);
    if (isFuture(d)) return;

    // Do not allow selecting days before the installation date
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
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Pressable onPress={prevMonth} style={[WEB_STYLES.cursor]}><Text style={styles.arrow}>‹</Text></Pressable>
            <Text style={styles.monthTitle}>{monthNames[month]} {year}</Text>
            <Pressable onPress={nextMonth} style={[WEB_STYLES.cursor]}><Text style={styles.arrow}>›</Text></Pressable>
          </View>
          <View style={styles.daysHeader}>
            {DAYS_HEADER.map((d) => <Text key={d} style={styles.dayLabel}>{d}</Text>)}
          </View>
          {grid.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((day, di) => {
                const dateObj = day ? new Date(year, month, day) : null;
                const future = dateObj ? isFuture(dateObj) : false;

                // Dim/disable days before installation
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
                      inRange && styles.dayCellRange,
                      start && styles.dayCellStart,
                      end && styles.dayCellEnd,
                      day && !disabled ? WEB_STYLES.cursor : {}
                    ]}
                  >
                    <Text style={[
                      styles.dayText,
                      disabled && styles.dayFuture,
                      today && styles.dayToday,
                      inRange && styles.daySelected
                    ]}>
                      {day || ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
          <View style={styles.footer}>
            <GlassButton title="Cancel" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
            <GlassButton title={singleDate ? 'Select' : 'Apply Range'} variant="primary" onPress={() => { if (startDate) { onSelect({ start: startDate, end: endDate || startDate }); onClose(); } }} disabled={!startDate} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
      default: {},
    }),
  },
  sheet: {
    backgroundColor: 'rgba(30,25,60,0.97)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: 0,
    ...Platform.select({
      web: { maxWidth: 480, width: '100%', alignSelf: 'center' },
      default: {},
    }),
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  arrow: { color: COLORS.textPrimary, fontSize: 28, paddingHorizontal: 12, fontWeight: '300' },
  monthTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  daysHeader: { flexDirection: 'row', marginBottom: 8 },
  dayLabel: { flex: 1, textAlign: 'center', color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  dayCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, maxHeight: 44 },
  dayCellRange: { backgroundColor: 'rgba(124,58,237,0.2)' },
  dayCellStart: { backgroundColor: '#7C3AED', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  dayCellEnd: { backgroundColor: '#7C3AED', borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  dayText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  dayFuture: { color: COLORS.textMuted, opacity: 0.3 },
  dayToday: { fontWeight: '800', color: '#FBBF24' },
  daySelected: { color: '#fff', fontWeight: '700' },
  footer: { flexDirection: 'row', gap: 12, marginTop: 16 },
});
