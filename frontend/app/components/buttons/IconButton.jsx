// IconButton — Circular icon button with press animation
import React, { useRef } from 'react';
import { Pressable, Animated, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

export default function IconButton({
  icon,
  onPress,
  size = 40,
  variant = 'ghost', // 'ghost' | 'filled' | 'outlined' | 'tinted'
  tintColor,
  style,
  disabled,
  ...props
}) {
  const { colors, radius } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const variants = {
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    filled: {
      backgroundColor: colors.primary,
      borderWidth: 0,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    tinted: {
      backgroundColor: tintColor ? `${tintColor}18` : colors.primaryLight,
      borderWidth: 0,
    },
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true, damping: 18, stiffness: 400 }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 400 }).start()}
        style={[
          styles.button,
          variants[variant],
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: disabled ? 0.4 : 1,
          },
          style,
        ]}
        {...props}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
