// PrimaryButton — Solid themed button with press animation + haptic
import React, { useRef } from 'react';
import { Pressable, Text, Animated, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

export default function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  icon,
  size = 'md', // 'sm' | 'md' | 'lg'
  variant = 'primary', // 'primary' | 'success' | 'danger' | 'accent'
  style,
  textStyle,
  ...props
}) {
  const { colors, radius, typography, elevation } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const colorMap = {
    primary: colors.primary,
    success: colors.success,
    danger: colors.danger,
    accent: colors.accent,
  };

  const sizeMap = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, ...typography.buttonSmall },
    md: { paddingVertical: 14, paddingHorizontal: 24, ...typography.button },
    lg: { paddingVertical: 18, paddingHorizontal: 32, ...typography.button, fontSize: 17 },
  };

  const bgColor = disabled ? colors.textMuted : colorMap[variant];
  const sizeStyle = sizeMap[size] || sizeMap.md;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      damping: 20,
      stiffness: 400,
    }).start();
    // Haptic feedback
    if (Platform.OS !== 'web') {
      try { require('expo-haptics').impactAsync('light'); } catch (e) {}
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 20,
      stiffness: 400,
    }).start();
  };

  return (
    <Animated.View style={[{ flex: style?.flex, width: style?.width }, { transform: [{ scale: scaleAnim }] }, elevation.sm]}>
      <Pressable
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          {
            backgroundColor: bgColor,
            borderRadius: radius.md,
            paddingVertical: sizeStyle.paddingVertical,
            paddingHorizontal: sizeStyle.paddingHorizontal,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={colors.textInverse} size="small" />
        ) : (
          <>
            {icon && icon}
            <Text
              style={[
                styles.text,
                { fontSize: sizeStyle.fontSize, fontWeight: sizeStyle.fontWeight, fontFamily: sizeStyle.fontFamily },
                { color: colors.textInverse },
                icon && { marginLeft: 8 },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: 0.3,
  },
});
