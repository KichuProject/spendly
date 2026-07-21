import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, SHADOWS, COLORS, WEB_STYLES } from '../styles/theme';

export default function FAB({ onPress, icon = '+', style }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.spring(scaleAnim, { toValue: 0.85, useNativeDriver: true, tension: 300, friction: 10 }).start();
  const onOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut} style={[styles.button, WEB_STYLES.cursor, WEB_STYLES.noSelect]}>
        <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        {React.isValidElement(icon) ? icon : <Text style={styles.icon}>{icon}</Text>}
      </Pressable>
    </Animated.View>
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
    ...SHADOWS.glow('#7C3AED'),
    borderRadius: 30,
    zIndex: 100,
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
    backgroundColor: 'transparent',
  },
  icon: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
