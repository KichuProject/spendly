// ThemedView — Auto-themed background container
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

export default function ThemedView({ style, variant = 'bg', children, ...props }) {
  const { colors } = useTheme();
  
  const bgMap = {
    bg: colors.bg,
    secondary: colors.bgSecondary,
    tertiary: colors.bgTertiary,
    surface: colors.surface,
    transparent: 'transparent',
  };

  return (
    <View style={[{ flex: 1, backgroundColor: bgMap[variant] || colors.bg }, style]} {...props}>
      {children}
    </View>
  );
}
