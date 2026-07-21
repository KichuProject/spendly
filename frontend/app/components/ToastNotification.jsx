import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SHADOWS } from '../styles/theme';
import { useTheme } from '../styles/ThemeContext';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const theme = useTheme();
  const colors = theme.colors;
  const isDark = theme.mode === 'dark';
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

  const getToastColors = () => {
    if (!toast) return {};
    switch (toast.type) {
      case 'success':
        return {
          bg: isDark ? 'rgba(16,185,129,0.15)' : colors.successLight,
          border: isDark ? 'rgba(16,185,129,0.3)' : colors.success,
          iconName: 'checkmark-circle',
          iconColor: colors.success
        };
      case 'error':
        return {
          bg: isDark ? 'rgba(244,63,94,0.15)' : colors.dangerLight,
          border: isDark ? 'rgba(244,63,94,0.3)' : colors.danger,
          iconName: 'close-circle',
          iconColor: colors.danger
        };
      case 'warning':
        return {
          bg: isDark ? 'rgba(245,158,11,0.15)' : colors.warningLight,
          border: isDark ? 'rgba(245,158,11,0.3)' : colors.warning,
          iconName: 'warning',
          iconColor: colors.warning
        };
      case 'info':
      default:
        return {
          bg: isDark ? 'rgba(124,58,237,0.15)' : colors.accentLight,
          border: isDark ? 'rgba(124,58,237,0.3)' : colors.accent,
          iconName: 'sparkles',
          iconColor: colors.accent
        };
    }
  };

  const toastStyle = getToastColors();

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <Animated.View style={[
          styles.toast,
          {
            backgroundColor: toastStyle.bg,
            borderColor: toastStyle.border,
            transform: [{ translateY }],
            opacity
          }
        ]}>
          {toast.icon ? (
            React.isValidElement(toast.icon) ? (
              toast.icon
            ) : (
              <Text style={styles.toastEmojiIcon}>{toast.icon}</Text>
            )
          ) : (
            <Ionicons 
              name={toastStyle.iconName} 
              size={20} 
              color={toastStyle.iconColor} 
            />
          )}
          <Text style={[styles.toastText, { color: isDark ? '#FFFFFF' : '#171717' }]}>{toast.message}</Text>
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
  toastText: { fontSize: 14, fontWeight: '600', flex: 1 },
});
