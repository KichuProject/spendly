import React, { useRef } from 'react';
import { View, Pressable, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SHADOWS, SPACING, WEB_STYLES } from '../styles/theme';
import CategoryIcon from './CategoryIcon';

const TABS = [
  { key: 'Home', icon: '🏠', label: 'Home' },
  { key: 'Friends', icon: '👥', label: 'Friends' },
  { key: 'Stats', icon: '📊', label: 'Stats' },
  { key: 'Settings', icon: '⚙️', label: 'Settings' },
];

export default function NavBar({ state, navigation }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Glass background */}
        <View style={styles.glassBackground} />
        {TABS.map((tab, index) => {
          const isActive = state.index === index;
          return (
            <TabItem
              key={tab.key}
              tab={tab}
              isActive={isActive}
              onPress={() => navigation.navigate(tab.key)}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabItem({ tab, isActive, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };

  return (
    <Animated.View style={[styles.tabWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.tab, isActive && styles.tabActive, WEB_STYLES.cursor, WEB_STYLES.noSelect]}
      >
        {isActive && (
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
          />
        )}
        <CategoryIcon
          emoji={tab.icon}
          size={18}
          color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}
          disableOverride
          style={[styles.tabIcon, isActive && styles.tabIconActive]}
        />
        {isActive && <Text style={styles.tabLabel}>{tab.label}</Text>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    bottom: Platform.OS === 'web' ? 12 : 24,
    ...Platform.select({
      web: { left: 0, right: 0, paddingHorizontal: 16 },
      default: { left: 16, right: 16 },
    }),
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 6,
    gap: 4,
    ...SHADOWS.large,
    maxWidth: 400,
    width: '100%',
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    backgroundColor: 'rgba(15,12,41,0.85)',
  },
  tabWrapper: {
    flex: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    gap: 6,
    overflow: 'hidden',
  },
  tabActive: {
    // gradient fills this
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
    fontSize: 18,
  },
  tabLabel: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
});
