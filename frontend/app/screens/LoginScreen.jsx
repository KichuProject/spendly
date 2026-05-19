import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated,
  Dimensions, Platform, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LiquidBackground from '../components/LiquidBackground';
import GlassInput from '../components/GlassInput';
import GlassButton from '../components/GlassButton';
import OTPInput from '../components/OTPInput';
import { useToast } from '../components/ToastNotification';
import useAuthStore from '../state/useAuthStore';
import { COLORS, GRADIENTS, GLASS, SHADOWS, WEB_STYLES } from '../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const [tab, setTab] = useState('login');
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const { startSignup, login, verifyOtp, forgotPassword, isLoading } = useAuthStore();
  const showToast = useToast();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const iconRotate = successAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-45deg', '0deg'],
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideUpAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 12 }),
    ]).start();
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
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setConfirmPasswordError('');
  };

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

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
          // Transition to Step 3 (Success Animation)
          setStep(3);
          Animated.timing(successAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

          setTimeout(() => {
            switchTab('login');
            showToast('Password reset link sent! ✉️', 'success');
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
      if (!password) { setPasswordError('Password is required'); return; }
      if (password.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
      if (password !== confirmPassword) { setConfirmPasswordError('Passwords do not match'); return; }
      
      try {
        const result = await startSignup(name.trim(), email.trim(), password);
        if (result) {
          setStep(2);
          setCountdown(30);
          showToast('Verification code sent to your email! ✉️', 'success');
        } else {
          const errMsg = useAuthStore.getState().error || 'Failed to register. Please try again.';
          showToast(errMsg, 'error');
        }
      } catch (err) {
        showToast('Registration error. Please try again.', 'error');
      }
      
    } else {
      if (!validateEmail(email)) { setEmailError('Please enter a valid email'); return; }
      if (!password) { setPasswordError('Password is required'); return; }
      
      try {
        const result = await login(email.trim(), password);
        if (result) {
          showToast('Welcome back! 👋', 'success');
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
      showToast('A new verification code has been sent! ✉️', 'success');
    } else {
      const errMsg = useAuthStore.getState().error || 'Failed to resend OTP.';
      showToast(errMsg, 'error');
    }
  };

  return (
    <LiquidBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
            {/* Branding */}
            <View style={styles.branding}>
              <View style={styles.logoCircle}>
                <LinearGradient
                  colors={GRADIENTS.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.logoEmoji}>💎</Text>
              </View>
              <Text style={styles.appName}>Spendly</Text>
              <Text style={styles.tagline}>Track. Split. Settle.</Text>
            </View>

            {/* Main Card */}
            <View style={styles.card}>
              {/* Glass effect layers */}
              <View style={styles.cardGlassBg} />
              <View style={styles.cardShimmer} />

              {step <= 1 && (
                <View style={styles.cardContent}>
                  {/* Tab header or welcome message */}
                  {tab === 'login' ? (
                    <View style={{ marginBottom: 24, alignItems: 'center' }}>
                      <Text style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' }}>Welcome Back</Text>
                      <Text style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: '500', marginTop: 4 }}>Sign in to continue tracking your expenses</Text>
                    </View>
                  ) : tab === 'signup' ? (
                    <View style={{ marginBottom: 24, alignItems: 'center' }}>
                      <Text style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' }}>Create Account</Text>
                      <Text style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: '500', marginTop: 4 }}>Sign up to start tracking your expenses</Text>
                    </View>
                  ) : (
                    <View style={{ marginBottom: 24, alignItems: 'center' }}>
                      <Text style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' }}>Reset Password</Text>
                      <Text style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: '500', marginTop: 4, textAlign: 'center' }}>Enter your email to receive a password reset link</Text>
                    </View>
                  )}

                  {/* Form */}
                  <View style={styles.form}>
                    {tab === 'signup' && (
                      <GlassInput
                        placeholder="Full Name"
                        value={name}
                        onChangeText={(val) => { setName(val); setNameError(''); }}
                        icon="👤"
                        error={nameError}
                        autoCapitalize="words"
                      />
                    )}
                    <GlassInput
                      placeholder="Email Address"
                      value={email}
                      onChangeText={(val) => { setEmail(val); setEmailError(''); }}
                      icon="✉️"
                      error={emailError}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {tab !== 'forgot' && (
                      <GlassInput
                        placeholder="Password"
                        value={password}
                        onChangeText={(val) => { setPassword(val); setPasswordError(''); }}
                        icon="🔑"
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
                          WEB_STYLES.cursor
                        ]}
                      >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                      </Pressable>
                    )}
                    {tab === 'signup' && (
                      <GlassInput
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={(val) => { setConfirmPassword(val); setConfirmPasswordError(''); }}
                        icon="🔑"
                        secureTextEntry
                        error={confirmPasswordError}
                        autoCapitalize="none"
                      />
                    )}
                  </View>

                  {/* Submit button */}
                  <GlassButton
                    title={
                      tab === 'login'
                        ? 'Login →'
                        : tab === 'signup'
                        ? 'Create Account →'
                        : 'Send Reset Link →'
                    }
                    variant="primary"
                    onPress={handleAuthSubmit}
                    loading={isLoading}
                    disabled={isLoading}
                    fullWidth
                    style={styles.submitBtn}
                  />

                  {/* Footer hint */}
                  <Text style={styles.footerHint}>
                    {tab === 'login' ? (
                      <>
                        {"Don't have an account? "}
                        <Text
                          style={styles.footerLink}
                          onPress={() => switchTab('signup')}
                        >
                          Sign Up
                        </Text>
                      </>
                    ) : tab === 'signup' ? (
                      <>
                        {"Already have an account? "}
                        <Text
                          style={styles.footerLink}
                          onPress={() => switchTab('login')}
                        >
                          Login
                        </Text>
                      </>
                    ) : (
                      <>
                        {"Remembered your password? "}
                        <Text
                          style={styles.footerLink}
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
                    <View style={[styles.otpHeaderIcon, { backgroundColor: 'rgba(251, 191, 36, 0.12)', borderColor: 'rgba(251, 191, 36, 0.3)' }]}>
                      <Ionicons name="lock-closed-outline" size={26} color="#FBBF24" />
                    </View>
                    <Text style={styles.otpTitle}>Verify Your Email</Text>
                    <Text style={styles.otpSubtitle}>Enter the 6-digit code sent to</Text>
                    <Text style={styles.otpEmail}>{email}</Text>

                    {/* Step indicator */}
                    <View style={styles.stepRow}>
                      {[1, 2, 3].map((d) => (
                        <View key={d} style={styles.stepItem}>
                          <View style={[styles.stepDot, step >= d && styles.stepDotActive]} />
                          {d < 3 && <View style={[styles.stepLine, step > d && styles.stepLineActive]} />}
                        </View>
                      ))}
                    </View>

                    <OTPInput onComplete={handleVerify} error={otpError} />

                    <View style={styles.resendRow}>
                      {countdown > 0 ? (
                        <Text style={styles.resendTimer}>Resend code in {countdown}s</Text>
                      ) : (
                        <Pressable onPress={handleResendOtp} style={[WEB_STYLES.cursor, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                          <Ionicons name="mail-unread-outline" size={16} color="#34D399" />
                          <Text style={[styles.resendLink, { color: '#34D399' }]}>Resend Code</Text>
                        </Pressable>
                      )}
                    </View>

                    <Pressable onPress={() => setStep(1)} style={[styles.backButton, WEB_STYLES.cursor]}>
                      <Text style={styles.backButtonText}>← Change Email</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {step === 3 && (
                <View style={styles.cardContent}>
                  <Animated.View style={[styles.successSection, { opacity: successAnim, transform: [{ scale: successAnim }, { rotate: iconRotate }] }]}>
                    <View style={styles.successIconCircle}>
                      <Ionicons name="checkmark-circle" size={64} color="#10B981" />
                    </View>
                    <Text style={styles.successTitle}>
                      {tab === 'forgot' ? 'Email Sent!' : 'Welcome!'}
                    </Text>
                    <Text style={styles.successSubtitle}>
                      {tab === 'forgot' ? 'Check your inbox for reset instructions' : 'Setting up your account...'}
                    </Text>
                    <View style={styles.successDots}>
                      {[0, 1, 2].map((i) => (
                        <View key={i} style={[styles.successDot, { opacity: 0.3 + i * 0.3 }]} />
                      ))}
                    </View>
                  </Animated.View>
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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

  // --- Branding ---
  branding: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(124,58,237,0.4)',
    ...SHADOWS.glow('#7C3AED'),
  },
  logoEmoji: {
    fontSize: 32,
    zIndex: 1,
  },
  appName: {
    color: COLORS.textPrimary,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    ...Platform.select({
      web: { textShadow: '0 0 24px rgba(124,58,237,0.5)' },
      default: {
        textShadowColor: 'rgba(124,58,237,0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 24,
      },
    }),
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: '500',
    marginTop: 6,
    letterSpacing: 1,
  },

  // --- Card ---
  card: {
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  cardGlassBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,16,50,0.85)',
  },
  cardShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '45%',
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderTopLeftRadius: 28,
    zIndex: 2,
  },
  cardContent: {
    padding: 24,
    paddingTop: 20,
  },

  // --- Tabs ---
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    overflow: 'hidden',
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: '700',
    zIndex: 1,
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },

  // --- Form ---
  form: {
    gap: 16,
    marginBottom: 20,
  },
  submitBtn: {
    marginBottom: 16,
  },
  footerHint: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  footerLink: {
    color: '#A78BFA',
    fontWeight: '700',
  },

  // --- OTP ---
  otpSection: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  otpHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  otpIconText: {
    fontSize: 24,
  },
  otpTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  otpSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  otpEmail: {
    color: '#A78BFA',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  resendRow: {
    marginTop: 8,
  },
  resendTimer: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  resendLink: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '700',
  },
  backButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  backButtonText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  forgotPasswordText: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '600',
  },

  // --- Success ---
  successSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 2.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: '0 0 24px rgba(16, 185, 129, 0.3)' },
      default: { shadowColor: '#10B981', shadowOpacity: 0.3, shadowRadius: 24, elevation: 6 },
    }),
  },
  successTitle: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '800',
  },
  successSubtitle: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginTop: 8,
  },
  successDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 24,
  },
  successDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});
