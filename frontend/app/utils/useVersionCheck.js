import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';

/**
 * Compare two semantic versions (e.g., '1.2.0' and '1.0.5')
 * Returns:
 *  1 if current > required
 * -1 if current < required
 *  0 if current === required
 */
function compareVersions(current, required) {
  const c = current.split('.').map(Number);
  const r = required.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (c[i] > r[i]) return 1;
    if (c[i] < r[i]) return -1;
  }
  return 0;
}

/**
 * Checks the backend for update status
 * Returns { isOutdated: boolean, message: string, platform: string, latestVersion: string, currentVersion: string }
 */
export async function getUpdateStatus() {
  const currentVersion = Constants.expoConfig?.version || '1.0.0';
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';

  const response = await apiClient.getAppVersion(platform);
  
  if (response && response.success && response.data) {
    const { latestVersion, minVersion, message, apkLink } = response.data;
    const isBelowMin = compareVersions(currentVersion, minVersion) === -1;
    const isBelowLatest = compareVersions(currentVersion, latestVersion) === -1;

    return {
      isOutdated: isBelowMin || isBelowLatest,
      message: message || 'A new update is available for Spendly!',
      platform,
      latestVersion,
      currentVersion,
      apkLink: apkLink || '',
    };
  }
  
  throw new Error('Failed to get valid version payload from backend');
}

let hasCheckedVersion = false;

/**
 * Auto-checks version on app boot
 */
export default function useVersionCheck(onUpdateAvailable = null) {
  useEffect(() => {
    if (hasCheckedVersion) {
      return;
    }

    async function checkVersionOnBoot() {
      try {
        hasCheckedVersion = true;
        const lastCheck = await AsyncStorage.getItem('last_version_check');
        const now = new Date().toDateString();
        
        // Skip if already checked today (unless in dev mode for testing)
        if (lastCheck === now && !__DEV__) {
          return;
        }

        const status = await getUpdateStatus();
        if (status.isOutdated && onUpdateAvailable) {
          onUpdateAvailable(status.message, status.platform, status.apkLink);
        } else if (!status.isOutdated) {
          await AsyncStorage.setItem('last_version_check', now);
        }
      } catch (error) {
        console.log("Silent startup version check skipped:", error.message);
      }
    }

    const timer = setTimeout(() => {
      checkVersionOnBoot();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
}
