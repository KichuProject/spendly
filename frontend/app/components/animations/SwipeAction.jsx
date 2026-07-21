// SwipeAction — Swipeable row wrapper revealing action buttons
import React, { useRef, useCallback } from 'react';
import { View, Animated, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeContext';

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 72;

/**
 * Wraps a row with swipe-to-reveal actions (delete/edit).
 * Falls back to simple press on web.
 *
 * @param {function} onDelete - Called when delete action is tapped
 * @param {function} onEdit - Called when edit action is tapped
 * @param {boolean} showEdit - Show edit action (default true)
 * @param {boolean} showDelete - Show delete action (default true)
 */
export default function SwipeAction({
  children,
  onDelete,
  onEdit,
  showEdit = true,
  showDelete = true,
  style,
}) {
  const { colors, radius } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const totalActionWidth = (showEdit ? ACTION_WIDTH : 0) + (showDelete ? ACTION_WIDTH : 0);

  // On web, gestures are unreliable — just render content without swipe
  if (Platform.OS === 'web') {
    return <View style={style}>{children}</View>;
  }

  const onPanStart = useCallback(() => {
    translateX.setOffset(lastOffset.current);
    translateX.setValue(0);
  }, []);

  const onPanMove = useCallback(
    Animated.event([null, { dx: translateX }], { useNativeDriver: false }),
    []
  );

  const onPanEnd = useCallback(() => {
    translateX.flattenOffset();
    const currentValue = lastOffset.current + (translateX._value || 0);

    if (currentValue < -SWIPE_THRESHOLD) {
      // Snap open
      Animated.spring(translateX, {
        toValue: -totalActionWidth,
        damping: 22,
        stiffness: 300,
        useNativeDriver: false,
      }).start();
      lastOffset.current = -totalActionWidth;
    } else {
      // Snap closed
      Animated.spring(translateX, {
        toValue: 0,
        damping: 22,
        stiffness: 300,
        useNativeDriver: false,
      }).start();
      lastOffset.current = 0;
    }
  }, [totalActionWidth]);

  const close = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      damping: 22,
      stiffness: 300,
      useNativeDriver: false,
    }).start();
    lastOffset.current = 0;
  }, []);

  return (
    <View style={[styles.wrapper, style]}>
      {/* Action buttons behind */}
      <View style={styles.actionsContainer}>
        {showEdit && (
          <Pressable
            onPress={() => { close(); onEdit?.(); }}
            style={[styles.action, { backgroundColor: colors.primary, width: ACTION_WIDTH }]}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
          </Pressable>
        )}
        {showDelete && (
          <Pressable
            onPress={() => { close(); onDelete?.(); }}
            style={[styles.action, { backgroundColor: colors.danger, width: ACTION_WIDTH }]}
          >
            <Ionicons name="trash" size={20} color="#fff" />
          </Pressable>
        )}
      </View>

      {/* Sliding content */}
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX }],
            backgroundColor: colors.surface,
          },
        ]}
        {...Platform.select({
          ios: {
            onStartShouldSetResponder: () => true,
            onMoveShouldSetResponder: () => true,
            onResponderGrant: onPanStart,
            onResponderMove: onPanMove,
            onResponderRelease: onPanEnd,
          },
          android: {
            onStartShouldSetResponder: () => true,
            onMoveShouldSetResponder: () => true,
            onResponderGrant: onPanStart,
            onResponderMove: onPanMove,
            onResponderRelease: onPanEnd,
          },
          default: {},
        })}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    // Will be translated over the actions
  },
});
