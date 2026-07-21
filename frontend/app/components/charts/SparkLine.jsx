// SparkLine — Inline sparkline chart with trace entrance animation
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from '../../styles/ThemeContext';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

export default function SparkLine({
  data = [], // number[]
  width = 80,
  height = 30,
  color, // override
  strokeWidth = 2,
  style,
}) {
  const { colors } = useTheme();
  const traceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    traceAnim.setValue(1);
    Animated.timing(traceAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [data]);

  if (data.length < 2) return <View style={[{ width, height }, style]} />;

  const lineColor = color || colors.primary;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = padding + (1 - (val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const totalLength = width * 1.5;
  const strokeDashoffset = traceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, totalLength],
  });

  return (
    <View style={[{ width, height }, style]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <AnimatedPolyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={[totalLength, totalLength]}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
    </View>
  );
}
