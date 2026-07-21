// SlideUp — Mount animation that slides content up with spring physics
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * @param {number} delay - ms delay before animation starts
 * @param {number} distance - px distance to travel upward
 * @param {object} springConfig - override spring physics
 */
export default function SlideUp({
  children,
  delay = 0,
  distance = 24,
  duration, // if set, uses timing instead of spring
  springConfig,
  style,
}) {
  const translateY = useRef(new Animated.Value(distance)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      const config = springConfig || {
        damping: 22,
        stiffness: 280,
        mass: 0.8,
      };

      Animated.parallel([
        duration
          ? Animated.timing(translateY, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            })
          : Animated.spring(translateY, {
              toValue: 0,
              ...config,
              useNativeDriver: true,
            }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration || 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Helper: wrap items in a stagger sequence sliding up
 */
export function SlideUpStagger({
  items,
  renderItem,
  staggerDelay = 60,
  maxDelay = 600,
  distance = 24,
  style,
}) {
  return (
    <>
      {items.map((item, index) => (
        <SlideUp
          key={index}
          delay={Math.min(index * staggerDelay, maxDelay)}
          distance={distance}
          style={style}
        >
          {renderItem(item, index)}
        </SlideUp>
      ))}
    </>
  );
}
