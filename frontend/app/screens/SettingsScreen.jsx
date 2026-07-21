import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Switch, Platform, Linking, AppState, Animated, Modal } from 'react-native';
import SecondaryButton from '../components/buttons/SecondaryButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import packageJson from '../../package.json';
import Constants from 'expo-constants';

import ThemedView from '../components/common/ThemedView';
import ThemedText from '../components/common/ThemedText';
import ThemedCard from '../components/common/ThemedCard';
import ConfirmModal from '../components/ConfirmModal';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import VersionUpdateModal from '../components/VersionUpdateModal';

import { useToast } from '../components/ToastNotification';
import useAuthStore from '../state/useAuthStore';
import useExpenseStore from '../state/useExpenseStore';
import { useTheme, useThemeMode } from '../styles/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { getScreenPaddingTop } from '../utils/platformUtils';
import { toDateKey } from '../utils/dateUtils';
import { checkNotificationPermissions, requestNotificationPermissions } from '../utils/notificationService';
import { getUpdateStatus } from '../utils/useVersionCheck';
import { WEB_STYLES } from '../styles/theme';
import FadeIn from '../components/animations/FadeIn';
import SlideUp from '../components/animations/SlideUp';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors, radius, spacing, elevation } = useTheme();
  const { mode, setMode } = useThemeMode();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const showToast = useToast();

  const dayCompletions = useExpenseStore((s) => s.dayCompletions);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updatePlatform, setUpdatePlatform] = useState('android');
  const [updateApkLink, setUpdateApkLink] = useState('');
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Sync initial switch state strictly with native system permission
  useEffect(() => {
    async function syncToggleState() {
      const isGranted = await checkNotificationPermissions();
      setNotifEnabled(isGranted);
      
      try {
        const { apiClient } = require('../utils/apiClient');
        if (isGranted) {
          await AsyncStorage.setItem('USER_NOTIF_PREF', 'enabled');
          await apiClient.enableNotifications();
          
          const { registerForPushNotificationsAsync } = require('../utils/notificationService');
          const token = await registerForPushNotificationsAsync();
          if (token) {
            await useAuthStore.getState().registerPushToken(token);
          }
        } else {
          await AsyncStorage.setItem('USER_NOTIF_PREF', 'disabled');
          await apiClient.disableNotifications();
        }
      } catch (err) {
        console.log("Error syncing notification permissions with backend:", err);
      }
    }

    syncToggleState();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        syncToggleState();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleToggleNotifications = async (value) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await AsyncStorage.setItem('USER_NOTIF_PREF', 'enabled');
        setNotifEnabled(true);
        showToast('Notifications enabled!', 'success', 3000, <Ionicons name="sparkles-outline" size={20} color={colors.success} />);
        
        try {
          const { apiClient } = require('../utils/apiClient');
          await apiClient.enableNotifications();
          const { registerForPushNotificationsAsync } = require('../utils/notificationService');
          const token = await registerForPushNotificationsAsync();
          if (token) {
            await useAuthStore.getState().registerPushToken(token);
          }
        } catch (apiErr) {
          console.log("❌ Failed to enable notifications on backend:", apiErr);
        }

        const todayKey = toDateKey(new Date());
        const isTodayComplete = dayCompletions[todayKey] === true;
        const { scheduleTodayReminderIfNeeded } = require('../utils/notificationService');
        await scheduleTodayReminderIfNeeded(isTodayComplete);
      } else {
        showToast('System blocked! Redirecting to settings...', 'warning', 3000, <Ionicons name="warning-outline" size={20} color={colors.warning} />);
        setTimeout(() => {
          Linking.openSettings();
        }, 1000);
      }
    } else {
      showToast('Redirecting to settings to disable...', 'info', 3000, <Ionicons name="settings-outline" size={20} color={colors.accent} />);
      setTimeout(() => {
        Linking.openSettings();
      }, 1000);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const handleSaveProfile = async ({ name, email }) => {
    try {
      const updateProfile = useAuthStore((s) => s.updateProfile);
      const result = await updateProfile({ name, email });
      if (result) {
        setShowEditModal(false);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleSavePassword = async (currentPassword, newPassword) => {
    try {
      const changePassword = useAuthStore((s) => s.changePassword);
      const result = await changePassword(currentPassword, newPassword);
      if (result) {
        setShowPasswordModal(false);
        showToast('Password updated successfully!', 'success', 3000, <Ionicons name="lock-closed-outline" size={20} color={colors.success} />);
      }
    } catch (error) {
      showToast('Failed to change password', 'error');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <ThemedView variant="bg" style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
      <SlideUp delay={0} distance={16}>
      <ThemedText variant="h1" color="primary" style={styles.pageTitle}>Settings</ThemedText>
      </SlideUp>

      <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <FadeIn direction="up" delay={50}>
        <ThemedCard style={styles.profileCard} elevated>
          <Pressable
            onPress={() => setShowEditModal(true)}
            style={({ pressed }) => [
              styles.editProfileIcon,
              { backgroundColor: colors.borderLight, borderColor: colors.border },
              pressed && { opacity: 0.7 },
              WEB_STYLES.cursor,
            ]}
          >
            <Ionicons name="create" size={20} color={colors.primary} />
          </Pressable>
          <View style={[styles.profileAvatar, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <ThemedText variant="h2" color="blue" style={styles.profileInitials}>{initials}</ThemedText>
          </View>
          <ThemedText variant="h2" color="primary">{user?.name || 'User'}</ThemedText>
          <ThemedText variant="bodySmall" color="secondary" style={{ marginTop: 4 }}>{user?.email || ''}</ThemedText>
        </ThemedCard>
        </FadeIn>

        {/* Appearance Mode Picker */}
        <FadeIn direction="up" delay={100}>
        <ThemedText variant="label" color="tertiary" style={styles.sectionTitle}>Appearance</ThemedText>
        <ThemedCard style={styles.section} padding={0}>
          <SettingRow
            icon={
              mode === 'light' ? (
                <Ionicons name="sunny" size={20} color={colors.primary} />
              ) : mode === 'dark' ? (
                <Ionicons name="moon" size={20} color={colors.primary} />
              ) : (
                <Ionicons name="phone-portrait" size={20} color={colors.primary} />
              )
            }
            label="Theme"
            right={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ThemedText variant="bodySmall" color="secondary">
                  {mode === 'light' ? 'Light Theme' : mode === 'dark' ? 'Dark Theme' : 'System Default'}
                </ThemedText>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            }
            onPress={() => setShowThemeModal(true)}
          />
        </ThemedCard>
        </FadeIn>

        {/* Preferences Section */}
        <FadeIn direction="up" delay={150}>
        <ThemedText variant="label" color="tertiary" style={styles.sectionTitle}>Preferences</ThemedText>
        <ThemedCard style={styles.section} padding={0}>
          <SettingRow
            icon={<Ionicons name="notifications" size={20} color={colors.primary} />}
            label="Notifications"
            right={
              <Switch
                value={notifEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.borderStrong, true: colors.primary }}
                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
              />
            }
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon={<Ionicons name="cash" size={20} color={colors.success} />}
            label="Currency"
            right={<ThemedText variant="bodySmall" color="secondary">₹ INR</ThemedText>}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon={<Ionicons name="lock-closed" size={20} color={colors.warning} />}
            label="Change Password"
            right={<Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
            onPress={() => setShowPasswordModal(true)}
          />
        </ThemedCard>
        </FadeIn>

        {/* Support & Version */}
        <FadeIn direction="up" delay={200}>
        <ThemedText variant="label" color="tertiary" style={styles.sectionTitle}>General</ThemedText>
        <ThemedCard style={styles.section} padding={0}>
          <SettingRow
            icon={<Ionicons name="share-outline" size={20} color={colors.accent} />}
            label="Export Expenses (PDF)"
            right={<Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
            onPress={() => navigation.navigate('ExportExpenses')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon={<Ionicons name="information-circle" size={20} color={colors.primary} />}
            label="About"
            right={<ThemedText variant="bodySmall" color="secondary">Spendly v{packageJson.version || Constants.expoConfig?.version || '1.0.0'}</ThemedText>}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon={<Ionicons name="cloud-download" size={20} color={colors.primary} />}
            label="Check for Updates"
            right={<Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
            onPress={async () => {
              showToast('Checking for updates...', 'info', 2000, <Ionicons name="sync" size={20} color={colors.accent} />);
              try {
                const status = await getUpdateStatus();
                if (status.isOutdated) {
                  setUpdateMessage(status.message);
                  setUpdatePlatform(status.platform);
                  setUpdateApkLink(status.apkLink || '');
                  setShowUpdateModal(true);
                } else {
                  showToast(`Spendly is up to date (v${status.currentVersion})`, 'success', 3000);
                }
              } catch (err) {
                showToast('Could not reach update server.', 'error');
              }
            }}
          />
        </ThemedCard>
        </FadeIn>

        {/* Logout Button */}
        <FadeIn direction="up" delay={250}>
        <Pressable
          onPress={() => setShowLogoutModal(true)}
          style={({ pressed }) => [
            styles.logoutBtn,
            { backgroundColor: colors.dangerLight, borderColor: colors.danger },
            pressed && { opacity: 0.8 },
            WEB_STYLES.cursor,
          ]}
        >
          <View style={styles.logoutContent}>
            <Ionicons name="log-out" size={20} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
          </View>
        </Pressable>
        </FadeIn>

        <View style={{ height: 120 }} />
      </ScrollView>

      <ConfirmModal
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout? Your data will be preserved."
        confirmText="Logout"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        destructive
      />

      <EditProfileModal
        visible={showEditModal}
        user={user}
        onSave={handleSaveProfile}
        onCancel={() => setShowEditModal(false)}
      />

      <ChangePasswordModal
        visible={showPasswordModal}
        onSave={handleSavePassword}
        onCancel={() => setShowPasswordModal(false)}
      />

      <VersionUpdateModal
        visible={showUpdateModal}
        message={updateMessage}
        platform={updatePlatform}
        apkLink={updateApkLink}
        onCancel={() => setShowUpdateModal(false)}
      />

      <ThemeSelectionModal
        visible={showThemeModal}
        currentMode={mode}
        onSelect={setMode}
        onCancel={() => setShowThemeModal(false)}
      />
    </ThemedView>
  );
}

function ThemeSelectionModal({ visible, currentMode, onSelect, onCancel }) {
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

  const options = [
    { key: 'light', label: 'Light Theme', icon: 'sunny' },
    { key: 'dark', label: 'Dark Theme', icon: 'moon' },
    { key: 'system', label: 'System Default', icon: 'phone-portrait' },
  ];

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onCancel}>
      <Animated.View style={[modalStyles.backdrop, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <Animated.View style={[modalStyles.modal, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xl, transform: [{ scale: scaleAnim }] }]}>
          <ThemedText variant="h3" color="primary" style={modalStyles.title}>Choose Theme</ThemedText>
          
          <View style={modalStyles.optionsContainer}>
            {options.map((opt, idx) => {
              const isSelected = currentMode === opt.key;
              return (
                <React.Fragment key={opt.key}>
                  {idx > 0 && <View style={[modalStyles.divider, { backgroundColor: colors.border }]} />}
                  <Pressable
                    onPress={() => {
                      onSelect(opt.key);
                      onCancel();
                    }}
                    style={[modalStyles.row, isSelected && { backgroundColor: colors.pressed }, WEB_STYLES.cursor]}
                  >
                    <Ionicons name={opt.icon} size={20} color={isSelected ? colors.primary : colors.textSecondary} />
                    <ThemedText variant="body" color={isSelected ? 'primary' : 'secondary'} style={modalStyles.rowLabel}>
                      {opt.label}
                    </ThemedText>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </Pressable>
                </React.Fragment>
              );
            })}
          </View>

          <View style={modalStyles.footer}>
            <SecondaryButton title="Cancel" variant="muted" onPress={onCancel} style={{ flex: 1 }} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
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
    maxWidth: 340,
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
  title: { marginBottom: 16 },
  optionsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: {
    flex: 1,
    marginLeft: 12,
  },
  divider: {
    height: 1,
  },
  footer: {
    flexDirection: 'row',
  },
});

function SettingRow({ icon, label, right, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.settingRow, WEB_STYLES.cursor]}>
      <View style={styles.settingIconContainer}>{icon}</View>
      <ThemedText variant="body" color="primary" style={styles.settingLabel}>{label}</ThemedText>
      <View style={styles.settingRight}>{right}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    height: Platform.OS === 'web' ? '100%' : undefined,
  },
  pageTitle: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    paddingHorizontal: 24,
    marginBottom: 8,
    marginTop: 16,
  },
  profileCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
    paddingVertical: 28,
  },
  profileAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileInitials: {
    fontWeight: '800',
  },
  editProfileIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 10,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  settingIconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
  },
  settingRight: {},
  comingSoon: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
