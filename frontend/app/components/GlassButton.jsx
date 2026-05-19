import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated, View, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, GLASS, SHADOWS, TYPOGRAPHY, SPACING, WEB_STYLES } from '../styles/theme';

export default function GlassButton({
  title,
  onPress,
  variant = 'primary', // primary, success, destructive, ghost, liquid
  icon,
  disabled = false,
  loading = false,
  style,
  textStyle,
  small = false,
  fullWidth = false,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const brightnessAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, tension: 300, friction: 10 }),
      Animated.timing(brightnessAnim, { toValue: 0.7, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
      Animated.timing(brightnessAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const gradientColors = {
    primary: GRADIENTS.primary,
    success: GRADIENTS.emerald,
    destructive: GRADIENTS.rose,
    ghost: ['transparent', 'transparent'],
    liquid: GRADIENTS.liquidActive,
  }[variant] || GRADIENTS.primary;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], opacity: brightnessAnim },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      <Pressable
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          small && styles.buttonSmall,
          variant === 'ghost' && styles.ghost,
          variant === 'liquid' && styles.liquid,
          disabled && styles.disabled,
          fullWidth && { width: '100%' },
          WEB_STYLES.cursor,
          WEB_STYLES.noSelect,
        ]}
      >
        {variant !== 'ghost' && (
          <LinearGradient
            colors={disabled ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)'] : gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: variant === 'liquid' ? 30 : 20 }]}
          />
        )}
        {/* Liquid button highlight */}
        {variant === 'liquid' && !disabled && (
          <View style={styles.liquidHighlight} />
        )}
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <View style={styles.content}>
            {icon && (
              typeof icon === 'string' ? (
                <Text style={styles.icon}>{icon}</Text>
              ) : (
                icon
              )
            )}
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                styles.text,
                small && styles.textSmall,
                variant === 'ghost' && styles.ghostText,
                disabled && styles.disabledText,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    ...GLASS.button,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  buttonSmall: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: COLORS.glassBorder,
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: { shadowOpacity: 0, elevation: 0 },
    }),
  },
  liquid: {
    ...GLASS.liquidButton,
    borderWidth: 0,
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  liquidHighlight: {
    position: 'absolute',
    top: 2,
    left: '15%',
    right: '15%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  disabled: {
    opacity: 0.4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  text: {
    ...TYPOGRAPHY.button,
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 14,
  },
  ghostText: {
    color: COLORS.textSecondary,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
});
