// SecondaryButton — Outlined themed button
import React, { useRef } from 'react';
import { Pressable, Text, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

export default function SecondaryButton({
  title,
  onPress,
  disabled,
  loading,
  icon,
  size = 'md',
  variant = 'primary', // 'primary' | 'danger' | 'muted'
  style,
  textStyle,
  ...props
}) {
  const { colors, radius, typography } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const colorMap = {
    primary: colors.primary,
    danger: colors.danger,
    muted: colors.textSecondary,
  };

  const sizeMap = {
    sm: { paddingVertical: 7, paddingHorizontal: 14, ...typography.buttonSmall },
    md: { paddingVertical: 13, paddingHorizontal: 22, ...typography.button },
    lg: { paddingVertical: 17, paddingHorizontal: 30, ...typography.button },
  };

  const borderColor = disabled ? colors.textMuted : colorMap[variant];
  const textColor = disabled ? colors.textMuted : colorMap[variant];
  const sizeStyle = sizeMap[size] || sizeMap.md;

  return (
    <Animated.View style={[{ flex: style?.flex, width: style?.width }, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, damping: 20, stiffness: 400 }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 400 }).start()}
        style={[
          styles.button,
          {
            borderColor,
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
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {icon && icon}
            <Text style={[styles.text, { color: textColor, fontSize: sizeStyle.fontSize, fontWeight: sizeStyle.fontWeight }, icon && { marginLeft: 8 }, textStyle]}>
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
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  text: {
    letterSpacing: 0.3,
  },
});
