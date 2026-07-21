// Skeleton — Shimmer loading placeholder
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

export default function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
}

// Preset layouts
export function SkeletonCard({ style }) {
  const { colors, radius } = useTheme();
  return (
    <View style={[styles.skeletonCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }, style]}>
      <Skeleton width={120} height={12} borderRadius={6} />
      <Skeleton width="60%" height={28} borderRadius={8} style={{ marginTop: 12 }} />
      <Skeleton width="40%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
    </View>
  );
}

export function SkeletonRow({ style }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.skeletonRow, { borderBottomColor: colors.border }, style]}>
      <Skeleton width={44} height={44} borderRadius={12} />
      <View style={styles.skeletonRowContent}>
        <Skeleton width="60%" height={16} borderRadius={6} />
        <Skeleton width="30%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
      </View>
      <Skeleton width={60} height={20} borderRadius={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonCard: {
    padding: 16,
    borderWidth: 1,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  skeletonRowContent: {
    flex: 1,
  },
});
