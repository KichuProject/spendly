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
    muted: colors.textPrimary || '#FFFFFF',
  };

  const sizeMap = {
    sm: { paddingVertical: 7, paddingHorizontal: 14, ...typography.buttonSmall },
    md: { paddingVertical: 13, paddingHorizontal: 22, ...typography.button },
    lg: { paddingVertical: 17, paddingHorizontal: 30, ...typography.button },
  };

  const styleBorderColor = style && (style.borderColor || (Array.isArray(style) && style.find(s => s && s.borderColor)?.borderColor));
  const styleTextColor = style && (style.color || (Array.isArray(style) && style.find(s => s && s.color)?.color));
  
  const resolvedColor = colorMap[variant] || colors.primary || '#3B82F6';
  const borderColor = disabled ? (colors.border || '#404040') : (styleBorderColor || resolvedColor);
  const textColor = disabled ? (colors.textMuted || '#A0A0A4') : (styleTextColor || resolvedColor);
  const sizeStyle = sizeMap[size] || sizeMap.md;


  return (
    <Animated.View style={[{ flex: style?.flex, width: style?.width }, style && style.margin ? { margin: style.margin, marginTop: style.marginTop, marginBottom: style.marginBottom, marginLeft: style.marginLeft, marginRight: style.marginRight } : { marginBottom: 16 }, { transform: [{ scale: scaleAnim }] }]}>


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
            opacity: disabled ? 0.7 : 1,
          },
          style,
          { borderColor }, // Override style's border to avoid double application
          { minHeight: size === 'sm' ? 36 : size === 'lg' ? 56 : 48 }, // Enforce minHeight for phone views

        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {icon && icon}
            <Text style={[styles.text, { color: textColor, fontSize: sizeStyle.fontSize || 15, fontWeight: sizeStyle.fontWeight || '700' }, { paddingTop: 0, paddingBottom: 3 }, icon && { marginLeft: 8 }, textStyle]}>
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
    width: '100%',
  },
  text: {
    letterSpacing: 0.3,
  },
});

