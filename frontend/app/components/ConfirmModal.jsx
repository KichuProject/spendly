import React, { useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, Animated, Modal, Platform } from 'react-native';
import ThemedText from './common/ThemedText';
import PrimaryButton from './buttons/PrimaryButton';
import SecondaryButton from './buttons/SecondaryButton';
import { useTheme } from '../styles/ThemeContext';

export default function ConfirmModal({ visible, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, destructive = false }) {
  const { colors, radius } = useTheme();
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
        <Animated.View style={[styles.modal, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xl, transform: [{ scale: scaleAnim }] }]}>
          <ThemedText variant="h3" color="primary" style={styles.title}>{title}</ThemedText>
          <ThemedText variant="bodySmall" color="secondary" style={styles.message}>{message}</ThemedText>
          <View style={styles.buttons}>
            <SecondaryButton title={cancelText} variant="muted" onPress={onCancel} style={styles.buttonFlex} />
            <PrimaryButton title={confirmText} variant={destructive ? 'danger' : 'primary'} onPress={onConfirm} style={styles.buttonFlex} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
      default: {},
    }),
  },
  modal: {
    borderWidth: 1,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    ...Platform.select({
      web: { boxShadow: '0 16px 48px rgba(0,0,0,0.15)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  title: { marginBottom: 8 },
  message: { lineHeight: 22, marginBottom: 24 },
  buttons: { flexDirection: 'row', gap: 12, width: '100%' },
  buttonFlex: { flex: 1, width: '100%' },
});
