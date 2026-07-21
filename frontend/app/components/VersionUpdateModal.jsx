import React, { useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, Animated, Modal, Platform, Linking } from 'react-native';
import ThemedText from './common/ThemedText';
import PrimaryButton from './buttons/PrimaryButton';
import SecondaryButton from './buttons/SecondaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/ThemeContext';

export default function VersionUpdateModal({ visible, message, platform, apkLink, onCancel }) {
  const { colors, radius } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 90, friction: 12 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const handleUpdate = () => {
    if (platform === 'android' && apkLink) {
      Linking.openURL(apkLink);
    } else {
      const url = platform === 'android'
        ? 'https://play.google.com/store/apps/details?id=com.kishore.spendly'
        : 'https://apps.apple.com/app/idYOUR_APP_ID';
      Linking.openURL(url);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
        <Animated.View style={[styles.modal, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xl, transform: [{ scale: scaleAnim }] }]}>
          
          {/* Top Decorative Icon */}
          <View style={[styles.iconWrapper, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}>
            <Ionicons name="cloud-download" size={32} color={colors.accent} />
          </View>

          <ThemedText variant="h3" color="primary" style={styles.title}>
            Update Available
          </ThemedText>
          
          <ThemedText variant="bodySmall" color="secondary" style={styles.message}>
            {message || "A new version of Spendly is available with amazing new features, performance updates, and bug fixes."}
          </ThemedText>

          {/* Action Buttons */}
          <View style={styles.buttons}>
            <SecondaryButton 
              title="Later" 
              variant="muted" 
              onPress={handleCancel} 
              style={styles.buttonFlex} 
            />
            <PrimaryButton 
              title="Update Now" 
              onPress={handleUpdate} 
              style={styles.buttonFlex} 
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
    paddingTop: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 20px 50px rgba(0,0,0,0.3)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { 
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  },
  message: { 
    lineHeight: 22, 
    marginBottom: 24,
    textAlign: 'center',
  },
  buttons: { 
    flexDirection: 'row', 
    gap: 12,
    width: '100%',
  },
  buttonFlex: {
    flex: 1,
    width: '100%',
  },
});

