// Shimmer — Enhanced shimmer loading with translateX sweep highlight
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

/**
 * A shimmer loading placeholder with a sweeping highlight effect.
 * Uses CSS animation on web for better performance.
 *
 * @param {number|string} width - Width of the shimmer bar
 * @param {number} height - Height of the shimmer bar
 * @param {number} borderRadius - Corner radius (default 8)
 */
export default function Shimmer({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    if (Platform.OS === 'web') return; // CSS handles web animation

    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 2,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Web: use CSS-based shimmer for better performance
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          {
            width,
            height,
            borderRadius,
            backgroundColor: colors.skeleton,
            overflow: 'hidden',
            position: 'relative',
          },
          style,
        ]}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, transparent 0%, ${colors.shimmerHighlight || 'rgba(255,255,255,0.08)'} 50%, transparent 100%)`,
            animation: 'shimmer-sweep 1.5s ease-in-out infinite',
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes shimmer-sweep {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `,
          }}
        />
      </View>
    );
  }

  // Native: Animated translateX sweep
  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [typeof width === 'number' ? -width : -200, typeof width === 'number' ? width : 200],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.skeleton,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '60%',
          opacity: 0.3,
          backgroundColor: colors.shimmerHighlight || 'rgba(255,255,255,0.12)',
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

// Preset layouts matching the existing Skeleton patterns
export function ShimmerCard({ style }) {
  const { colors, radius } = useTheme();
  return (
    <View style={[styles.shimmerCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }, style]}>
      <Shimmer width={120} height={12} borderRadius={6} />
      <Shimmer width="60%" height={28} borderRadius={8} style={{ marginTop: 12 }} />
      <Shimmer width="40%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
    </View>
  );
}

export function ShimmerRow({ style }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.shimmerRow, { borderBottomColor: colors.border }, style]}>
      <Shimmer width={44} height={44} borderRadius={12} />
      <View style={styles.shimmerRowContent}>
        <Shimmer width="60%" height={16} borderRadius={6} />
        <Shimmer width="30%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
      </View>
      <Shimmer width={60} height={20} borderRadius={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  shimmerCard: {
    padding: 16,
    borderWidth: 1,
  },
  shimmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  shimmerRowContent: {
    flex: 1,
  },
});
