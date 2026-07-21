// TypewriterText — Character-by-character text reveal for AI streaming
import React, { useState, useEffect, useRef } from 'react';
import { Text } from 'react-native';

/**
 * @param {string} text - Full text to reveal
 * @param {number} speed - ms per character (default 25)
 * @param {function} onComplete - Called when all characters are revealed
 * @param {boolean} animate - Whether to animate (false = show all immediately)
 */
export default function TypewriterText({
  text = '',
  speed = 25,
  onComplete,
  animate = true,
  style,
  ...textProps
}) {
  const [displayedText, setDisplayedText] = useState(animate ? '' : text);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!animate) {
      setDisplayedText(text);
      return;
    }

    // Reset on text change
    indexRef.current = 0;
    setDisplayedText('');

    const typeNext = () => {
      if (indexRef.current < text.length) {
        indexRef.current += 1;
        setDisplayedText(text.slice(0, indexRef.current));
        timerRef.current = setTimeout(typeNext, speed);
      } else {
        onComplete?.();
      }
    };

    timerRef.current = setTimeout(typeNext, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed, animate]);

  return (
    <Text style={style} {...textProps}>
      {displayedText}
      {animate && indexRef.current < text.length ? '▊' : ''}
    </Text>
  );
}
