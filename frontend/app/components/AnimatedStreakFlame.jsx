import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Pressable } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

export default function AnimatedStreakFlame({ size = 38 }) {
  const scale = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  // Particle animated values
  const p1Pos = useRef(new Animated.ValueXY({ x: 0, y: size * 0.4 })).current;
  const p1Opacity = useRef(new Animated.Value(0)).current;
  const p2Pos = useRef(new Animated.ValueXY({ x: 0, y: size * 0.4 })).current;
  const p2Opacity = useRef(new Animated.Value(0)).current;
  const p3Pos = useRef(new Animated.ValueXY({ x: 0, y: size * 0.4 })).current;
  const p3Opacity = useRef(new Animated.Value(0)).current;

  const animateParticle = (pos, opacity, delay) => {
    pos.setValue({ x: (Math.random() - 0.5) * (size * 0.4), y: size * 0.3 });
    opacity.setValue(0);

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(pos.y, {
          toValue: -size * 0.5,
          duration: 1200 + Math.random() * 400,
          useNativeDriver: true,
        }),
        Animated.timing(pos.x, {
          toValue: (Math.random() - 0.5) * (size * 0.6),
          duration: 1200 + Math.random() * 400,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 900 + Math.random() * 200,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => animateParticle(pos, opacity, 0));
  };

  const spawnEmberBurst = (pos, opacity, delay) => {
    pos.setValue({ x: (Math.random() - 0.5) * (size * 0.4), y: size * 0.3 });
    opacity.setValue(0);

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(pos.y, {
          toValue: -size * 0.6 - Math.random() * (size * 0.2),
          duration: 800 + Math.random() * 300,
          useNativeDriver: true,
        }),
        Animated.timing(pos.x, {
          toValue: (Math.random() - 0.5) * (size * 0.8),
          duration: 800 + Math.random() * 300,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 600 + Math.random() * 200,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  };

  const handlePress = () => {
    // 1. Play subtle haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    // 2. Play scale pop spring
    scale.setValue(1.0);
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.5,
        friction: 3,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1.0,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Trigger immediate particle burst
    spawnEmberBurst(p1Pos, p1Opacity, 0);
    spawnEmberBurst(p2Pos, p2Opacity, 80);
    spawnEmberBurst(p3Pos, p3Opacity, 160);
  };

  useEffect(() => {
    // 1. Entry Animation: Snappy bounce spring
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.4,
        friction: 3,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1.0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Idle Glow Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Organic Flame Sway/Flicker Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: -1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Start Floating Particle Loops
    animateParticle(p1Pos, p1Opacity, 0);
    animateParticle(p2Pos, p2Opacity, 400);
    animateParticle(p3Pos, p3Opacity, 800);
  }, []);

  // Sway rotation and skew interpolation
  const rotate = sway.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3deg', '3deg'],
  });

  const skewX = sway.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-2.5deg', '2.5deg'],
  });

  // Glow Badge Scale & Opacity
  const glowScale = glow.interpolate({
    inputRange: [0.3, 0.7],
    outputRange: [1.0, 1.25],
  });

  return (
    <Pressable onPress={handlePress} style={[styles.container, { width: size, height: size }]}>
      {/* Background Radial Glow */}
      <Animated.View
        style={[
          styles.glowBg,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: (size * 1.4) / 2,
            opacity: glow,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      {/* Swaying & Skewing Flame Container */}
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [
            { scale },
            { rotate },
            { skewX }
          ],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="outerFire" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#EF4444" />
              <Stop offset="100%" stopColor="#F97316" />
            </LinearGradient>
            <LinearGradient id="midFire" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#F97316" />
              <Stop offset="100%" stopColor="#EAB308" />
            </LinearGradient>
            <LinearGradient id="innerCore" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#FDE047" />
              <Stop offset="100%" stopColor="#FFFFFF" />
            </LinearGradient>
          </Defs>

          {/* Outer Layer Flame Path */}
          <Path
            d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 3.5 3.5z"
            fill="url(#outerFire)"
          />

          {/* Middle Layer Flame Path */}
          <Path
            d="M9.5 14.5A2 2 0 0 0 11.5 12.5c0-1.1-.4-1.6-.8-2.4-.85-1.7-.18-3.2 1.6-4.8.4 2 1.6 3.9 3.2 5.2 1.6 1.3 2.4 2.8 2.4 4.4a5.6 5.6 0 1 1-11.2 0c0-.92.35-1.83.8-2.4a2 2 0 0 0 2.8 2.8z"
            fill="url(#midFire)"
            opacity={0.95}
          />

          {/* Inner Core Flame Core */}
          <Path
            d="M10.5 15A1.5 1.5 0 0 0 12 13.5c0-.83-.3-1.2-.6-1.8-.643-1.286-.134-2.432 1.2-3.6.3 1.5 1.2 2.94 2.4 3.9 1.2.96 1.8 2.1 1.8 3.3a4.2 4.2 0 1 1-8.4 0c0-.692.26-1.376.6-1.8a1.5 1.5 0 0 0 2.1 2.1z"
            fill="url(#innerCore)"
            opacity={0.9}
          />
        </Svg>
      </Animated.View>

      {/* Floating Sparkles / Embers */}
      <Animated.View
        style={[
          styles.ember,
          {
            transform: [
              { translateX: p1Pos.x },
              { translateY: p1Pos.y }
            ],
            opacity: p1Opacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ember,
          {
            transform: [
              { translateX: p2Pos.x },
              { translateY: p2Pos.y }
            ],
            opacity: p2Opacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ember,
          {
            transform: [
              { translateX: p3Pos.x },
              { translateY: p3Pos.y }
            ],
            opacity: p3Opacity,
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowBg: {
    position: 'absolute',
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  ember: {
    position: 'absolute',
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: '#FDE047',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 3,
  },
});
