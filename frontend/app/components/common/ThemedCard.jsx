// ThemedCard — Premium card with theme-aware surfaces and optional elevation
import React, { useRef } from 'react';
import { View, Pressable, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';
import { pressScale } from '../../styles/animations';

export default function ThemedCard({
  children,
  style,
  onPress,
  elevated = false,
  variant = 'default', // 'default' | 'outlined' | 'filled' | 'muted'
  padding = 16,
  ...props
}) {
  const { colors, radius, elevation, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const variants = {
    default: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    filled: {
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    muted: {
      backgroundColor: isDark ? colors.bgTertiary : colors.bgSecondary,
      borderWidth: 0,
      borderColor: 'transparent',
    },
  };

  const cardStyle = [
    styles.card,
    variants[variant] || variants.default,
    { padding, borderRadius: radius.lg },
    elevated && elevation.md,
    style,
  ];

  if (onPress) {
    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: pressScale.pressed,
        useNativeDriver: true,
        damping: 20,
        stiffness: 400,
      }).start();
    };
    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: pressScale.released,
        useNativeDriver: true,
        damping: 20,
        stiffness: 400,
      }).start();
    };

    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={cardStyle}
          {...props}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
