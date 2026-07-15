import React, { useEffect, useCallback } from 'react';
import { StatusBar, View, StyleSheet, Platform, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const navigationRef = createNavigationContainerRef();
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

import { ToastProvider } from './app/components/ToastNotification';
import NavBar from './app/components/NavBar';

import LoginScreen from './app/screens/LoginScreen';
import HomeScreen from './app/screens/HomeScreen';
import DayDetailScreen from './app/screens/DayDetailScreen';
import FriendsScreen from './app/screens/FriendsScreen';
import FriendDetailScreen from './app/screens/FriendDetailScreen';
import StatsScreen from './app/screens/StatsScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import NotificationsScreen from './app/screens/NotificationsScreen';
import AIChatScreen from './app/screens/AIChatScreen';

import useAuthStore from './app/state/useAuthStore';
import useExpenseStore from './app/state/useExpenseStore';
import useFriendsStore from './app/state/useFriendsStore';
import useVersionCheck from './app/utils/useVersionCheck';
import VersionUpdateModal from './app/components/VersionUpdateModal';

// Suppress harmless warnings
LogBox.ignoreLogs(['Reanimated', 'fontFamily', 'InteractionManager']);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const FriendsStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent', flex: 1, height: Platform.OS === 'web' ? '100%' : undefined } }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="DayDetail" component={DayDetailScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    </HomeStack.Navigator>
  );
}

function FriendsStackScreen() {
  return (
    <FriendsStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent', flex: 1, height: Platform.OS === 'web' ? '100%' : undefined } }}>
      <FriendsStack.Screen name="FriendsMain" component={FriendsScreen} />
      <FriendsStack.Screen name="FriendDetail" component={FriendDetailScreen} />
    </FriendsStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <NavBar {...props} />}
      sceneContainerStyle={{ flex: 1, height: Platform.OS === 'web' ? '100%' : undefined }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Friends" component={FriendsStackScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const RootStack = createStackNavigator();
function AuthRootStack() {
  return (
    <RootStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { flex: 1, height: Platform.OS === 'web' ? '100%' : undefined }
      }}
    >
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen 
        name="AIChatScreen" 
        component={AIChatScreen} 
        options={{ animationEnabled: true }}
      />
    </RootStack.Navigator>
  );
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const expenses = useExpenseStore((s) => s.expenses);

  const [fontsLoaded, setFontsLoaded] = React.useState(false);
  const [updateModalVisible, setUpdateModalVisible] = React.useState(false);
  const [updateMessage, setUpdateMessage] = React.useState('');
  const [updatePlatform, setUpdatePlatform] = React.useState('android');
  const [updateApkLink, setUpdateApkLink] = React.useState('');

  // Trigger app version check
  useVersionCheck((message, platform, apkUrl) => {
    setUpdateMessage(message);
    setUpdatePlatform(platform);
    setUpdateApkLink(apkUrl || '');
    setUpdateModalVisible(true);
  });

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Inter_400Regular,
          Inter_500Medium,
          Inter_700Bold,
          Inter_800ExtraBold,
        });
      } catch (e) {
        // Fonts are optional — fallback to system
        console.log('Font loading skipped:', e.message);
      }
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  // Push Notifications Setup
  useEffect(() => {
    let receivedSubscription = null;
    let responseSubscription = null;

    async function setupNotifications() {
      if (Platform.OS === 'web') {
        return; // Push notifications are not supported/needed on web platform
      }

      const isExpoGo = Constants?.appOwnership === 'expo';
      if (isExpoGo) {
        return; // Silent bypass inside Expo Go to prevent library crash
      }

      let NotificationsModule;
      try {
        NotificationsModule = require('expo-notifications');
      } catch (e) {
        return; // Safe platform fallback
      }

      if (!NotificationsModule || !NotificationsModule.setNotificationHandler) {
        return; // Quiet bypass in unsupported environments (e.g. Expo Go / Web)
      }

      // Configure foreground handler (Requirement 7)
      NotificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Request permissions and fetch token (Requirement 1, 2, 3)
      const { registerForPushNotificationsAsync } = require('./app/utils/notificationService');
      const token = await registerForPushNotificationsAsync();
      if (token) {
        console.log("🎫 EXPO PUSH TOKEN READY FOR TESTING:", token);
      }

      // Listen for received messages in foreground (Requirement 8)
      receivedSubscription = NotificationsModule.addNotificationReceivedListener((notification) => {
        console.log("🔔 NOTIFICATION RECEIVED IN FOREGROUND:", JSON.stringify(notification, null, 2));
      });

      // Listen for notification taps/clicks (Requirement 8)
      responseSubscription = NotificationsModule.addNotificationResponseReceivedListener((response) => {
        console.log("👆 NOTIFICATION INTERACTED/CLICKED:", JSON.stringify(response, null, 2));
        try {
          if (navigationRef.isReady()) {
            navigationRef.navigate('Home', {
              screen: 'Notifications',
            });
          }
        } catch (err) {
          console.log("❌ Error handling notification tap routing:", err);
        }
      });
    }

    setupNotifications();

    return () => {
      if (receivedSubscription) receivedSubscription.remove();
      if (responseSubscription) responseSubscription.remove();
    };
  }, []);

  // Initialize Auth Store on mount
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  // Set Install Date and sync data from server when authenticated
  useEffect(() => {
    async function syncData() {
      if (isAuthenticated) {
        const user = useAuthStore.getState().user;
        if (user && user.createdAt) {
          await AsyncStorage.setItem('INSTALL_DATE', user.createdAt);
          useExpenseStore.getState().setInstallDate(user.createdAt);
        } else {
          let dateStr = await AsyncStorage.getItem('INSTALL_DATE');
          if (!dateStr) {
            dateStr = new Date().toISOString();
            await AsyncStorage.setItem('INSTALL_DATE', dateStr);
          }
          useExpenseStore.getState().setInstallDate(dateStr);
        }
      } else {
        let dateStr = await AsyncStorage.getItem('INSTALL_DATE');
        if (!dateStr) {
          dateStr = new Date().toISOString();
          await AsyncStorage.setItem('INSTALL_DATE', dateStr);
        }
        useExpenseStore.getState().setInstallDate(dateStr);
      }

      useExpenseStore.getState().syncNotifications();

      if (isAuthenticated) {
        // Load data directly from backend database via API
        useExpenseStore.getState().loadExpenses();
        useExpenseStore.getState().loadDayCompletions();
        useFriendsStore.getState().loadFriends();

        // Register push token with the backend database
        try {
          const { registerForPushNotificationsAsync } = require('./app/utils/notificationService');
          const token = await registerForPushNotificationsAsync();
          if (token) {
            await useAuthStore.getState().registerPushToken(token);
            console.log("🎫 Registered push token with backend successfully");
          }
        } catch (pushErr) {
          console.log("❌ Error registering push token with backend:", pushErr);
        }
      }
    }
    syncData();
  }, [isAuthenticated]);

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={Platform.OS === 'web' ? { height: '100vh', width: '100vw', overflow: 'hidden' } : { flex: 1 }}>
        <ToastProvider>
          <NavigationContainer ref={navigationRef}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0C29" translucent />
            {isAuthenticated ? <AuthRootStack /> : <LoginScreen />}
          </NavigationContainer>
          <VersionUpdateModal 
            visible={updateModalVisible} 
            message={updateMessage} 
            platform={updatePlatform} 
            apkLink={updateApkLink}
            onCancel={() => setUpdateModalVisible(false)} 
          />
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0F0C29',
  },
});
