// FadeIn — Reusable entrance animation wrapper with stagger support
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * @param {string} direction - 'up' | 'down' | 'left' | 'right' | 'scale' | 'none'
 * @param {number} delay - ms delay before animation starts (for stagger)
 * @param {number} duration - ms animation duration
 * @param {number} distance - px distance to travel
 */
export default function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 500,
  distance = 16,
  style,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(direction === 'scale' ? 0.92 : distance)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.spring(translate, {
          toValue: direction === 'scale' ? 1 : 0,
          damping: 22,
          stiffness: 260,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  const transformMap = {
    up: [{ translateY: translate }],
    down: [{ translateY: Animated.multiply(translate, -1) }],
    left: [{ translateX: translate }],
    right: [{ translateX: Animated.multiply(translate, -1) }],
    scale: [{ scale: translate }],
    none: [],
  };

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: transformMap[direction] || transformMap.up,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Helper: wrap items in a stagger sequence
 * Usage: <FadeInStagger items={data} renderItem={(item, i) => <Card key={i} />} />
 */
export function FadeInStagger({
  items,
  renderItem,
  direction = 'up',
  staggerDelay = 50,
  maxDelay = 500,
  style,
}) {
  return (
    <>
      {items.map((item, index) => (
        <FadeIn
          key={index}
          direction={direction}
          delay={Math.min(index * staggerDelay, maxDelay)}
          style={style}
        >
          {renderItem(item, index)}
        </FadeIn>
      ))}
    </>
  );
}
