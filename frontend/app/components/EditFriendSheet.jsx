import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, WEB_STYLES } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import GlassButton from './GlassButton';
import GlassInput from './GlassInput';

export default function EditFriendSheet({ visible, onClose, friend, onSave }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (visible && friend) {
      setName(friend.name || '');
    }
  }, [visible, friend]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <KeyboardAvoidingView 
        style={styles.backdrop} 
        behavior="padding"
      >
        <Pressable style={styles.dimArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Edit Friend</Text>
              <Ionicons name="create-outline" size={22} color="#A78BFA" />
            </View>
            <Pressable onPress={onClose} style={[WEB_STYLES.cursor]}><Text style={styles.close}>✕</Text></Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.fieldLabel}>Change your friend's name</Text>
            <GlassInput
              placeholder="e.g. Rahul, Priya, Alex..."
              value={name}
              onChangeText={setName}
              icon="👤"
              autoFocus
            />
            <View style={{ height: 24 }} />
          </View>

          <GlassButton
            title="✨ Update Name"
            variant="success"
            fullWidth
            onPress={handleSave}
            disabled={!name.trim() || name.trim() === friend?.name}
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
    backgroundColor: 'rgba(20,16,50,0.98)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomWidth: 0,
    ...Platform.select({
      web: { maxWidth: 480, width: '100%', alignSelf: 'center' },
      default: {},
    }),
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700' },
  close: { color: COLORS.textMuted, fontSize: 22, padding: 4 },
  content: { gap: 10 },
  fieldLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
});
