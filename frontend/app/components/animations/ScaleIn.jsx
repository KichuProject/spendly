// ScaleIn — Press-scale micro-interaction wrapper
import React, { useRef, useCallback } from 'react';
import { Pressable, Animated, Platform } from 'react-native';

/**
 * Wraps any content with a spring-scale press effect.
 * @param {number} scaleDown - Scale value when pressed (default 0.96)
 * @param {function} onPress - Press handler
 * @param {boolean} disabled - Disable press
 * @param {object} style - Additional styles
 */
export default function ScaleIn({
  children,
  onPress,
  onLongPress,
  disabled,
  scaleDown = 0.96,
  style,
  haptic = true,
  ...props
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: scaleDown,
      useNativeDriver: true,
      damping: 20,
      stiffness: 400,
      mass: 0.6,
    }).start();
    if (haptic && Platform.OS !== 'web') {
      try { require('expo-haptics').impactAsync('light'); } catch (e) {}
    }
  }, [scaleDown, haptic]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 20,
      stiffness: 400,
      mass: 0.6,
    }).start();
  }, []);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onLongPress={disabled ? undefined : onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
