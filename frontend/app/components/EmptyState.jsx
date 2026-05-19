import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { COLORS, SPACING } from '../styles/theme';

export default function EmptyState({ emoji, icon, title, message, buttonTitle, onButtonPress, style }) {
  return (
    <View style={[styles.wrapper, style]}>
      <GlassCard style={styles.card}>
        {icon ? (
          <View style={styles.iconContainer}>{icon}</View>
        ) : (
          <Text style={styles.emoji}>{emoji || '💸'}</Text>
        )}
        <Text style={styles.title}>{title || 'Nothing here yet'}</Text>
        <Text style={styles.message}>{message || 'Start adding items to see them here!'}</Text>
        {buttonTitle && (
          <GlassButton title={buttonTitle} onPress={onButtonPress} variant="primary" style={styles.button} />
        )}
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: 24, alignItems: 'center' },
  card: { alignItems: 'center', padding: 32, width: '100%' },
  emoji: { fontSize: 48, marginBottom: 16 },
  iconContainer: { marginBottom: 16 },
  title: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  message: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  button: { marginTop: 4 },
});
