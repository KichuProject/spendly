import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './common/ThemedText';
import ThemedInput from './common/ThemedInput';
import PrimaryButton from './buttons/PrimaryButton';
import { useTheme } from '../styles/ThemeContext';
import { WEB_STYLES } from '../styles/theme';

export default function AddFriendSheet({ visible, onClose, onSave }) {
  const { colors, radius } = useTheme();
  const [name, setName] = useState('');

  useEffect(() => {
    if (visible) {
      setName('');
    }
  }, [visible]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName('');
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <KeyboardAvoidingView 
        style={styles.backdrop} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.dimArea} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <ThemedText variant="h2" color="primary">Add Friend</ThemedText>
              <Ionicons name="person-add-outline" size={22} color={colors.primary} />
            </View>
            <Pressable onPress={onClose} style={[WEB_STYLES.cursor]}>
              <Ionicons name="close" size={24} color={colors.textSecondary} style={{ padding: 4 }} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <ThemedText variant="bodySmall" color="secondary" style={styles.fieldLabel}>What is your friend's name?</ThemedText>
            <ThemedInput
              placeholder="e.g. Rahul, Priya, Alex..."
              value={name}
              onChangeText={setName}
              icon={<Ionicons name="person" size={20} color={colors.primary} />}
              autoFocus
            />
            <View style={{ height: 16 }} />
          </View>

          <PrimaryButton
            title="Add Friend"
            variant="success"
            onPress={handleSave}
            disabled={!name.trim()}
          />
        </View>
      </KeyboardAvoidingView>
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
    padding: 20,
    paddingBottom: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    ...Platform.select({
      web: { maxWidth: 480, width: '100%', alignSelf: 'center' },
      default: {},
    }),
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  content: { gap: 10 },
  fieldLabel: { fontWeight: '600', marginBottom: 4 },
});
