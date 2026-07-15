import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, WEB_STYLES, GRADIENTS } from '../styles/theme';
import useChatStore from '../state/useChatStore';

const TRANSACTION_THEMES = [
  { border: 'rgba(124, 58, 237, 0.45)', text: '#A78BFA', icon: '#8B5CF6' }, // Purple
  { border: 'rgba(16, 185, 129, 0.45)', text: '#34D399', icon: '#10B981' }, // Emerald/Green
  { border: 'rgba(244, 63, 94, 0.45)',  text: '#FB7185', icon: '#F43F5E' }, // Rose/Red-Pink
  { border: 'rgba(6, 182, 212, 0.45)',  text: '#22D3EE', icon: '#06B6D4' }, // Cyan
  { border: 'rgba(245, 158, 11, 0.45)',  text: '#FBBF24', icon: '#F59E0B' }, // Amber/Yellow
];

export default function ConfirmationCard({ onConfirm, onCancel }) {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="playlist-check" size={28} color="#7C3AED" />
        <Text style={styles.title}>Confirm Transactions</Text>
      </View>
      
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {pendingTransactions.map((tx, index) => {
          const theme = TRANSACTION_THEMES[index % TRANSACTION_THEMES.length];
          return (
            <View key={index} style={[styles.transactionCard, { borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="receipt" size={16} color={theme.icon} />
                <Text style={[styles.cardIndex, { color: theme.text }]}>Transaction #{index + 1}</Text>
              </View>

            <View style={styles.fieldRow}>
              <Text style={styles.label}>Amount (₹)</Text>
              <TextInput 
                style={styles.input}
                value={String(tx.amount || '')}
                keyboardType="numeric"
                onChangeText={(val) => updatePendingTransaction(index, { ...tx, amount: val })}
                placeholder="0.00"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.label}>Category</Text>
              <TextInput 
                style={styles.input}
                value={tx.category || ''}
                onChangeText={(val) => updatePendingTransaction(index, { ...tx, category: val })}
                placeholder="Category"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.label}>Description</Text>
              <TextInput 
                style={styles.input}
                value={tx.description || ''}
                onChangeText={(val) => updatePendingTransaction(index, { ...tx, description: val })}
                placeholder="Description"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.label}>Date</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{tx.date ? String(tx.date) : 'Today'}</Text>
              </View>
            </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.buttonRow}>
        <Pressable onPress={onCancel} disabled={loading} style={[styles.cancelButton, WEB_STYLES.cursor]}>
          <Text style={styles.cancelText}>CANCEL</Text>
        </Pressable>
        <Pressable onPress={handleConfirm} disabled={loading} style={[styles.confirmButtonWrapper, WEB_STYLES.cursor]}>
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmText}>{loading ? 'SAVING...' : 'CONFIRM'}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 12, 41, 0.98)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.3)',
    ...SHADOWS.glow('#7C3AED'),
    maxHeight: '65%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  scrollArea: {
    marginBottom: 20,
  },
  transactionCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 8,
  },
  cardIndex: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
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
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    width: 95, // Fixed width guarantees text stays on 1 line
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: COLORS.textPrimary,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flex: 1, // Fills remaining space
  },
  readOnlyInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flex: 1, // Fills remaining space
    justifyContent: 'center',
  },
  readOnlyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  confirmButtonWrapper: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
