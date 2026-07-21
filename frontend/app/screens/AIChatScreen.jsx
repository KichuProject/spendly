import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform, TextInput, Pressable, ActivityIndicator, Keyboard, PermissionsAndroid, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useSpeechRecognitionEvent, ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

import MessageBubble from '../components/MessageBubble';
import ConfirmationCard from '../components/ConfirmationCard';
import { useToast } from '../components/ToastNotification';
import useChatStore from '../state/useChatStore';
import useExpenseStore from '../state/useExpenseStore';
import apiClient from '../utils/apiClient';
import { COLORS, WEB_STYLES, SHADOWS } from '../styles/theme';
import { getScreenPaddingTop } from '../utils/platformUtils';
import ThemedView from '../components/common/ThemedView';
import ThemedText from '../components/common/ThemedText';
import { useTheme } from '../styles/ThemeContext';
import ThinkingDots from '../components/animations/ThinkingDots';
import ScaleIn from '../components/animations/ScaleIn';

export default function AIChatScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const showToast = useToast();
  const flatListRef = useRef(null);

  const {
    conversationId,
    messages,
    loading,
    confirmationCardVisible,
    pendingTransactions,
    setLoading,
    addMessage,
    setConversationId,
    setConfirmationCardVisible,
    setPendingTransactions,
    resetChat
  } = useChatStore();

  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const { colors, radius, spacing, elevation } = useTheme();

  useEffect(() => {
    const runRotation = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000, // Slowed down from 3000ms
        easing: Easing.linear,
        useNativeDriver: true
      }).start((o) => {
        if (o.finished) {
          runRotation();
        }
      });
    };
    runRotation();

    // Hovering float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Android keyboard handling — manually track keyboard height
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Speech Recognition
  useSpeechRecognitionEvent('start', () => setIsListening(true));
  useSpeechRecognitionEvent('end', () => setIsListening(false));
  useSpeechRecognitionEvent('result', (event) => setText(event.results[0]?.transcript || ''));
  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    const err = event.error;
    if (err === 'no-speech') return; // Ignore silent timeouts
    
    console.error('Speech recognition error:', event);
    
    let friendlyMessage = 'Speech recognition failed. Please try again.';
    if (err === 'network' || err === 'network-timeout') {
      friendlyMessage = 'Voice recognition requires an active internet connection.';
    } else if (err === 'audio') {
      friendlyMessage = 'Microphone recording error. Please check your mic settings.';
    } else if (err === 'not-allowed' || err === 'permission') {
      friendlyMessage = 'Microphone permission is required.';
    } else if (err === 'no-match') {
      friendlyMessage = "Didn't catch that. Please speak clearly.";
    }
    
    showToast(friendlyMessage, 'error');
  });

  const toggleListening = async () => {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
    } else {
      try {
        let hasPermission = false;
        
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message: 'Spendly AI needs access to your microphone so you can dictate transactions.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
          hasPermission = granted;
        }

        if (hasPermission) {
          ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true });
        } else {
          showToast('Microphone permission is required.', 'error');
        }
      } catch (error) {
        console.error('Failed to start listening:', error);
        showToast('Failed to start microphone. Please try again.', 'error');
      }
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    if (isListening) ExpoSpeechRecognitionModule.stop();

    const userText = text;
    setText('');
    addMessage({ role: 'user', content: userText });
    setLoading(true);

    try {
      const data = await apiClient.request('/voice/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userText,
          conversationId,
        })
      });
      
      if (data.success) {
        if (!conversationId) setConversationId(data.conversationId);
        
        if (data.confirmationRequired) {
          addMessage({ role: 'assistant', content: 'Please review and confirm these transactions.' });
          setPendingTransactions(data.transactions);
          setConfirmationCardVisible(true);
        } else {
          addMessage({ role: 'assistant', content: data.reply });
        }
      } else {
        showToast(data.message || 'Error parsing transaction', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Network error while connecting to AI', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      const data = await apiClient.request('/voice/confirm', {
        method: 'POST',
        body: JSON.stringify({ conversationId, transactions: pendingTransactions })
      });
      if (data.success) {
        showToast('Expense added successfully', 'success', 3000, <Ionicons name="checkmark-circle" size={20} color={colors.success} />);
        if (data.transactions && data.transactions.length > 0) {
          useExpenseStore.getState().addExpensesLocally(data.transactions);
        }
        useExpenseStore.getState().loadExpenses(); // Still run a background sync
        resetChat();
        navigation.navigate('MainTabs');
      } else {
        showToast(data.message || 'Unable to save expense', 'error');
      }
    } catch (error) {
      showToast('Network error while saving', 'error');
    }
  };

  const handleCancel = async () => {
    try {
      await apiClient.request('/voice/cancel', {
        method: 'POST',
        body: JSON.stringify({ conversationId })
      });
    } catch (e) {
      console.log('Error cancelling', e);
    }
    setConfirmationCardVisible(false);
    setPendingTransactions([]);
    addMessage({ role: 'assistant', content: 'Transaction cancelled.' });
  };

  return (
    <ThemedView variant="bg" style={[styles.container, { paddingTop: getScreenPaddingTop(insets.top) }]}>
      <View style={{ flex: 1, width: '100%' }}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.navigate('MainTabs')}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              pressed && { opacity: 0.7 },
              WEB_STYLES.cursor,
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </Pressable>

          <View style={[styles.avatar, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}>
            <MaterialCommunityIcons name="robot" size={20} color={colors.primary} />
          </View>

          <ThemedText variant="h3" color="primary" style={styles.headerTitle}>Spendly AI</ThemedText>

          <Pressable
            onPress={() => {
              resetChat();
              showToast('Conversation reset', 'info');
            }}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              pressed && { opacity: 0.7 },
              WEB_STYLES.cursor
            ]}
          >
            <Ionicons name="refresh-outline" size={18} color={colors.textPrimary} />
          </Pressable>
        </View>

        {messages.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <ScaleIn delay={200}>
            <MaterialCommunityIcons name="robot-outline" size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
            </ScaleIn>
            <ThemedText variant="body" color="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
              What transactions would you like to add today?
            </ThemedText>

            {/* Suggestion Chips */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', paddingHorizontal: 20 }}>
              {[
                "Add lunch for ₹350",
                "Show this week's spent",
                "Who owes me?"
              ].map((sug, i) => (
                <Pressable
                  key={i}
                  onPress={() => setText(sug)}
                  style={({ pressed }) => [
                    {
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.surfaceSecondary,
                      opacity: pressed ? 0.8 : 1,
                    },
                    WEB_STYLES.cursor
                  ]}
                >
                  <ThemedText variant="caption" color="secondary" style={{ fontWeight: '600' }}>{sug}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            style={{ flex: 1, minHeight: 0 }}
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.chatList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ThinkingDots size={7} />
            <ThemedText variant="caption" color="secondary">Spendly AI is thinking...</ThemedText>
          </View>
        )}

        <Animated.View style={[
          styles.floatingContainer, 
          { 
            marginBottom: keyboardHeight > 0 
              ? keyboardHeight + 15 
              : Math.max(insets.bottom, 40),
            transform: [{ translateY: floatAnim }]
          }
        ]}>
          <View style={styles.rainbowBorderWrapper}>
            <Animated.View style={[styles.rainbowGradient, { transform: [{ rotate: spin }] }]}>
              <LinearGradient 
                colors={[
                  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3', '#FF007F',
                  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3', '#FF007F',
                  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3', '#FF007F',
                  '#FF0000'
                ]} 
                locations={[
                  0, 0.042, 0.083, 0.125, 0.167, 0.208, 0.25, 0.292, 
                  0.333, 0.375, 0.417, 0.458, 0.5, 0.542, 0.583, 0.625, 
                  0.667, 0.708, 0.75, 0.792, 0.833, 0.875, 0.917, 0.958, 1
                ]}
                start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                style={StyleSheet.absoluteFill} 
              />
            </Animated.View>

            <View style={styles.pillInputContainer}>
              <View style={styles.pillIconLeft}>
                <MaterialCommunityIcons name="robot-outline" size={24} color={COLORS.textPrimary} />
              </View>
              <TextInput
                style={styles.pillTextInput}
                placeholder="Message AI..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={text}
                onChangeText={setText}
                onSubmitEditing={handleSend}
              />
              <View style={styles.pillActionsRight}>
                <Pressable 
                  style={[styles.micButtonSmall, isListening && styles.micListening, WEB_STYLES.cursor]} 
                  onPress={toggleListening}
                >
                  <Ionicons name="mic" size={22} color={COLORS.textPrimary} />
                </Pressable>
                <Pressable 
                  style={[styles.sendButtonSmall, !text.trim() && styles.disabledSend, WEB_STYLES.cursor]} 
                  onPress={handleSend}
                  disabled={!text.trim()}
                >
                  <Ionicons name="send" size={16} color={COLORS.textPrimary} style={{ marginLeft: 2 }} />
                </Pressable>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      <ConfirmationCard 
        visible={confirmationCardVisible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    height: Platform.OS === 'web' ? '100%' : undefined,
  },
  container: {
    flex: 1,
    ...Platform.select({
      web: { maxWidth: 480, width: '100%', alignSelf: 'center', height: '100%', maxHeight: '100%' },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
    flexShrink: 0,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  headerTitle: {
    flex: 1,
    fontWeight: '700',
    marginRight: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatList: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  floatingContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  rainbowBorderWrapper: {
    width: '100%',
    borderRadius: 34, // Slightly larger than pill to show border
    overflow: 'hidden',
    padding: 3.5, // Border width (made thicker)
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
  },
  rainbowGradient: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
  },
  pillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 30,
    paddingVertical: 4,
    paddingHorizontal: 16,
    minHeight: 56,
    width: '100%',
  },
  pillIconLeft: {
    marginRight: 12,
  },
  pillTextInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingVertical: 12,
    maxHeight: 120,
    textAlignVertical: 'center',
    ...Platform.select({
      web: { outlineStyle: 'none' },
      default: {},
    }),
  },
  pillActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  micButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micListening: {
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
  },
  sendButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSend: {
    opacity: 0.4,
  },
  bottomCardWrapper: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  }
});
