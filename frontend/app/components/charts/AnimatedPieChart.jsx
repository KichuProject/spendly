// AnimatedPieChart — Themed donut/pie chart with draw animation
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../styles/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function AnimatedPieChart({
  data = [], // [{ label, value, color }]
  size = 160,
  strokeWidth = 18,
  showCenter = true,
  centerLabel = '',
  centerValue = '',
  style,
}) {
  const { colors, typography, radius } = useTheme();
  const animProgress = useRef(new Animated.Value(0)).current;

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const center = size / 2;

  useEffect(() => {
    animProgress.setValue(0);
    Animated.timing(animProgress, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [data]);

  let cumulativePercent = 0;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: animProgress }], opacity: animProgress }, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <G transform={`rotate(-90 ${center} ${center})`}>
          {data.map((item, index) => {
            const percent = item.value / total;
            const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
            const strokeDashoffset = -circumference * cumulativePercent;
            cumulativePercent += percent;

            return (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={r}
                stroke={item.color || colors.primary}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            );
          })}
        </G>
      </Svg>

      {showCenter && (
        <View style={[styles.centerLabel, { width: size, height: size }]}>
          {centerLabel ? (
            <Text style={[typography.caption, { color: colors.textTertiary }]}>{centerLabel}</Text>
          ) : null}
          {centerValue ? (
            <Text style={[typography.amountSmall, { color: colors.textPrimary }]}>{centerValue}</Text>
          ) : null}
        </View>
      )}
    </Animated.View>
  );
}

import { FadeInStagger } from '../animations/FadeIn';

// Legend component
export function PieChartLegend({ data = [], style }) {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.legend, style]}>
      <FadeInStagger
        items={data}
        renderItem={(item) => (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color || colors.primary }]} />
            <Text style={[typography.bodySmall, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
              {item.label}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textPrimary, fontWeight: '700' }]}>
              {typeof item.value === 'number' ? item.value.toLocaleString('en-IN') : item.value}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    gap: 8,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
