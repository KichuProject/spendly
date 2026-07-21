import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated,
  Dimensions, Platform, ScrollView, KeyboardAvoidingView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ThemedView from '../components/common/ThemedView';
import ThemedText from '../components/common/ThemedText';
import ThemedCard from '../components/common/ThemedCard';
import ThemedInput from '../components/common/ThemedInput';
import PrimaryButton from '../components/buttons/PrimaryButton';
import OTPInput from '../components/OTPInput';

import { useToast } from '../components/ToastNotification';
import useAuthStore from '../state/useAuthStore';
import { useTheme } from '../styles/ThemeContext';
import { getScreenPaddingTop } from '../utils/platformUtils';
import { WEB_STYLES } from '../styles/theme';
import SuccessCheckmark from '../components/animations/SuccessCheckmark';

export default function LoginScreen() {
  const { colors, radius, spacing, elevation } = useTheme();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState('login');
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const { startSignup, login, verifyOtp, forgotPassword, isLoading } = useAuthStore();
  const showToast = useToast();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  const iconRotate = successAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-45deg', '0deg'],
  });

  const logoTranslateY = logoFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideUpAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 12 }),
    ]).start();

    // Floating diamond animation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(logoFloat, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const switchTab = (t) => {
    setTab(t);
    setStep(1);
    setOtpError(false);
    setNameError('');
    setEmailError('');
    setPhone('');
    setPhoneError('');
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setConfirmPasswordError('');
  };

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validateEmailOrPhone = (input) => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    const isPhone = /^\d{10}$/.test(input.trim());
    return isEmail || isPhone;
  };

  const handleAuthSubmit = async () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (tab === 'forgot') {
      if (!validateEmail(email)) { setEmailError('Please enter a valid email'); return; }

      try {
        const result = await forgotPassword(email);
        if (result) {
          setStep(3);
          Animated.timing(successAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

          setTimeout(() => {
            switchTab('login');
            showToast('Password reset link sent!', 'success', 3000, <Ionicons name="mail-outline" size={20} color={colors.success} />);
          }, 2000);
        } else {
          const errMsg = useAuthStore.getState().error || 'Failed to send reset email';
          showToast(errMsg, 'error');
        }
      } catch (error) {
        showToast('Error sending reset email', 'error');
      }
      return;
    }

    if (tab === 'signup') {
      if (!name.trim()) { setNameError('Please enter your name'); return; }
      if (!validateEmail(email)) { setEmailError('Please enter a valid email'); return; }
      const phoneDigits = phone.replace(/[\s-()]/g, '');
      if (!phone.trim()) {
        setPhoneError('Please enter your phone number');
        return;
      }
      if (!/^\d{10}$/.test(phoneDigits)) {
        setPhoneError('Phone number must be exactly 10 digits');
        return;
      }
      if (!password) { setPasswordError('Password is required'); return; }
      if (password.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
      if (password !== confirmPassword) { setConfirmPasswordError('Passwords do not match'); return; }
      
      try {
        const result = await startSignup(name.trim(), email.trim(), password, phoneDigits);
        if (result) {
          setStep(2);
          setCountdown(30);
          showToast('Verification code sent to your email!', 'success', 3000, <Ionicons name="mail-outline" size={20} color={colors.success} />);
        } else {
          const errMsg = useAuthStore.getState().error || 'Failed to register. Please try again.';
          showToast(errMsg, 'error');
        }
      } catch (err) {
        showToast('Registration error. Please try again.', 'error');
      }
      
    } else {
      if (!validateEmailOrPhone(email)) { setEmailError('Please enter a valid email or phone number'); return; }
      if (!password) { setPasswordError('Password is required'); return; }
      
      try {
        const result = await login(email.trim(), password);
        if (result) {
          showToast('Welcome back!', 'success');
        } else {
          const errMsg = useAuthStore.getState().error || '';
          if (errMsg.includes('User not found')) {
            showToast('Invalid email', 'error');
            setEmailError('Invalid email');
          } else if (errMsg.includes('Incorrect password')) {
            showToast('Invalid password', 'error');
            setPasswordError('Invalid password');
          } else if (errMsg.includes('No password set')) {
            showToast('No password set for this account', 'error');
            setPasswordError('No password set');
          } else {
            showToast('Invalid email or password', 'error');
            setEmailError('Invalid email');
            setPasswordError('Invalid password');
          }
        }
      } catch (err) {
        showToast('Login error. Please try again.', 'error');
      }
    }
  };

  const handleVerify = async (otp) => {
    const ok = await verifyOtp(otp);
    if (!ok) {
      setOtpError(true);
      const errMsg = useAuthStore.getState().error || 'Invalid OTP. Try again.';
      showToast(errMsg, 'error');
      setTimeout(() => setOtpError(false), 1500);
    } else {
      setStep(3);
      Animated.timing(successAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }
  };

  const handleResendOtp = async () => {
    setCountdown(30);
    const result = await startSignup(name.trim(), email.trim());
    if (result) {
      showToast('A new verification code has been sent!', 'success', 3000, <Ionicons name="mail-unread-outline" size={20} color={colors.success} />);
    } else {
      const errMsg = useAuthStore.getState().error || 'Failed to resend OTP.';
      showToast(errMsg, 'error');
    }
  };

  return (
    <ThemedView variant="bg" style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingTop: getScreenPaddingTop(insets.top) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
            {/* Branding */}
            <View style={styles.branding}>
              <Animated.View style={{ transform: [{ translateY: logoTranslateY }] }}>
              <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                <Image source={require('../../assets/diamond_glow.jpg')} style={styles.logoImage} />
              </View>
              </Animated.View>
              <ThemedText variant="hero" color="primary" style={styles.appName}>Spendly</ThemedText>
              <ThemedText variant="bodySmall" color="secondary" style={styles.tagline}>Track · Split · Settle</ThemedText>
            </View>

            {/* Main Card */}
            <ThemedCard style={styles.card} elevated>
              {step <= 1 && (
                <View style={styles.cardContent}>
                  {/* Tab header or welcome message */}
                  <View style={styles.tabRowHeader}>
                    {tab === 'login' ? (
                      <View style={styles.welcomeMsg}>
                        <ThemedText variant="h2" color="primary">Welcome Back</ThemedText>
                        <ThemedText variant="caption" color="secondary" style={{ marginTop: 4 }}>
                          Sign in to continue tracking your expenses
                        </ThemedText>
                      </View>
                    ) : tab === 'signup' ? (
                      <View style={styles.welcomeMsg}>
                        <ThemedText variant="h2" color="primary">Create Account</ThemedText>
                        <ThemedText variant="caption" color="secondary" style={{ marginTop: 4 }}>
                          Sign up to start tracking your expenses
                        </ThemedText>
                      </View>
                    ) : (
                      <View style={styles.welcomeMsg}>
                        <ThemedText variant="h2" color="primary">Reset Password</ThemedText>
                        <ThemedText variant="caption" color="secondary" style={{ marginTop: 4, textAlign: 'center' }}>
                          Enter your email to receive a password reset link
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  {/* Form */}
                  <View style={styles.form}>
                    {tab === 'signup' && (
                      <ThemedInput
                        label="Full Name"
                        placeholder="e.g. Kichu"
                        value={name}
                        onChangeText={(val) => { setName(val); setNameError(''); }}
                        icon={<Ionicons name="person" size={20} color={colors.primary} />}
                        error={nameError}
                        autoCapitalize="words"
                      />
                    )}
                    <ThemedInput
                      label={tab === 'login' ? "Email or Phone Number" : "Email Address"}
                      placeholder="e.g. kichu@example.com"
                      value={email}
                      onChangeText={(val) => { setEmail(val); setEmailError(''); }}
                      icon={<Ionicons name="mail" size={20} color={colors.accent} />}
                      error={emailError}
                      keyboardType={tab === 'login' ? "default" : "email-address"}
                      autoCapitalize="none"
                    />
                    {tab === 'signup' && (
                      <ThemedInput
                        label="Phone Number"
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChangeText={(val) => { setPhone(val); setPhoneError(''); }}
                        icon={<Ionicons name="phone-portrait" size={20} color={colors.warning} />}
                        error={phoneError}
                        keyboardType="phone-pad"
                      />
                    )}
                    {tab !== 'forgot' && (
                      <ThemedInput
                        label="Password"
                        placeholder="••••••"
                        value={password}
                        onChangeText={(val) => { setPassword(val); setPasswordError(''); }}
                        icon={<Ionicons name="lock-closed" size={20} color={colors.success} />}
                        secureTextEntry
                        error={passwordError}
                        autoCapitalize="none"
                      />
                    )}
                    {tab === 'login' && (
                      <Pressable
                        onPress={() => switchTab('forgot')}
                        style={({ pressed }) => [
                          styles.forgotPasswordContainer,
                          pressed && { opacity: 0.7 },
                          WEB_STYLES.cursor,
                        ]}
                      >
                        <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
                      </Pressable>
                    )}
                    {tab === 'signup' && (
                      <ThemedInput
                        label="Confirm Password"
                        placeholder="••••••"
                        value={confirmPassword}
                        onChangeText={(val) => { setConfirmPassword(val); setConfirmPasswordError(''); }}
                        icon={<Ionicons name="lock-closed" size={20} color={colors.primary} />}
                        secureTextEntry
                        error={confirmPasswordError}
                        autoCapitalize="none"
                      />
                    )}
                  </View>

                  {/* Submit button */}
                  <PrimaryButton
                    title={
                      tab === 'login'
                        ? 'Login'
                        : tab === 'signup'
                        ? 'Create Account'
                        : 'Send Reset Link'
                    }
                    onPress={handleAuthSubmit}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.submitBtn}
                  />

                  {/* Footer hint */}
                  <Text style={[styles.footerHint, { color: colors.textSecondary }]}>
                    {tab === 'login' ? (
                      <>
                        {"Don't have an account? "}
                        <Text
                          style={[styles.footerLink, { color: colors.primary }]}
                          onPress={() => switchTab('signup')}
                        >
                          Sign Up
                        </Text>
                      </>
                    ) : tab === 'signup' ? (
                      <>
                        {"Already have an account? "}
                        <Text
                          style={[styles.footerLink, { color: colors.primary }]}
                          onPress={() => switchTab('login')}
                        >
                          Login
                        </Text>
                      </>
                    ) : (
                      <>
                        {"Remembered your password? "}
                        <Text
                          style={[styles.footerLink, { color: colors.primary }]}
                          onPress={() => switchTab('login')}
                        >
                          Login
                        </Text>
                      </>
                    )}
                  </Text>
                </View>
              )}

              {step === 2 && (
                <View style={styles.cardContent}>
                  <View style={styles.otpSection}>
                    <View style={[styles.otpHeaderIcon, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                      <Ionicons name="mail-open-outline" size={26} color={colors.primary} />
                    </View>
                    <ThemedText variant="h2" color="primary" style={styles.otpTitle}>Verify Your Email</ThemedText>
                    <ThemedText variant="bodySmall" color="secondary" style={styles.otpSubtitle}>Enter the 6-digit code sent to</ThemedText>
                    <Text style={[styles.otpEmail, { color: colors.primary }]}>{email}</Text>

                    {/* Step indicator */}
                    <View style={styles.stepRow}>
                      {[1, 2, 3].map((d) => (
                        <View key={d} style={styles.stepItem}>
                          <View style={[styles.stepDot, step >= d && { backgroundColor: colors.primary, borderColor: colors.primary }]} />
                          {d < 3 && <View style={[styles.stepLine, step > d && { backgroundColor: colors.primary }]} />}
                        </View>
                      ))}
                    </View>

                    <OTPInput onComplete={handleVerify} error={otpError} />

                    <View style={styles.resendRow}>
                      {countdown > 0 ? (
                        <ThemedText variant="bodySmall" color="secondary" style={styles.resendTimer}>Resend code in {countdown}s</ThemedText>
                      ) : (
                        <Pressable onPress={handleResendOtp} style={[WEB_STYLES.cursor, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                          <Ionicons name="mail-unread-outline" size={16} color={colors.success} />
                          <Text style={[styles.resendLink, { color: colors.success }]}>Resend Code</Text>
                        </Pressable>
                      )}
                    </View>

                    <Pressable onPress={() => setStep(1)} style={[styles.backButton, { backgroundColor: colors.borderLight }, WEB_STYLES.cursor]}>
                      <ThemedText variant="bodySmall" color="secondary">← Change Email</ThemedText>
                    </Pressable>
                  </View>
                </View>
              )}

              {step === 3 && (
                <View style={styles.cardContent}>
                  <Animated.View style={[styles.successSection, { opacity: successAnim, transform: [{ scale: successAnim }, { rotate: iconRotate }] }]}>
                    <SuccessCheckmark size={96} style={{ marginBottom: 20 }} />
                    <ThemedText variant="h2" color="primary" style={styles.successTitle}>
                      {tab === 'forgot' ? 'Email Sent!' : 'Welcome!'}
                    </ThemedText>
                    <ThemedText variant="bodySmall" color="secondary" style={styles.successSubtitle}>
                      {tab === 'forgot' ? 'Check your inbox for reset instructions' : 'Setting up your account...'}
                    </ThemedText>
                  </Animated.View>
                </View>
              )}
            </ThemedCard>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  container: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  branding: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      web: { filter: 'drop-shadow(0 0 16px rgba(124,58,237,0.6))' },
      default: {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  appName: {
    fontWeight: '800',
  },
  tagline: {
    marginTop: 4,
    letterSpacing: 0.5,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 24,
  },
  tabRowHeader: {
    marginBottom: 28,
  },
  welcomeMsg: {
    alignItems: 'center',
  },
  form: {
    gap: 4,
    marginBottom: 20,
  },
  submitBtn: {
    marginBottom: 16,
    width: '100%',
  },
  footerHint: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  footerLink: {
    fontWeight: '700',
  },
  otpSection: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  otpHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  otpTitle: {
    fontWeight: '800',
  },
  otpSubtitle: {
    fontWeight: '500',
  },
  otpEmail: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: 4,
  },
  resendRow: {
    marginTop: 8,
  },
  resendTimer: {
    fontWeight: '600',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  backButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontWeight: '800',
  },
  successSubtitle: {
    marginTop: 8,
  },
});
