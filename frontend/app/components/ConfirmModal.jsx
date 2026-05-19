import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Modal, Platform } from 'react-native';
import { COLORS, GLASS, SHADOWS, SPACING } from '../styles/theme';
import GlassButton from './GlassButton';

export default function ConfirmModal({ visible, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, destructive = false }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <Animated.View style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <GlassButton title={cancelText} variant="ghost" onPress={onCancel} style={{ flex: 1 }} />
            <GlassButton title={confirmText} variant={destructive ? 'destructive' : 'primary'} onPress={onConfirm} style={{ flex: 1 }} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
      default: {},
    }),
  },
  modal: {
    ...GLASS.cardElevated,
    backgroundColor: 'rgba(30,25,60,0.95)',
    padding: 24,
    width: '100%',
    maxWidth: 360,
    ...Platform.select({
      web: { boxShadow: '0 16px 48px rgba(0,0,0,0.5)' },
      default: {},
    }),
  },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  message: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 24 },
  buttons: { flexDirection: 'row', gap: 12 },
});
