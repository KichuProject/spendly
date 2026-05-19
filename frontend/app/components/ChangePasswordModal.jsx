import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLASS, TYPOGRAPHY, WEB_STYLES } from '../styles/theme';
import GlassInput from './GlassInput';
import GlassButton from './GlassButton';

export default function ChangePasswordModal({ visible, onSave, onCancel }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordError('');
      setNewPasswordError('');
      setConfirmPasswordError('');

      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleSave = () => {
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    let isValid = true;

    if (!currentPassword) {
      setCurrentPasswordError('Please enter your current password');
      isValid = false;
    } else if (currentPassword.length < 6) {
      setCurrentPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!newPassword) {
      setNewPasswordError('Please enter a new password');
      isValid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    if (!isValid) return;

    // Call onSave with password data
    onSave(currentPassword, newPassword);
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onCancel}>
      <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Change Password</Text>
              <Pressable onPress={onCancel} style={[styles.closeBtn, WEB_STYLES.cursor]}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.group}>
                <GlassInput
                  placeholder="Current Password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  icon="🔑"
                  secureTextEntry
                  error={currentPasswordError}
                  autoCapitalize="none"
                />
                <GlassInput
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  icon="🔑"
                  secureTextEntry
                  error={newPasswordError}
                  autoCapitalize="none"
                />
                <GlassInput
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  icon="🔑"
                  secureTextEntry
                  error={confirmPasswordError}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.buttons}>
                <GlassButton title="Cancel" variant="ghost" onPress={onCancel} style={{ flex: 1 }} />
                <GlassButton title="Update Pass" variant="primary" onPress={handleSave} style={{ flex: 1 }} />
              </View>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 3, 20, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
      default: {},
    }),
  },
  keyboardView: {
    width: '100%',
    maxWidth: 440, // Expanded from 420 for slightly wider and more premium look
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    ...GLASS.cardElevated,
    backgroundColor: 'rgba(25, 20, 50, 0.96)',
    padding: 24, // Expanded padding from 20 to 24 for a more spacious premium layout
    width: '100%',
    ...Platform.select({
      web: { boxShadow: '0 24px 64px rgba(0,0,0,0.6)' },
      default: {},
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalContent: {
    gap: 16,
  },
  group: {
    gap: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12, // Spacing between the last input and buttons
  },
});
