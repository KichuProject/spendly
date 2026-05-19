import { Platform } from 'react-native';
import { toDateKey } from './dateUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

let Notifications = null;
const isExpoGo = Constants?.appOwnership === 'expo';
if (Platform.OS !== 'web' && !isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    // Silent catch - expo-notifications is skipped on simulator / Expo Go SDK 53+
  }
}

const PUSH_TOKEN_KEY = 'spendly_push_token';
const LAST_PUSH_SENT_DATE_KEY = 'spendly_last_push_sent_date';

/**
 * 1. PUSH TOKEN REGISTRATION
 * Register the device with Expo, request system permissions,
 * and obtain the device's unique Expo Push Token.
 * 
 * @returns {Promise<string|null>} The registered Expo Push Token or null.
 */
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web' || !Notifications) {
    return null;
  }

  try {
    // Check permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log("🔔 Failed to secure permissions for Expo Push Token!");
      return null;
    }

    // Android Max Channel configurations for prominent push popups
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reminders', {
        name: 'Daily Reminders 💰',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C3AED',
      });
    }

    // Get current Expo Project ID from app configuration (Required in Expo v55.0.0)
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log("🔔 WARNING: EAS projectId not discovered. Push token request may fail.");
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const pushToken = tokenData.data;

    // Cache the push token locally in AsyncStorage
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, pushToken);

    console.log("🟢 SUCCESS: Device registered for Expo Push!");
    console.log("🎟️ Expo Push Token:", pushToken);

    return pushToken;
  } catch (error) {
    console.log("🔔 Failed to complete push registration:", error);
    return null;
  }
}

/**
 * 2. MODULAR PUSH SENDER (BACKEND READY)
 * Sends a push notification payload to Expo's Push API endpoint.
 * This function is fully modular and can be copy-pasted straight
 * into a Node.js backend cron job or Firebase Cloud Function.
 * 
 * Endpoint: https://exp.host/--/api/v2/push/send
 * 
 * @param {string} expoPushToken The target recipient's Expo push token.
 * @param {string} title The notification title.
 * @param {string} body The notification body.
 * @param {object} data Optional custom payload data.
 * @returns {Promise<boolean>} True if accepted by Expo server.
 */
export async function sendPushNotification(expoPushToken, title, body, data = {}) {
  if (!expoPushToken) {
    console.log("🔔 Aborting push send: No push token specified.");
    return false;
  }

  const payload = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("📲 Expo Push Send Response:", response.status, result);
    return response.ok;
  } catch (error) {
    console.log("🔔 Push API Delivery request failed:", error);
    return false;
  }
}

/**
 * 3. SIMULATED DAILY SCHEDULING ENGINE
 * Runs in-app checks simulating backend trigger events.
 * Evaluates target parameters (incomplete day status, local time limit past 10 PM)
 * and dispatches a live push notification to the device itself.
 * Uses AsyncStorage to prevent duplicate alerts on the same day.
 */
export async function checkAndTriggerReminder() {
  if (Platform.OS === 'web' || !Notifications) return;

  try {
    // Check notification settings
    const userPref = await AsyncStorage.getItem('USER_NOTIF_PREF');
    if (userPref === 'disabled') {
      return;
    }

    // Retrieve cached push token, or register dynamically if missing
    let pushToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (!pushToken) {
      pushToken = await registerForPushNotificationsAsync();
      if (!pushToken) return;
    }

    // Get today's completion state from Zustand
    const useExpenseStore = require('../state/useExpenseStore').default;
    const { dayCompletions } = useExpenseStore.getState();
    const todayKey = toDateKey(new Date());
    const isTodayComplete = dayCompletions[todayKey] === true;

    // Trigger rule: Do not notify if today is already complete
    if (isTodayComplete) {
      console.log(`✅ Push reminder skipped: today (${todayKey}) is marked complete.`);
      return;
    }

    // Check if current local time is past 10:00 PM
    const now = new Date();
    const isPast10PM = now.getHours() >= 22;

    if (!isPast10PM) {
      console.log(`🕒 Today (${todayKey}) is incomplete but it's not 10 PM yet.`);
      return;
    }

    // Duplicate check: Verify if we already dispatched a push today
    const lastSentDate = await AsyncStorage.getItem(LAST_PUSH_SENT_DATE_KEY);
    if (lastSentDate === todayKey) {
      console.log(`🛡️ Push reminder already sent today (${todayKey}). Duplicate blocked.`);
      return;
    }

    // Send push notification via Expo Push Endpoint
    console.log("🚀 DISPATCHING PUSH NOTIFICATION...");
    const sent = await sendPushNotification(
      pushToken,
      "Log Complete? 💎",
      "Hey! You forgot to mark today as complete. Review your expenses and lock in today's tracker!",
      { dateKey: todayKey }
    );

    if (sent) {
      // Record sent timestamp key
      await AsyncStorage.setItem(LAST_PUSH_SENT_DATE_KEY, todayKey);
      console.log(`✅ Push reminder triggered successfully for today (${todayKey})!`);
    }
  } catch (error) {
    console.log("🔔 Error inside daily push reminder check:", error);
  }
}

/**
 * Request system notifications permissions from the user.
 * @returns {Promise<boolean>} True if permissions are granted.
 */
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web' || !Notifications) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    if (e.message && (e.message.includes('FirebaseApp') || e.message.includes('firebase'))) {
      console.log("⚠️ Firebase not initialized. Bypassing permission request check for development.");
      return true;
    }
    return false;
  }
}

/**
 * Check system notifications permissions status.
 * @returns {Promise<boolean>}
 */
export async function checkNotificationPermissions() {
  if (Platform.OS === 'web' || !Notifications) return false;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    if (e.message && (e.message.includes('FirebaseApp') || e.message.includes('firebase'))) {
      return true;
    }
    return false;
  }
}

/**
 * Sync notifications - registers token and runs reminder checks.
 * Backwards compatible interface with screens.
 */
export async function syncNotifications() {
  // Ensure the device is registered
  await registerForPushNotificationsAsync();
  // Evaluate and push if needed
  await checkAndTriggerReminder();
}

/**
 * Reset push reminder registry for today.
 * Backwards compatible interface.
 */
export async function cancelTodayReminder() {
  await AsyncStorage.removeItem(LAST_PUSH_SENT_DATE_KEY);
  console.log("🗑️ Push reminder registry reset.");
}

/**
 * Clear all push configs and logs.
 * Backwards compatible interface.
 */
export async function cancelAllReminders() {
  await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
  await AsyncStorage.removeItem(LAST_PUSH_SENT_DATE_KEY);
  console.log("🗑️ Push config and logs cleared.");
}

/**
 * Trigger daily reminder check immediately.
 * Backwards compatible interface.
 */
export async function scheduleTodayReminderIfNeeded(isComplete) {
  await checkAndTriggerReminder();
}
