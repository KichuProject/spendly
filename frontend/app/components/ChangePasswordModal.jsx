import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './common/ThemedText';
import ThemedInput from './common/ThemedInput';
import PrimaryButton from './buttons/PrimaryButton';
import SecondaryButton from './buttons/SecondaryButton';
import { useTheme } from '../styles/ThemeContext';
import { WEB_STYLES } from '../styles/theme';

export default function ChangePasswordModal({ visible, onSave, onCancel }) {
  const { colors, radius } = useTheme();
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
          <Animated.View style={[styles.modal, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xl, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.header}>
              <ThemedText variant="h2" color="primary">Change Password</ThemedText>
              <Pressable onPress={onCancel} style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }, WEB_STYLES.cursor]}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.group}>
                <ThemedInput
                  label="Current Password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  icon={<Ionicons name="key" size={20} color={colors.warning} />}
                  secureTextEntry
                  error={currentPasswordError}
                  autoCapitalize="none"
                />
                <ThemedInput
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  icon={<Ionicons name="lock-closed" size={20} color={colors.success} />}
                  secureTextEntry
                  error={newPasswordError}
                  autoCapitalize="none"
                />
                <ThemedInput
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  icon={<Ionicons name="lock-closed" size={20} color={colors.primary} />}
                  secureTextEntry
                  error={confirmPasswordError}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.buttons}>
                <SecondaryButton title="Cancel" variant="muted" onPress={onCancel} style={{ flex: 1 }} />
                <PrimaryButton title="Update Password" onPress={handleSave} style={{ flex: 1 }} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    maxWidth: 440,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    borderWidth: 1,
    padding: 24,
    width: '100%',
    ...Platform.select({
      web: { boxShadow: '0 24px 64px rgba(0,0,0,0.15)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 8,
  },
  modalContent: {
    gap: 16,
  },
  group: {
    gap: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
});
