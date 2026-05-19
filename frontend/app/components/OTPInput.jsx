import React, { useRef, useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { COLORS, GLASS } from '../styles/theme';

export default function OTPInput({ length = 6, onComplete, error }) {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputs = useRef([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

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
      if (digits.length >= length) onComplete?.(newOtp.join(''));
      return;
    }
    newOtp[index] = text.replace(/\D/g, '');
    setOtp(newOtp);
    if (text && index < length - 1) inputs.current[index + 1]?.focus();
    const full = newOtp.join('');
    if (full.length === length) onComplete?.(full);
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
      {otp.map((digit, i) => (
        <TextInput
          key={i}
          ref={(ref) => (inputs.current[i] = ref)}
          style={[styles.box, digit && styles.boxFilled, error && styles.boxError]}
          value={digit}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={i === 0 ? length : 1}
          selectionColor={COLORS.primary}
          autoFocus={i === 0}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
  box: {
    width: 36,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    padding: 0,
  },
  boxFilled: { borderColor: COLORS.glassActiveBorder, backgroundColor: 'rgba(124,58,237,0.15)' },
  boxError: { borderColor: '#FB7185' },
});
