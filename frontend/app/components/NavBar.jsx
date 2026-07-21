import React, { useRef } from 'react';
import { View, Pressable, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../styles/ThemeContext';
import { WEB_STYLES } from '../styles/theme';

const TABS = [
  { key: 'Home', icon: 'home', iconOutline: 'home', label: 'Home', colorName: 'primary' },
  { key: 'Friends', icon: 'people', iconOutline: 'people', label: 'Friends', colorName: 'success' },
  { key: 'Stats', icon: 'stats-chart', iconOutline: 'stats-chart', label: 'Stats', colorName: 'accent' },
  { key: 'Settings', icon: 'settings', iconOutline: 'settings', label: 'Settings', colorName: 'warning' },
];

export default function NavBar({ state, navigation }) {
  const { colors, radius, elevation } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={[
        styles.container,
        {
          backgroundColor: colors.tabBg,
          borderColor: colors.tabBorder,
          borderRadius: radius.xxl,
        },
        elevation.lg,
      ]}>
        {TABS.map((tab, index) => {
          const isActive = state.index === index;
          return (
            <React.Fragment key={tab.key}>
              <TabItem
                tab={tab}
                isActive={isActive}
                onPress={() => navigation.navigate(tab.key)}
              />

              {index === 1 && (
                <AIChatButton onPress={() => navigation.navigate('AIChatScreen')} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

function AIChatButton({ onPress }) {
  const { colors, elevation } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.aiButtonWrapper]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true, damping: 18, stiffness: 400 }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 400 }).start()}
        style={[
          styles.aiButton,
          { backgroundColor: colors.accent },
          elevation.md,
          WEB_STYLES.cursor,
          WEB_STYLES.noSelect,
        ]}
      >
        <MaterialCommunityIcons name="robot" size={22} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}

function TabItem({ tab, isActive, onPress }) {
  const { colors, radius } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true, damping: 18, stiffness: 400 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 400 }).start();
  };

  const tabColor = colors[tab.colorName] || colors.primary;

  return (
    <Animated.View style={[
      styles.tabWrapper,
      {
        transform: [{ scale: scaleAnim }],
        flex: isActive ? 1.6 : 1,
      },
    ]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.tab,
          {
            borderRadius: radius.xl,
            backgroundColor: isActive ? tabColor + '20' : 'transparent',
          },
          WEB_STYLES.cursor,
          WEB_STYLES.noSelect,
        ]}
      >
        <Ionicons
          name={isActive ? tab.icon : tab.iconOutline}
          size={22}
          color={isActive ? tabColor : tabColor + 'B0'}
        />
        {isActive && (
          <Text
            style={[styles.tabLabel, { color: tabColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {tab.label}
          </Text>
        )}
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
    borderWidth: 1,
    padding: 6,
    gap: 4,
    maxWidth: 400,
    width: '100%',
  },
  tabWrapper: {
    // flex set dynamically
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 6,
    overflow: 'hidden',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  aiButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  aiButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
