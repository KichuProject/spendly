// Pulse — Looping opacity pulse for loading/attention indicators
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * @param {number} minOpacity - Minimum opacity in pulse cycle (default 0.4)
 * @param {number} maxOpacity - Maximum opacity in pulse cycle (default 1)
 * @param {number} duration - Full cycle duration in ms (default 1500)
 * @param {boolean} active - Whether to pulse (default true)
 */
export default function Pulse({
  children,
  minOpacity = 0.4,
  maxOpacity = 1,
  duration = 1500,
  active = true,
  style,
}) {
  const pulseAnim = useRef(new Animated.Value(maxOpacity)).current;
  const loopRef = useRef(null);

  useEffect(() => {
    if (active) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: minOpacity,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: maxOpacity,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ])
      );
      loopRef.current.start();
    } else {
      pulseAnim.setValue(maxOpacity);
      if (loopRef.current) loopRef.current.stop();
    }

    return () => {
      if (loopRef.current) loopRef.current.stop();
    };
  }, [active, minOpacity, maxOpacity, duration]);

  return (
    <Animated.View style={[{ opacity: pulseAnim }, style]}>
      {children}
    </Animated.View>
  );
}
