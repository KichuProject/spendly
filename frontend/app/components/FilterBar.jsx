import React, { useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLASS, GRADIENTS, SPACING, WEB_STYLES } from '../styles/theme';

export default function FilterBar({ filters, activeFilter, onFilterChange, style }) {
  return (
    <View style={[styles.outerWrap, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {filters.map((filter) => (
          <FilterPill
            key={filter.key}
            label={filter.label}
            icon={filter.icon}
            isActive={activeFilter === filter.key}
            onPress={() => onFilterChange(filter.key)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function FilterPill({ label, icon, isActive, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.pill, isActive && styles.pillActive, WEB_STYLES.cursor, WEB_STYLES.noSelect]}
      >
        {isActive && (
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 50 }]}
          />
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {icon && (
            <Ionicons
              name={icon}
              size={15}
              color={isActive ? COLORS.textPrimary : COLORS.textMuted}
            />
          )}
          <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    // Extra vertical padding so the ScrollView has enough room
    // and doesn't clip pill text descenders
    paddingVertical: 4,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    gap: SPACING.sm + 2,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 50,
    backgroundColor: GLASS.pill.backgroundColor,
    borderWidth: 1,
    borderColor: GLASS.pill.borderColor,
  },
  pillActive: {
    borderColor: 'rgba(124,58,237,0.5)',
  },
  pillText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
    textAlignVertical: 'center',
  },
  pillTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
});
