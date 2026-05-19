import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../styles/theme';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_COLORS = {
  success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', iconName: 'checkmark-circle-outline', iconColor: '#10B981' },
  error: { bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.3)', iconName: 'close-circle-outline', iconColor: '#F43F5E' },
  warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', iconName: 'warning-outline', iconColor: '#F59E0B' },
  info: { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', iconName: 'sparkles-outline', iconColor: '#A78BFA' },
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  const showToast = useCallback((message, type = 'info', duration = 3000, icon = null) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, type, icon });
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    timeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 100, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setToast(null));
    }, duration);
  }, [translateY, opacity]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <Animated.View style={[styles.toast, { backgroundColor: TOAST_COLORS[toast.type]?.bg, borderColor: TOAST_COLORS[toast.type]?.border, transform: [{ translateY }], opacity }]}>
          {toast.icon ? (
            React.isValidElement(toast.icon) ? (
              toast.icon
            ) : (
              <Text style={styles.toastEmojiIcon}>{toast.icon}</Text>
            )
          ) : (
            <Ionicons 
              name={TOAST_COLORS[toast.type]?.iconName} 
              size={20} 
              color={TOAST_COLORS[toast.type]?.iconColor} 
            />
          )}
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 10,
    ...SHADOWS.medium,
    zIndex: 9999,
    ...Platform.select({
      web: {
        position: 'fixed',
        bottom: 30,
        left: '50%',
        transform: [{ translateX: '-50%' }],
        width: 'calc(100% - 40px)',
        maxWidth: 440,
      },
      default: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        maxWidth: 440,
        alignSelf: 'center',
      },
    }),
  },
  toastEmojiIcon: { fontSize: 18 },
  toastText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
});
