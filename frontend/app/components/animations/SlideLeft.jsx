// SlideLeft — Horizontal slide-in animation (enters from right)
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * @param {number} delay - ms delay before animation starts
 * @param {number} distance - px distance to travel from right
 */
export default function SlideLeft({
  children,
  delay = 0,
  distance = 30,
  style,
}) {
  const translateX = useRef(new Animated.Value(distance)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          damping: 22,
          stiffness: 280,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
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
          transform: [{ translateX }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Helper: wrap items in a stagger sequence sliding left
 */
export function SlideLeftStagger({
  items,
  renderItem,
  staggerDelay = 50,
  maxDelay = 500,
  distance = 30,
  style,
}) {
  return (
    <>
      {items.map((item, index) => (
        <SlideLeft
          key={index}
          delay={Math.min(index * staggerDelay, maxDelay)}
          distance={distance}
          style={style}
        >
          {renderItem(item, index)}
        </SlideLeft>
      ))}
    </>
  );
}
