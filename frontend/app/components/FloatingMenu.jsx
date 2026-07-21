import React, { useRef, useState } from 'react';
import { View, StyleSheet, Animated, Platform, Pressable } from 'react-native';
import { useTheme } from '../styles/ThemeContext';
import ThemedText from './common/ThemedText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { WEB_STYLES } from '../styles/theme';

export default function FloatingMenu({ onManualAdd, onAiAdd, onAddIncome, style }) {
  const { colors, radius, elevation } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const menuStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
    opacity: animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    }),
  };

  const handleManualAdd = () => {
    toggleMenu();
    onManualAdd();
  };

  const handleAiAdd = () => {
    toggleMenu();
    onAiAdd();
  };

  const handleAddIncome = () => {
    toggleMenu();
    if (onAddIncome) onAddIncome();
  };

  return (
    <View style={[styles.container, style, { pointerEvents: 'box-none' }]}>
      <Animated.View style={[styles.menu, menuStyle, { pointerEvents: isOpen ? 'auto' : 'none' }]}>
        <Pressable 
          onPress={handleAiAdd} 
          style={({ pressed }) => [
            styles.menuItem, 
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.8 },
            WEB_STYLES.cursor
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="robot-outline" size={20} color={colors.primary} />
            <ThemedText variant="body" color="primary" style={styles.menuItemText}>AI Add</ThemedText>
          </View>
        </Pressable>

        <Pressable 
          onPress={handleAddIncome} 
          style={({ pressed }) => [
            styles.menuItem, 
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.8 },
            WEB_STYLES.cursor
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="trending-up-outline" size={18} color={colors.success} />
            <ThemedText variant="body" color="success" style={[styles.menuItemText, { color: colors.success }]}>Add Income</ThemedText>
          </View>
        </Pressable>
        
        <Pressable 
          onPress={handleManualAdd} 
          style={({ pressed }) => [
            styles.menuItem, 
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.8 },
            WEB_STYLES.cursor
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="add" size={18} color={colors.textSecondary} />
            <ThemedText variant="body" color="secondary" style={styles.menuItemText}>Manual Add</ThemedText>
          </View>
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.fabWrapper, elevation.md, {
        transform: [
          {
            rotate: animation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '90deg'],
            }),
          },
        ],
      }]}>
        <Pressable 
          onPress={toggleMenu} 
          style={({ pressed }) => [
            styles.button, 
            { backgroundColor: colors.primary, borderColor: colors.border },
            pressed && { opacity: 0.9 },
            WEB_STYLES.cursor, 
            WEB_STYLES.noSelect
          ]}
        >
          <Ionicons name={isOpen ? "close" : "wallet-outline"} size={isOpen ? 30 : 24} color={colors.textInverse} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    bottom: 100,
    ...Platform.select({
      web: { right: 'calc(50% - 220px)' },
      default: { right: 20 },
    }),
    zIndex: 100,
    alignItems: 'flex-end',
  },
  menu: {
    marginBottom: 16,
    alignItems: 'flex-end',
    gap: 12,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  menuItemText: {
    fontWeight: '700',
  },
  fabWrapper: {
    borderRadius: 30,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
