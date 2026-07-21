import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Platform, ScrollView, Modal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../styles/ThemeContext';
import ThemedText from './common/ThemedText';
import PrimaryButton from './buttons/PrimaryButton';
import SecondaryButton from './buttons/SecondaryButton';
import useChatStore from '../state/useChatStore';
import { WEB_STYLES } from '../styles/theme';
import { FadeInStagger } from './animations/FadeIn';

const TRANSACTION_THEMES = [
  { border: 'rgba(124, 58, 237, 0.45)', text: '#A78BFA', icon: '#8B5CF6' }, // Purple
  { border: 'rgba(16, 185, 129, 0.45)', text: '#34D399', icon: '#10B981' }, // Emerald/Green
  { border: 'rgba(244, 63, 94, 0.45)',  text: '#FB7185', icon: '#F43F5E' }, // Rose/Red-Pink
  { border: 'rgba(6, 182, 212, 0.45)',  text: '#22D3EE', icon: '#06B6D4' }, // Cyan
  { border: 'rgba(245, 158, 11, 0.45)',  text: '#FBBF24', icon: '#F59E0B' }, // Amber/Yellow
];

export default function ConfirmationCard({ visible, onConfirm, onCancel }) {
  const { colors, radius, elevation } = useTheme();
  const pendingTransactions = useChatStore(s => s.pendingTransactions);
  const updatePendingTransaction = useChatStore(s => s.updatePendingTransaction);

  const [loading, setLoading] = useState(false);

  if (!pendingTransactions || pendingTransactions.length === 0) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dimArea} onPress={onCancel} />
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <MaterialCommunityIcons name="playlist-check" size={28} color={colors.primary} />
            <ThemedText variant="h2" color="primary" style={styles.title}>Confirm Transactions</ThemedText>
          </View>
          
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <FadeInStagger
              items={pendingTransactions}
              renderItem={(tx, index) => {
                const themeColor = TRANSACTION_THEMES[index % TRANSACTION_THEMES.length];
                return (
                  <View style={[styles.transactionCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                    <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                      <MaterialCommunityIcons name="receipt" size={16} color={themeColor.icon} />
                      <ThemedText variant="caption" color="secondary" style={[styles.cardIndex, { color: themeColor.text }]}>
                        Transaction #{index + 1}
                      </ThemedText>
                    </View>

                    <View style={styles.fieldRow}>
                      <ThemedText variant="body" color="secondary" style={styles.label}>Amount (₹)</ThemedText>
                      <TextInput 
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                        value={String(tx.amount || '')}
                        keyboardType="numeric"
                        onChangeText={(val) => updatePendingTransaction(index, { ...tx, amount: val })}
                        placeholder="0.00"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>

                    <View style={styles.fieldRow}>
                      <ThemedText variant="body" color="secondary" style={styles.label}>Category</ThemedText>
                      <TextInput 
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                        value={tx.category || ''}
                        onChangeText={(val) => updatePendingTransaction(index, { ...tx, category: val })}
                        placeholder="Category"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>

                    <View style={styles.fieldRow}>
                      <ThemedText variant="body" color="secondary" style={styles.label}>Description</ThemedText>
                      <TextInput 
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                        value={tx.description || ''}
                        onChangeText={(val) => updatePendingTransaction(index, { ...tx, description: val })}
                        placeholder="Description"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>

                    <View style={styles.fieldRow}>
                      <ThemedText variant="body" color="secondary" style={styles.label}>Date</ThemedText>
                      <View style={[styles.readOnlyInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <ThemedText variant="body" color="secondary">{tx.date ? String(tx.date) : 'Today'}</ThemedText>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </ScrollView>

          <View style={styles.buttonRow}>
            <SecondaryButton
              title="Cancel"
              onPress={onCancel}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              title={loading ? 'Saving...' : 'Confirm'}
              onPress={handleConfirm}
              disabled={loading}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
      default: {},
    }),
  },
  dimArea: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '80%',
    ...Platform.select({
      web: { maxWidth: 480, width: '100%', alignSelf: 'center', boxShadow: '0 -8px 32px rgba(0,0,0,0.12)' },
      default: {},
    }),
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  scrollArea: {
    marginBottom: 20,
    maxHeight: Platform.OS === 'web' ? 400 : 250,
  },
  transactionCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  cardIndex: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  label: {
    fontWeight: '600',
    width: 95, // Fixed width guarantees text stays on 1 line
  },
  input: {
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1, // Fills remaining space
  },
  readOnlyInput: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1, // Fills remaining space
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
});
