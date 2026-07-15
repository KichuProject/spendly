import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, Pressable, Platform, Modal, ActivityIndicator, PermissionsAndroid, Easing, Keyboard } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSpeechRecognitionEvent, ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { COLORS, SHADOWS, WEB_STYLES, GRADIENTS, GLASS } from '../styles/theme';
import useChatStore from '../state/useChatStore';
import { getToken } from '../state/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../utils/apiClient';
import { useToast } from './ToastNotification';

export default function BottomAssistant({ visible, onClose }) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRendered, setIsRendered] = useState(visible);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const showToast = useToast();

  const addMessage = useChatStore(s => s.addMessage);
  const setConversationId = useChatStore(s => s.setConversationId);
  const setPendingTransactions = useChatStore(s => s.setPendingTransactions);
  const setConfirmationCardVisible = useChatStore(s => s.setConfirmationCardVisible);
  const resetChat = useChatStore(s => s.resetChat);

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

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true })
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -8, duration: 1500, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
        ])
      ).start();

      const runRotation = () => {
        rotateAnim.setValue(0);
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000, // Slowed down from 3000ms
          easing: Easing.linear,
          useNativeDriver: true
        }).start((o) => {
          if (o.finished && visible) {
            runRotation();
          }
        });
      };
      runRotation();

    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 300, duration: 250, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true })
      ]).start(() => {
        setIsRendered(false);
      });
      floatAnim.setValue(0);
      rotateAnim.setValue(0);
      
      // Reset local state on close if we didn't navigate
      if (!isProcessing) {
        setText('');
        setIsListening(false);
      }
    }
  }, [visible]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  // Speech Recognition integration
  useSpeechRecognitionEvent('start', () => setIsListening(true));
  useSpeechRecognitionEvent('end', () => setIsListening(false));
  useSpeechRecognitionEvent('result', (event) => {
    setText(event.results[0]?.transcript || '');
  });
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

        if (!hasPermission) {
          showToast('Microphone permission is required.', 'error');
          return;
        }
        
        ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true });
      } catch (error) {
        console.error('Failed to start listening:', error);
        showToast('Failed to start microphone. Please try again.', 'error');
      }
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
    }
    
    const userText = text;
    setText('');
    setIsProcessing(true);
    
    const userMessage = { role: 'user', content: userText };
    addMessage(userMessage);

    try {
      const data = await apiClient.request('/voice/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userText,
        })
      });
      
      if (data.success) {
        setConversationId(data.conversationId);
        
        if (data.confirmationRequired) {
          addMessage({ role: 'assistant', content: 'Please confirm these transactions.' });
          setPendingTransactions(data.transactions);
          setConfirmationCardVisible(true);
        } else {
          addMessage({ role: 'assistant', content: data.reply });
        }

        // Navigate to AIChatScreen
        navigation.navigate('AIChatScreen');
        onClose(); // Close bottom sheet
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      alert('Failed to connect to AI');
    } finally {
      setIsProcessing(false);
      setText('');
    }
  };

  if (!isRendered) return null;

  return (
    <Modal transparent visible={isRendered} animationType="none" onRequestClose={!isProcessing ? onClose : undefined}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Pressable style={styles.backdrop} onPress={!isProcessing ? onClose : null} />
        <View style={styles.panelWrapper}>
          <Animated.View style={[styles.floatingContainer, { transform: [{ translateY: slideAnim }, { translateY: floatAnim }], marginBottom: keyboardHeight > 0 ? keyboardHeight + 10 : 0 }]}>
            
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
                  value={text}
                  onChangeText={setText}
                  placeholder="Message AI..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  editable={!isProcessing}
                />

                <View style={styles.pillActionsRight}>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Pressable 
                      onPress={toggleListening} 
                      disabled={isProcessing}
                      style={[styles.micButtonSmall, isListening && styles.micListening, WEB_STYLES.cursor]}
                    >
                      <Ionicons name="mic" size={22} color={COLORS.textPrimary} />
                    </Pressable>
                  </Animated.View>

                  <Pressable 
                    onPress={handleSend} 
                    disabled={!text.trim() || isProcessing}
                    style={[styles.sendButtonSmall, (!text.trim() || isProcessing) && styles.sendButtonDisabled, WEB_STYLES.cursor]}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color={COLORS.textPrimary} size="small" />
                    ) : (
                      <Ionicons name="send" size={16} color={COLORS.textPrimary} style={{ marginLeft: 2 }} />
                    )}
                  </Pressable>
                </View>
              </View>
            </View>

          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    justifyContent: 'flex-end',
    ...Platform.select({
      web: { position: 'fixed' }
    }),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  panelWrapper: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  floatingContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 60 : 45, // Pushed slightly higher up
    alignItems: 'center',
    ...SHADOWS.large,
  },
  rainbowBorderWrapper: {
    width: '100%',
    borderRadius: 34, // Slightly larger than pill to show border
    overflow: 'hidden',
    padding: 3.5, // Border width (made thicker)
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
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
    ...SHADOWS.large,
    minHeight: 56,
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
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
