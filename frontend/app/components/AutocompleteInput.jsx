import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { COLORS, WEB_STYLES } from '../styles/theme';
import { useTheme } from '../styles/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function AutocompleteInput({ placeholder, value, onChangeText, suggestions = [], onSelect, icon, style }) {
  const { colors, radius } = useTheme();
  const [focused, setFocused] = useState(false);
  const selectingRef = useRef(false);
  
  const filtered = value && value.length > 0
    ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
    : [];
  const showDropdown = focused && filtered.length > 0;

  const handleSuggestionPress = (item) => {
    console.log('✅ Suggestion pressed:', item);
    selectingRef.current = true;
    // Call the callback with the selected item
    onSelect(item);
    // Reset flag and close dropdown after callback completes
    setTimeout(() => {
      selectingRef.current = false;
      setFocused(false);
    }, 100);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.inputRow, focused && styles.inputFocused]}>
        {icon && (typeof icon === 'string' ? <Text style={styles.icon}>{icon}</Text> : icon)}
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={(val) => {
            onChangeText(val);
            setFocused(true);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // Delay closing the dropdown to allow onPress to register
            setTimeout(() => {
              if (!selectingRef.current) {
                setFocused(false);
              }
            }, 200);
          }}
          selectionColor={COLORS.primary}
        />
      </View>
      {showDropdown && (
        <View style={[styles.dropdown, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderRadius: radius.md, pointerEvents: 'auto' }]}>
          {filtered.map((item, i) => (
            <Pressable
              key={i}
              onPressIn={() => handleSuggestionPress(item)}
              style={({ pressed }) => [
                styles.suggestion,
                {
                  borderBottomColor: colors.borderLight,
                  backgroundColor: pressed ? (colors.primary + '15') : 'transparent',
                },
                WEB_STYLES.cursor
              ]}
              android_ripple={{ color: colors.primary + '20' }}
            >
              <View style={styles.suggestionContent}>
                <View style={styles.suggestionLeft}>
                  <Ionicons name="time-outline" size={15} color={colors.textTertiary} style={styles.timeIcon} />
                  <Text style={[styles.suggestionText, { color: colors.textPrimary }]}>{item}</Text>
                </View>
                <Ionicons name="arrow-up-back" size={15} color={colors.textMuted} style={styles.arrowIcon} />
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { zIndex: 10 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    gap: 8,
  },
  inputFocused: { borderColor: COLORS.glassActiveBorder },
  icon: { fontSize: 16 },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    paddingVertical: 12,
    fontWeight: '500',
    ...Platform.select({
      web: { outlineStyle: 'none' },
      default: {},
    }),
  },
  dropdown: {
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  suggestion: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeIcon: {
    marginRight: 2,
    opacity: 0.8,
  },
  arrowIcon: {
    opacity: 0.5,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
