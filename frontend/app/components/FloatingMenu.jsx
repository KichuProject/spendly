import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, SHADOWS, COLORS, WEB_STYLES } from '../styles/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function FloatingMenu({ onManualAdd, onAiAdd, style }) {
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

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  const handleManualAdd = () => {
    toggleMenu();
    onManualAdd();
  };

  const handleAiAdd = () => {
    toggleMenu();
    onAiAdd();
  };

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <Animated.View style={[styles.menu, menuStyle]} pointerEvents={isOpen ? 'auto' : 'none'}>
        <Pressable onPress={handleAiAdd} style={[styles.menuItem, WEB_STYLES.cursor]}>
          <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="robot-outline" size={20} color={COLORS.textPrimary} />
            <Text style={styles.menuItemText}>AI Add</Text>
          </View>
        </Pressable>
        <Pressable onPress={handleManualAdd} style={[styles.menuItem, WEB_STYLES.cursor]}>
          <LinearGradient colors={['rgba(30,41,59,0.9)', 'rgba(15,23,42,0.95)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <Text style={styles.menuItemText}>➕ Manual Add</Text>
        </Pressable>
      </Animated.View>

      <Animated.View style={styles.fabWrapper}>
        <Pressable onPress={toggleMenu} style={[styles.button, WEB_STYLES.cursor, WEB_STYLES.noSelect]}>
          <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <Ionicons name={isOpen ? "close" : "wallet-outline"} size={isOpen ? 32 : 26} color={COLORS.textPrimary} />
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
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    ...SHADOWS.glow('#7C3AED'),
  },
  menuItemText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  fabWrapper: {
    ...SHADOWS.glow('#7C3AED'),
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
});
