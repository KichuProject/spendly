import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Modal, Platform, Linking } from 'react-native';
import { COLORS, GLASS, SHADOWS, SPACING } from '../styles/theme';
import GlassButton from './GlassButton';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VersionUpdateModal({ visible, message, platform, apkLink, onCancel }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
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

  const handleCancel = async () => {
    const now = new Date().toDateString();
    await AsyncStorage.setItem('last_version_check', now);
    if (onCancel) onCancel();
  };

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
        <Animated.View style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}>
          
          {/* Header Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name="cloud-download-outline" size={32} color="#8B5CF6" />
            </View>
          </View>

          <Text style={styles.title}>Update Available</Text>
          
          <Text style={styles.message}>
            {message || "A new version of Spendly is available with amazing new features, performance updates, and bug fixes."}
          </Text>

          <View style={styles.buttons}>
            <GlassButton 
              title="Later" 
              variant="ghost" 
              onPress={handleCancel} 
              style={{ flex: 1 }} 
            />
            <GlassButton 
              title="Update" 
              variant="primary" 
              onPress={handleUpdate} 
              style={{ flex: 1 }} 
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
    backgroundColor: 'rgba(5, 3, 20, 0.85)',
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
    backgroundColor: 'rgba(30, 22, 64, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    paddingTop: 36,
    paddingHorizontal: 24,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderRadius: 24,
    ...Platform.select({
      web: { boxShadow: '0 20px 50px rgba(0,0,0,0.6)' },
      default: {},
    }),
  },
  iconContainer: {
    position: 'absolute',
    top: -30,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(20, 15, 45, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  title: { 
    color: COLORS.textPrimary, 
    fontSize: 20, 
    fontWeight: '800', 
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center'
  },
  message: { 
    color: COLORS.textSecondary, 
    fontSize: 14, 
    lineHeight: 20, 
    marginBottom: 24,
    textAlign: 'center'
  },
  buttons: { 
    flexDirection: 'row', 
    gap: 12,
    width: '100%'
  },
});
