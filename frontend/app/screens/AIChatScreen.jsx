import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform, TextInput, Pressable, ActivityIndicator, Keyboard, PermissionsAndroid, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useSpeechRecognitionEvent, ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

import LiquidBackground from '../components/LiquidBackground';
import MessageBubble from '../components/MessageBubble';
import ConfirmationCard from '../components/ConfirmationCard';
import { useToast } from '../components/ToastNotification';
import useChatStore from '../state/useChatStore';
import useExpenseStore from '../state/useExpenseStore';
import apiClient from '../utils/apiClient';
import { COLORS, WEB_STYLES, SHADOWS } from '../styles/theme';

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
        showToast('Expense added successfully', 'success', 3000, <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />);
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
    <LiquidBackground 
      simplified={Platform.OS === 'web'} 
      style={Platform.OS === 'web' ? { height: '100vh' } : { flex: 1 }}
    >
      <View style={[styles.container, { width: '100%' }]}>
        <View style={[styles.header, { paddingTop: (insets.top || Constants.statusBarHeight || 24) + 10}]}>
          <Pressable onPress={() => { navigation.navigate('MainTabs'); }} style={WEB_STYLES.cursor}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="robot-outline" size={22} color={COLORS.textPrimary} />
            <Text style={styles.headerTitle}>Spendly AI</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {messages.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <MaterialCommunityIcons name="robot-outline" size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: 16 }} />
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, textAlign: 'center' }}>
              What transactions would you like to add today?
            </Text>
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
            <ActivityIndicator color={COLORS.textSecondary} size="small" />
            <Text style={styles.loadingText}>Spendly AI is typing...</Text>
          </View>
        )}

        {confirmationCardVisible ? (
          <View style={styles.bottomCardWrapper}>
             <ConfirmationCard onConfirm={handleConfirm} onCancel={handleCancel} />
          </View>
        ) : (
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
        )}
      </View>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      web: { maxWidth: 480, width: '100%', alignSelf: 'center', height: '100%', maxHeight: '100%' },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(15, 12, 41, 0.8)',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
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
