import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Switch, Platform, Linking, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LiquidBackground from '../components/LiquidBackground';
import GlassCard from '../components/GlassCard';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/ToastNotification';
import useAuthStore from '../state/useAuthStore';
import useExpenseStore from '../state/useExpenseStore';
import { COLORS, WEB_STYLES } from '../styles/theme';
import { getScreenPaddingTop } from '../utils/platformUtils';
import { toDateKey } from '../utils/dateUtils';
import { checkNotificationPermissions, requestNotificationPermissions, cancelTodayReminder } from '../utils/notificationService';
import { Ionicons } from '@expo/vector-icons';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import VersionUpdateModal from '../components/VersionUpdateModal';
import { getUpdateStatus } from '../utils/useVersionCheck';
import Constants from 'expo-constants';
import packageJson from '../../package.json';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
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

  // Sync initial switch state strictly with native system permission
  useEffect(() => {
    async function syncToggleState() {
      const isGranted = await checkNotificationPermissions();
      setNotifEnabled(isGranted);
      
      if (isGranted) {
        await AsyncStorage.setItem('USER_NOTIF_PREF', 'enabled');
      } else {
        await AsyncStorage.setItem('USER_NOTIF_PREF', 'disabled');
      }
    }

    // Run on initial mount
    syncToggleState();

    // Dynamically check system settings when the user returns/focuses back to the app from phone Settings
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
        showToast('Notifications enabled!', 'success', 3000, <Ionicons name="sparkles-outline" size={20} color="#10B981" />);
        
        // Schedule if today is incomplete
        const todayKey = toDateKey(new Date());
        const isTodayComplete = dayCompletions[todayKey] === true;
        const { scheduleTodayReminderIfNeeded } = require('../utils/notificationService');
        await scheduleTodayReminderIfNeeded(isTodayComplete);
      } else {
        showToast('System blocked! Redirecting to settings...', 'warning', 3000, <Ionicons name="warning-outline" size={20} color="#F59E0B" />);
        setTimeout(() => {
          Linking.openSettings();
        }, 1000);
      }
    } else {
      // To keep perfectly synced with OS, redirect to OS settings to disable
      showToast('Redirecting to settings to disable...', 'info', 3000, <Ionicons name="settings-outline" size={20} color="#A78BFA" />);
      setTimeout(() => {
        Linking.openSettings();
      }, 1000);
    }
  };

  const handleLogout = () => { logout(); setShowLogoutModal(false); };

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
        showToast('Password updated successfully!', 'success', 3000, <Ionicons name="lock-closed-outline" size={20} color="#10B981" />);
      }
    } catch (error) {
      showToast('Failed to change password', 'error');
    }
  };

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <LiquidBackground>
      <View style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
        <Text style={styles.pageTitle}>Settings</Text>

        <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <GlassCard variant="hero" style={styles.profileCard}>
            <Pressable
              onPress={() => setShowEditModal(true)}
              style={({ pressed }) => [
                styles.editProfileIcon,
                pressed && { opacity: 0.7 },
                WEB_STYLES.cursor
              ]}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.textSecondary} />
            </Pressable>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>{initials}</Text>
            </View>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </GlassCard>

          {/* Settings sections */}
          <GlassCard style={styles.section}>
            <SettingRow
              icon="🔔"
              label="Notifications"
              right={
                <Switch value={notifEnabled} onValueChange={handleToggleNotifications} trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(124,58,237,0.5)' }} thumbColor={notifEnabled ? '#7C3AED' : '#555'} />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              icon="💱"
              label="Currency"
              right={<Text style={styles.valueText}>₹ INR</Text>}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="🔑"
              label="Change Password"
              right={<Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />}
              onPress={() => setShowPasswordModal(true)}
            />
          </GlassCard>

          <GlassCard style={styles.section}>
            <Pressable onPress={() => showToast('Coming soon!', 'info', 3000, <Ionicons name="rocket-outline" size={20} color="#A78BFA" />)} style={[styles.settingRow, WEB_STYLES.cursor]}>
              <View style={styles.settingIconContainer}>
                <Text style={{ fontSize: 20 }}>📤</Text>
              </View>
              <Text style={styles.settingLabel}>Export Data (CSV)</Text>
              <Text style={styles.comingSoon}>Coming soon</Text>
            </Pressable>
            <View style={styles.divider} />
            <SettingRow
              icon={<Ionicons name="information-circle-outline" size={20} color="#10B981" />}
              label="About"
              right={<Text style={styles.valueText}>Spendly v{packageJson.version || Constants.expoConfig?.version || '1.0.0'}</Text>}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<Ionicons name="cloud-download-outline" size={20} color="#3B82F6" />}
              label="Check for Updates"
              right={<Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />}
              onPress={async () => {
                showToast('Checking for updates...', 'info', 2000, <Ionicons name="sync-outline" size={20} color="#A78BFA" />);
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
          </GlassCard>

          {/* Logout */}
          <Pressable onPress={() => setShowLogoutModal(true)} style={[styles.logoutBtn, WEB_STYLES.cursor]}>
            <View style={styles.logoutContent}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.negative} />
              <Text style={styles.logoutText}>Logout</Text>
            </View>
          </Pressable>

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
      </View>
    </LiquidBackground>
  );
}

function SettingRow({ icon, label, right, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.settingRow, WEB_STYLES.cursor]}>
      <View style={styles.settingIconContainer}>
        {typeof icon === 'string' ? (
          <Text style={{ fontSize: 20 }}>{icon}</Text>
        ) : (
          icon
        )}
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingRight}>{right}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, alignSelf: 'center', width: '100%', height: Platform.OS === 'web' ? '100%' : undefined },
  pageTitle: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800', paddingHorizontal: 20, marginBottom: 16 },
  profileCard: { marginHorizontal: 16, marginBottom: 16, alignItems: 'center', paddingVertical: 28 },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(124,58,237,0.3)', borderWidth: 2, borderColor: 'rgba(124,58,237,0.5)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  profileInitials: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
  profileName: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' },
  profileEmail: { color: COLORS.textMuted, fontSize: 14, marginTop: 4 },
  editProfileIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  section: { marginHorizontal: 16, marginBottom: 16, padding: 0 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, gap: 12 },
  settingIconContainer: { width: 24, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  settingRight: {},
  valueText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '500' },
  comingSoon: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500', fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 16 },
  logoutBtn: { marginHorizontal: 16, marginTop: 8, backgroundColor: 'rgba(244,63,94,0.12)', borderColor: 'rgba(244,63,94,0.3)', borderWidth: 1.5, borderRadius: 20, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  logoutContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoutText: { color: COLORS.negative, fontSize: 16, fontWeight: '700' },
});
