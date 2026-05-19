import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiClient } from './apiClient';

/**
 * Compare two semantic versions (e.g., '1.2.0' and '1.0.5')
 * Returns:
 *  1 if current > required
 * -1 if current < required
 *  0 if current === required
 */
function compareVersions(current, required) {
  const c = (current || '1.0.0').split('.').map(num => Number(num) || 0);
  const r = (required || '1.0.0').split('.').map(num => Number(num) || 0);

  for (let i = 0; i < 3; i++) {
    const cVal = c[i] || 0;
    const rVal = r[i] || 0;
    if (cVal > rVal) return 1;
    if (cVal < rVal) return -1;
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
        const status = await getUpdateStatus();
        if (status.isOutdated && onUpdateAvailable) {
          onUpdateAvailable(status.message, status.platform, status.apkLink);
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
