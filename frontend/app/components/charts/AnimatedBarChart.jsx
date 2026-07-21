// AnimatedBarChart — Themed bar chart with entrance animation
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

export default function AnimatedBarChart({
  data = [], // [{ label, value, color? }]
  height = 180,
  barWidth = 28,
  gap = 8,
  showLabels = true,
  showValues = true,
  style,
}) {
  const { colors, typography, radius } = useTheme();
  // Create an array of Animated.Value for each bar to allow staggering
  const animsRef = useRef([]);
  if (animsRef.current.length !== data.length) {
    animsRef.current = data.map((_, i) => animsRef.current[i] || new Animated.Value(0));
  }
  const anims = animsRef.current;

  const maxValue = Math.max(...data.map(d => d.value), 1);

  useEffect(() => {
    // Reset all values to 0 before starting stagger animation
    anims.forEach(anim => anim.setValue(0));

    const timings = data.map((_, index) =>
      Animated.timing(anims[index], {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      })
    );

    Animated.stagger(60, timings).start();
  }, [data]);

  if (data.length === 0) return null;

  return (
    <View style={[styles.container, { height: height + 40 }, style]}>
      <View style={[styles.chartArea, { height }]}>
        {data.map((item, index) => {
          // Safely fallback if anim value isn't initialized yet
          const barAnim = anims[index] || new Animated.Value(0);
          const barHeight = barAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, (item.value / maxValue) * (height - 44)],
          });

          return (
            <View key={index} style={[styles.barGroup, { flex: 1, alignItems: 'center' }]}>
              {showValues && (
                <Text style={[typography.caption, { color: colors.textTertiary, marginBottom: 4, textAlign: 'center' }]} numberOfLines={1}>
                  {item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
                </Text>
              )}
              <View style={[styles.barWrapper, { height: height - 40 }]}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      width: barWidth,
                      height: barHeight,
                      backgroundColor: item.color || colors.primary,
                      borderTopLeftRadius: radius.sm,
                      borderTopRightRadius: radius.sm,
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    },
                  ]}
                />
              </View>
              {showLabels && (
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 6, textAlign: 'center' }]} numberOfLines={1}>
                  {item.label}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 4,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
  },
  barGroup: {
    alignItems: 'center',
  },
  barWrapper: {
    justifyContent: 'flex-end',
  },
  bar: {
    minHeight: 4,
  },
});
