// ThinkingDots — 3-dot bounce animation for AI "thinking" state
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

/**
 * @param {number} dotSize - Diameter of each dot (default 8)
 * @param {number} bounceHeight - Pixels to bounce (default 6)
 * @param {string} color - Dot color (defaults to theme primary)
 */
export default function ThinkingDots({
  dotSize = 8,
  bounceHeight = 6,
  color,
  style,
}) {
  const { colors } = useTheme();
  const dotColor = color || colors.primary;

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -bounceHeight,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(600 - delay), // Keep total cycle consistent
        ])
      );

    const anim1 = createBounce(dot1, 0);
    const anim2 = createBounce(dot2, 150);
    const anim3 = createBounce(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [bounceHeight]);

  const dotStyle = {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: dotColor,
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[dotStyle, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[dotStyle, { transform: [{ translateY: dot2 }] }, styles.dotGap]} />
      <Animated.View style={[dotStyle, { transform: [{ translateY: dot3 }] }, styles.dotGap]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dotGap: {
    marginLeft: 6,
  },
});
