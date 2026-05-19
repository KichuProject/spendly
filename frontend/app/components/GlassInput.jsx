import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Animated, Text, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLASS, SPACING, TYPOGRAPHY, WEB_STYLES } from '../styles/theme';

export default function GlassInput({
  placeholder,
  value,
  onChangeText,
  icon,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  multiline = false,
  style,
  inputStyle,
  large = false,
  prefix,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
}) {
  const [focused, setFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsSecure(secureTextEntry);
  }, [secureTextEntry]);

  useEffect(() => {
    if (error) {
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: false }),
      ]).start();
    }
  }, [error]);

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    onFocusProp?.();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    onBlurProp?.();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? '#FB7185' : GLASS.input.borderColor, error ? '#EF4444' : COLORS.glassActiveBorder],
  });

  return (
    <View style={style}>
      <Animated.View
        style={[
          styles.container,
          large && styles.containerLarge,
          { borderColor, transform: [{ translateX: shakeAnim }] },
          error && styles.errorContainer,
        ]}
      >
        {icon && (
          typeof icon === 'string' && ['👤', '✉️', '🔑', '🔒', '🔐', '🔍', '📱'].includes(icon) ? (
            <Ionicons
              name={
                icon === '👤' ? 'person-outline' :
                icon === '✉️' ? 'mail-outline' :
                icon === '🔑' || icon === '🔒' || icon === '🔐' ? 'lock-closed-outline' :
                icon === '🔍' ? 'search-outline' :
                icon === '📱' ? 'call-outline' : 'help-circle-outline'
              }
              size={18}
              color={
                error ? '#FB7185' :
                focused ? (
                  icon === '👤' ? '#38BDF8' :
                  icon === '✉️' ? '#C084FC' :
                  icon === '🔑' || icon === '🔒' || icon === '🔐' ? '#FBBF24' :
                  icon === '🔍' ? '#34D399' :
                  icon === '📱' ? '#A78BFA' :
                  '#A78BFA'
                ) : (
                  icon === '👤' ? 'rgba(56, 189, 248, 0.4)' :
                  icon === '✉️' ? 'rgba(192, 132, 252, 0.4)' :
                  icon === '🔑' || icon === '🔒' || icon === '🔐' ? 'rgba(251, 191, 36, 0.4)' :
                  icon === '🔍' ? 'rgba(52, 211, 153, 0.4)' :
                  icon === '📱' ? 'rgba(167, 139, 250, 0.4)' :
                  COLORS.textMuted
                )
              }
            />
          ) : typeof icon === 'string' ? (
            <Text style={styles.icon}>{icon}</Text>
          ) : (
            icon
          )
        )}
        {prefix && <Text style={[styles.prefix, large && styles.prefixLarge]}>{prefix}</Text>}
        <TextInput
          style={[
            styles.input,
            large && styles.inputLarge,
            !editable && styles.disabled,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          selectionColor={COLORS.primary}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            style={[WEB_STYLES.cursor, { padding: 4 }]}
          >
            <Ionicons
              name={isSecure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={focused ? '#FBBF24' : 'rgba(255, 255, 255, 0.4)'}
            />
          </Pressable>
        )}
      </Animated.View>
      {error && typeof error === 'string' && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...GLASS.input,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    ...Platform.select({
      web: { outlineStyle: 'none' },
      default: {},
    }),
  },
  containerLarge: {
    paddingVertical: 16,
    borderRadius: 20,
  },
  errorContainer: {
    borderColor: '#FB7185',
    ...Platform.select({
      web: { boxShadow: '0 0 12px rgba(251,113,133,0.3)' },
      default: { shadowColor: '#FB7185', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
    }),
  },
  icon: {
    fontSize: 18,
  },
  prefix: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  prefixLarge: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    paddingVertical: 12,
    fontSize: 16,
    ...Platform.select({
      web: { outlineStyle: 'none' },
      default: {},
    }),
  },
  inputLarge: {
    fontSize: 32,
    fontWeight: '800',
    paddingVertical: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  errorText: {
    color: '#FB7185',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
});
