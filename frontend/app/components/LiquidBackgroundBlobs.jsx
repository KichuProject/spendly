// Original blob-based animated background — preserved for future use.
// To use: import LiquidBackgroundBlobs from '../components/LiquidBackgroundBlobs';
// Then replace <LiquidBackground> with <LiquidBackgroundBlobs> wherever needed.

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../styles/theme';

function AnimatedBlob({ color, size, initialX, initialY, delay = 0 }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animateBlob = () => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.sequence([
              Animated.timing(translateX, { toValue: 30, duration: 4000, useNativeDriver: true }),
              Animated.timing(translateX, { toValue: -20, duration: 3500, useNativeDriver: true }),
              Animated.timing(translateX, { toValue: 0, duration: 3000, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(translateY, { toValue: -25, duration: 3500, useNativeDriver: true }),
              Animated.timing(translateY, { toValue: 20, duration: 4000, useNativeDriver: true }),
              Animated.timing(translateY, { toValue: 0, duration: 3000, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(scale, { toValue: 1.15, duration: 5000, useNativeDriver: true }),
              Animated.timing(scale, { toValue: 0.9, duration: 5000, useNativeDriver: true }),
              Animated.timing(scale, { toValue: 1, duration: 4000, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(opacity, { toValue: 0.6, duration: 3000, useNativeDriver: true }),
              Animated.timing(opacity, { toValue: 0.35, duration: 4000, useNativeDriver: true }),
              Animated.timing(opacity, { toValue: 0.5, duration: 3000, useNativeDriver: true }),
            ]),
          ]),
        ])
      ).start();
    };
    animateBlob();
  }, []);

  return (
    <Animated.View
      style={[
        styles.blob,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: initialX,
          top: initialY,
          backgroundColor: color,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    />
  );
}

export default function LiquidBackgroundBlobs({ children, style }) {
  // Use responsive dimensions so blobs reposition on web resize
  const { width: screenW, height: screenH } = useWindowDimensions();
  // On web, clamp blob spread to a reasonable area
  const blobAreaW = Platform.OS === 'web' ? Math.min(screenW, 600) : screenW;
  const blobAreaH = screenH;

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={GRADIENTS.backgroundAlt}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Animated liquid blobs — positions responsive to container */}
      <View style={styles.blobContainer} pointerEvents="none">
        <AnimatedBlob color="rgba(124,58,237,0.35)" size={280} initialX={-60} initialY={-40} delay={0} />
        <AnimatedBlob color="rgba(14,165,233,0.3)" size={240} initialX={blobAreaW - 140} initialY={blobAreaH * 0.55} delay={500} />
        <AnimatedBlob color="rgba(236,72,153,0.25)" size={200} initialX={blobAreaW * 0.3} initialY={blobAreaH * 0.3} delay={1000} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    // On web, prevent blob overflow from creating horizontal scroll
    overflow: 'hidden',
  },
  blobContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    // Using a large blur radius for the glow effect
    // On mobile we fake it with large semi-transparent circles
  },
});
