// AnimatedRing — SVG circular progress ring with animated stroke
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../styles/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * @param {number} progress - 0 to 1 progress value
 * @param {number} size - Diameter (default 80)
 * @param {number} strokeWidth - Ring thickness (default 8)
 * @param {string} color - Ring color (defaults to theme primary)
 * @param {string} trackColor - Background ring color
 * @param {number} duration - Animation duration in ms (default 800)
 */
export default function AnimatedRing({
  progress = 0,
  size = 80,
  strokeWidth = 8,
  color,
  trackColor,
  duration = 800,
  children,
  style,
}) {
  const { colors } = useTheme();
  const ringColor = color || colors.primary;
  const bgColor = trackColor || colors.border;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: Math.min(Math.max(progress, 0), 1),
      duration,
      useNativeDriver: false, // strokeDashoffset not supported on native driver
    }).start();
  }, [progress, duration]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated progress ring */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
