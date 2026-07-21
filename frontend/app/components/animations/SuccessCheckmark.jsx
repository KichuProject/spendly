// SuccessCheckmark — Animated SVG checkmark that draws itself on mount
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

/**
 * @param {number} size - Circle diameter (default 64)
 * @param {number} delay - ms delay before animation (default 0)
 * @param {function} onComplete - Called after animation finishes
 */
export default function SuccessCheckmark({
  size = 64,
  delay = 0,
  onComplete,
  color,
  style,
}) {
  const { colors } = useTheme();
  const checkColor = color || colors.success;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Circle appears first
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            damping: 12,
            stiffness: 300,
            mass: 0.5,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Then checkmark bounces in
        Animated.spring(checkScaleAnim, {
          toValue: 1,
          damping: 8,
          stiffness: 350,
          mass: 0.4,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete?.();
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  const circleSize = size;
  const checkFontSize = size * 0.45;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: checkColor + '18',
          borderColor: checkColor,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <Animated.Text
        style={[
          styles.check,
          {
            fontSize: checkFontSize,
            color: checkColor,
            transform: [{ scale: checkScaleAnim }],
          },
        ]}
      >
        ✓
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
  },
  check: {
    fontWeight: '700',
  },
});
