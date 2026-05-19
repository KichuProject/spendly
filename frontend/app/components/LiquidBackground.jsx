import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../styles/theme';

const { width: SW, height: SH } = Dimensions.get('screen');

// A single glowing aurora band — animates opacity + translateY
function AuroraBand({ colors, startX, startY, width, height, angle, duration, delay }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: duration * 0.4, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.3, duration: duration * 0.3, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.85, duration: duration * 0.3, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(translateY, { toValue: -28, duration: duration * 0.5, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 18, duration: duration * 0.5, useNativeDriver: true }),
          ]),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        width,
        height,
        opacity,
        transform: [{ translateY }, { rotate: `${angle}deg` }],
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

// Animated pulsing star / spark dot
function Spark({ x, y, size, duration, delay, color }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: duration * 0.4, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: duration * 0.6, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.4, duration: duration * 0.5, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 0.5, duration: duration * 0.5, useNativeDriver: true }),
          ]),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ scale }],
        // Glow on native via shadow
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: size * 2,
        elevation: 6,
      }}
    />
  );
}

// Thin animated horizontal scan line
function ScanLine({ yStart, duration, delay }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 0.4, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: SH * 0.35, duration: duration, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: yStart,
        height: 1.5,
        backgroundColor: 'rgba(139,92,246,0.6)',
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
}

export default function LiquidBackground({ children, style }) {
  return (
    <View style={[styles.container, style]}>
      {/* Deep space base gradient */}
      <LinearGradient
        colors={['#020412', '#05082B', '#080D2E', '#030818']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      {/* Aurora bands — wide diagonal glowing curtains of light */}
      <View style={styles.auroraContainer} pointerEvents="none">
        {/* Primary violet aurora — top-left sweeping diagonally */}
        <AuroraBand
          colors={['transparent', 'rgba(109,40,217,0.18)', 'rgba(139,92,246,0.32)', 'rgba(109,40,217,0.18)', 'transparent']}
          startX={-SW * 0.3} startY={SH * 0.05} width={SW * 1.6} height={220}
          angle={-18} duration={7000} delay={0}
        />
        {/* Cyan aurora — mid screen sweeping diagonally */}
        <AuroraBand
          colors={['transparent', 'rgba(6,182,212,0.10)', 'rgba(34,211,238,0.22)', 'rgba(6,182,212,0.10)', 'transparent']}
          startX={-SW * 0.2} startY={SH * 0.28} width={SW * 1.4} height={160}
          angle={-12} duration={9000} delay={1500}
        />
        {/* Indigo aurora — lower mid screen */}
        <AuroraBand
          colors={['transparent', 'rgba(79,70,229,0.12)', 'rgba(99,102,241,0.28)', 'rgba(79,70,229,0.12)', 'transparent']}
          startX={-SW * 0.1} startY={SH * 0.55} width={SW * 1.2} height={180}
          angle={-8} duration={11000} delay={3000}
        />
        {/* Emerald accent — lower section */}
        <AuroraBand
          colors={['transparent', 'rgba(16,185,129,0.06)', 'rgba(52,211,153,0.14)', 'rgba(16,185,129,0.06)', 'transparent']}
          startX={SW * 0.0} startY={SH * 0.72} width={SW * 1.1} height={130}
          angle={-6} duration={13000} delay={4500}
        />
        {/* Rose accent — near top right */}
        <AuroraBand
          colors={['transparent', 'rgba(236,72,153,0.07)', 'rgba(244,114,182,0.15)', 'rgba(236,72,153,0.07)', 'transparent']}
          startX={SW * 0.2} startY={-40} width={SW} height={120}
          angle={-22} duration={8500} delay={700}
        />

        {/* Sparkling star particles */}
        <Spark x={SW * 0.12} y={SH * 0.08} size={3} color="#C4B5FD" duration={3200} delay={0} />
        <Spark x={SW * 0.78} y={SH * 0.12} size={2} color="#67E8F9" duration={4100} delay={600} />
        <Spark x={SW * 0.35} y={SH * 0.22} size={2.5} color="#A78BFA" duration={2800} delay={1200} />
        <Spark x={SW * 0.65} y={SH * 0.38} size={2} color="#6EE7B7" duration={5000} delay={400} />
        <Spark x={SW * 0.88} y={SH * 0.47} size={3} color="#818CF8" duration={3700} delay={900} />
        <Spark x={SW * 0.08} y={SH * 0.55} size={2} color="#F9A8D4" duration={4400} delay={1800} />
        <Spark x={SW * 0.52} y={SH * 0.63} size={2.5} color="#C4B5FD" duration={3000} delay={300} />
        <Spark x={SW * 0.25} y={SH * 0.78} size={2} color="#67E8F9" duration={4800} delay={2200} />
        <Spark x={SW * 0.72} y={SH * 0.82} size={3} color="#A78BFA" duration={3500} delay={1100} />
        <Spark x={SW * 0.44} y={SH * 0.91} size={2} color="#6EE7B7" duration={2600} delay={500} />
        <Spark x={SW * 0.93} y={SH * 0.25} size={2} color="#FCA5A5" duration={4200} delay={1600} />
        <Spark x={SW * 0.18} y={SH * 0.42} size={1.5} color="#FCD34D" duration={3900} delay={2800} />

        {/* Scan lines for a subtle tech / holographic feel */}
        <ScanLine yStart={SH * 0.15} duration={5000} delay={0} />
        <ScanLine yStart={SH * 0.45} duration={7000} delay={3500} />
        <ScanLine yStart={SH * 0.7} duration={6000} delay={7000} />

        {/* Corner radial vignette overlays for depth */}
        <LinearGradient
          colors={['rgba(124,58,237,0.20)', 'transparent']}
          style={[StyleSheet.absoluteFill, { height: SH * 0.45, borderBottomRightRadius: SH * 0.45 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(6,182,212,0.12)', 'transparent']}
          style={[StyleSheet.absoluteFill, { top: 'auto', bottom: 0, height: SH * 0.45, borderTopLeftRadius: SH * 0.45 }]}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 0 }}
        />
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020412',
    overflow: 'hidden',
  },
  auroraContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
