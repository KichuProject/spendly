// ThemedInput — Clean input with floating label and focus animation
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, Animated, StyleSheet, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeContext';

export default function ThemedInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  multiline,
  numberOfLines,
  style,
  inputStyle,
  error,
  icon,
  right,
  editable = true,
  ...props
}) {
  const { colors, radius, typography, spacing } = useTheme();
  const [focused, setFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const hasValue = value && value.length > 0;

  useEffect(() => {
    setIsSecure(secureTextEntry);
  }, [secureTextEntry]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const styleId = `autofill-override-${colors.surface.replace('#', '')}`;
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(`
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px ${colors.surface} inset !important;
            -webkit-text-fill-color: ${colors.textPrimary} !important;
            transition: background-color 5000s ease-in-out 0s;
          }
          input::-ms-reveal,
          input::-ms-clear {
            display: none;
          }
        `));
        document.head.appendChild(style);
      }
    }
  }, [colors.surface, colors.textPrimary]);

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || hasValue ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [focused, hasValue]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.danger : colors.border, error ? colors.danger : colors.primary],
  });

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -10],
  });

  const labelLeft = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [icon ? 44 : 14, 12],
  });

  const labelSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  const renderRight = right || (secureTextEntry ? (
    <Pressable onPress={() => setIsSecure(!isSecure)} hitSlop={8} style={{ padding: 2 }}>
      <Ionicons name={isSecure ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
    </Pressable>
  ) : null);

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderColor,
            borderRadius: radius.md,
          },
        ]}
      >
        {Boolean(label) && (
          <Animated.Text
            style={[
              styles.floatingLabel,
              {
                top: labelTop,
                left: labelLeft,
                fontSize: labelSize,
                color: focused ? colors.primary : colors.textTertiary,
                backgroundColor: colors.surface,
              },
            ]}
          >
            {label}
          </Animated.Text>
        )}

        <View style={styles.row}>
          {Boolean(icon) && <View style={styles.iconLeft}>{icon}</View>}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={focused || !label ? placeholder : ''}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={isSecure}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={editable}
            style={[
              styles.input,
              typography.body,
              {
                color: colors.textPrimary,
                paddingLeft: icon ? 0 : spacing.lg,
                backgroundColor: 'transparent',
              },
              multiline && { minHeight: 80, textAlignVertical: 'top' },
              inputStyle,
            ]}
            {...props}
          />
          {Boolean(renderRight) && <View style={styles.iconRight}>{renderRight}</View>}
        </View>
      </Animated.View>

      {Boolean(error) && (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    borderWidth: 1.5,
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    paddingLeft: 14,
    marginRight: 10,
  },
  iconRight: {
    paddingRight: 14,
    marginLeft: 10,
  },
  floatingLabel: {
    position: 'absolute',
    left: 14,
    paddingHorizontal: 4,
    zIndex: 1,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    paddingRight: 16,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});
