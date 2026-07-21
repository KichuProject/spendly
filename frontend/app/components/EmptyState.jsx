import React from 'react';
import { View, StyleSheet } from 'react-native';
import ThemedCard from './common/ThemedCard';
import ThemedText from './common/ThemedText';
import PrimaryButton from './buttons/PrimaryButton';
import CategoryIcon from './CategoryIcon';
import { useTheme } from '../styles/ThemeContext';
import ScaleIn from './animations/ScaleIn';

export default function EmptyState({ emoji, icon, title, message, buttonTitle, onButtonPress, style }) {
  const { colors, radius } = useTheme();

  return (
    <ScaleIn delay={100}>
    <View style={[styles.wrapper, style]}>
      <ThemedCard style={styles.card} elevated>
        {icon ? (
          <View style={styles.iconContainer}>{icon}</View>
        ) : (
          <View style={styles.iconContainer}>
            <CategoryIcon emoji={emoji || '💸'} size={48} />
          </View>
        )}
        <ThemedText variant="h3" color="primary" style={styles.title}>{title || 'Nothing here yet'}</ThemedText>
        <ThemedText variant="bodySmall" color="secondary" style={styles.message}>{message || 'Start adding items to see them here!'}</ThemedText>
        {buttonTitle && (
          <PrimaryButton title={buttonTitle} onPress={onButtonPress} style={styles.button} />
        )}
      </ThemedCard>
    </View>
    </ScaleIn>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: 24, alignItems: 'center', width: '100%' },
  card: { alignItems: 'center', padding: 32, width: '100%' },
  emoji: { fontSize: 48, marginBottom: 16 },
  iconContainer: { marginBottom: 16 },
  title: { marginBottom: 8, textAlign: 'center' },
  message: { textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  button: { marginTop: 4, minWidth: 160 },
});
