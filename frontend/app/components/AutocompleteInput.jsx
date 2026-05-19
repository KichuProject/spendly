import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { COLORS, GLASS, WEB_STYLES } from '../styles/theme';

export default function AutocompleteInput({ placeholder, value, onChangeText, suggestions = [], onSelect, icon, style }) {
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
    }, 0);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.inputRow, focused && styles.inputFocused]}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={(val) => {
            onChangeText(val);
            setFocused(true);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // Only blur if we're not selecting
            if (!selectingRef.current) {
              setFocused(false);
            }
          }}
          selectionColor={COLORS.primary}
        />
      </View>
      {showDropdown && (
        <View style={styles.dropdown} pointerEvents="auto">
          {filtered.map((item, i) => (
            <Pressable
              key={i}
              onPress={() => handleSuggestionPress(item)}
              style={[styles.suggestion, WEB_STYLES.cursor]}
              android_ripple={{ color: 'rgba(168,85,247,0.1)' }}
            >
              <Text style={styles.suggestionText}>{item}</Text>
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
    ...GLASS.input,
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: 'rgba(30,25,60,0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginTop: 4,
    overflow: 'hidden',
  },
  suggestion: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  suggestionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
