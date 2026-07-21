import React, { useRef } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './common/ThemedText';
import { useTheme } from '../styles/ThemeContext';
import { WEB_STYLES } from '../styles/theme';

export default function FilterBar({ filters, activeFilter, onFilterChange, style }) {
  const { spacing } = useTheme();

  return (
    <View style={[styles.outerWrap, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.container, { paddingHorizontal: spacing.lg, gap: spacing.sm + 2 }]}
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
  const { colors, radius } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };

  const activeBg = colors.primary;
  const activeBorder = colors.primary;
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.pill,
          {
            borderRadius: radius.pill,
            backgroundColor: isActive ? activeBg : colors.surfaceSecondary,
            borderColor: isActive ? activeBorder : colors.border,
          },
          WEB_STYLES.cursor,
          WEB_STYLES.noSelect
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {icon && (
            <Ionicons
              name={icon}
              size={15}
              color={isActive ? '#FFFFFF' : colors.textTertiary}
            />
          )}
          <ThemedText
            style={[
              styles.pillText,
              {
                color: isActive ? '#FFFFFF' : colors.textSecondary,
                fontWeight: isActive ? '700' : '600',
              }
            ]}
          >
            {label}
          </ThemedText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    paddingVertical: 4,
  },
  container: {
    flexDirection: 'row',
    paddingVertical: 6,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    textAlignVertical: 'center',
  },
});
