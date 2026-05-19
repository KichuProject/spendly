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
import { COLORS, GLASS, WEB_STYLES } from '../styles/theme';
import GlassInput from './GlassInput';
import GlassButton from './GlassButton';

export default function EditProfileModal({ visible, user, onSave, onCancel }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setName(user?.name || '');
      setEmail(user?.email || '');
      setNameError('');
      setEmailError('');

      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible, user]);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSave = () => {
    setNameError('');
    setEmailError('');

    let isValid = true;

    if (!name.trim()) {
      setNameError('Please enter your name');
      isValid = false;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    if (!isValid) return;

    onSave({
      name: name.trim(),
      email: email.trim(),
    });
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
              <Text style={styles.title}>Edit Profile</Text>
              <Pressable onPress={onCancel} style={[styles.closeBtn, WEB_STYLES.cursor]}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              {/* Profile Details Group */}
              <View style={styles.group}>
                <Text style={styles.groupLabel}>Profile Details</Text>
                <GlassInput
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  icon="👤"
                  error={nameError}
                  autoCapitalize="words"
                />
                <GlassInput
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  icon="✉️"
                  error={emailError}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.buttons}>
                <GlassButton title="Cancel" variant="ghost" onPress={onCancel} style={{ flex: 1 }} />
                <GlassButton title="Save Changes" variant="primary" onPress={handleSave} style={{ flex: 1 }} />
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
  groupLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    marginLeft: 2,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12, // Spacing between the last input and buttons
  },
});
