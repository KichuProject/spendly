import React, { useRef, useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../styles/ThemeContext';

export default function OTPInput({ length = 6, onComplete, error }) {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputs = useRef([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { colors, radius, typography } = useTheme();

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    // Handle paste
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, length);
      for (let i = 0; i < length; i++) { newOtp[i] = digits[i] || ''; }
      setOtp(newOtp);
      const lastIdx = Math.min(digits.length, length) - 1;
      inputs.current[lastIdx]?.focus();
      setFocusedIndex(lastIdx);
      if (digits.length >= length) onComplete?.(newOtp.join(''));
      return;
    }
    newOtp[index] = text.replace(/\D/g, '');
    setOtp(newOtp);
    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
    const full = newOtp.join('');
    if (full.length === length) onComplete?.(full);
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
      {otp.map((digit, i) => {
        const isFocused = focusedIndex === i;
        const hasValue = digit.length > 0;
        
        let borderColor = colors.border;
        let backgroundColor = colors.surface;
        
        if (error) {
          borderColor = colors.danger;
        } else if (isFocused) {
          borderColor = colors.primary;
          backgroundColor = `${colors.primary}10`;
        } else if (hasValue) {
          borderColor = `${colors.primary}80`;
        }

        return (
          <TextInput
            key={i}
            ref={(ref) => (inputs.current[i] = ref)}
            style={[
              styles.box,
              typography?.h2,
              {
                borderRadius: radius.md,
                borderColor: borderColor,
                backgroundColor: backgroundColor,
                color: colors.textPrimary,
                shadowColor: isFocused ? colors.primary : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isFocused ? 0.2 : 0,
                shadowRadius: isFocused ? 8 : 0,
                elevation: isFocused ? 4 : 0,
              }
            ]}
            value={digit}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            onFocus={() => setFocusedIndex(i)}
            onBlur={() => {
              if (focusedIndex === i) {
                setFocusedIndex(-1);
              }
            }}
            keyboardType="number-pad"
            maxLength={i === 0 ? length : 1}
            selectionColor={colors.primary}
            autoFocus={i === 0}
          />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  box: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    textAlign: 'center',
    padding: 0,
    fontWeight: '700',
    fontSize: 24,
  },
});
