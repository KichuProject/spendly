import { Platform, Dimensions } from 'react-native';

export function isWeb() {
  return Platform.OS === 'web';
}

export function isIOS() {
  return Platform.OS === 'ios';
}

export function isAndroid() {
  return Platform.OS === 'android';
}

export function getMaxWidth() {
  if (isWeb()) return 480;
  return undefined;
}

export function getWebContainerStyle() {
  if (!isWeb()) return {};
  return {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  };
}

export function getScreenWidth() {
  return Dimensions.get('window').width;
}

export function getScreenHeight() {
  return Dimensions.get('window').height;
}

export function selectPlatform({ ios, android, web, defaultVal }) {
  if (isIOS() && ios !== undefined) return ios;
  if (isAndroid() && android !== undefined) return android;
  if (isWeb() && web !== undefined) return web;
  return defaultVal;
}

/**
 * Returns dynamic paddingTop for screen containers.
 * On native: uses safe area insets (pass insets.top).
 * On web: uses a smaller fixed padding since there's no notch.
 */
export function getScreenPaddingTop(insetsTop = 0) {
  if (isWeb()) return 24;
  // Ensure at least the original 50px on mobile, but respect larger notches
  return Math.max(insetsTop + 12, 50);
}

/**
 * Returns the appropriate container width, clamped for
 * flexible web layout while staying full-width on mobile.
 */
export function getFlexibleContainerStyle() {
  if (!isWeb()) {
    return { flex: 1 };
  }
  return {
    flex: 1,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  };
}

/**
 * Returns web-specific modal overlay style for full viewport coverage.
 */
export function getModalOverlayStyle() {
  if (!isWeb()) return {};
  return {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };
}
