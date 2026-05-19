import { create } from 'zustand';
import { apiClient } from '../utils/apiClient';
import useExpenseStore from './useExpenseStore';
import useFriendsStore from './useFriendsStore';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  pendingEmail: null,
  pendingName: null,
  pendingPassword: null,
  pendingPhone: null,
  otpSent: false,
  isLoading: false,
  error: null,

  /**
   * Initialize auth store - load existing token if available
   */
  initialize: async () => {
    try {
      await apiClient.initialize();
      if (apiClient.accessToken) {
        const response = await apiClient.getCurrentUser();
        if (response.success) {
          set({
            user: response.data,
            isAuthenticated: true,
          });
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  },

  /**
   * Start signup - send OTP
   */
  startSignup: async (name, email, password = null, phone = null) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.sendOTP(email, 'signup', phone);
      if (response.success) {
        set((state) => ({
          pendingName: name,
          pendingEmail: email,
          pendingPassword: password !== null ? password : state.pendingPassword,
          pendingPhone: phone !== null ? phone : state.pendingPhone,
          otpSent: true,
          isLoading: false,
        }));
        return true;
      }
      throw new Error(response.message || 'Failed to send OTP');
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Direct password-based login
   */
  login: async (emailOrPhone, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.login(emailOrPhone, password);
      if (response.success) {
        const { accessToken, refreshToken, user } = response;
        
        // Store tokens
        await apiClient.setTokens(accessToken, refreshToken);

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Verify OTP and complete signup
   */
  verifyOtp: async (otp) => {
    set({ isLoading: true, error: null });
    try {
      const { pendingEmail, pendingName, pendingPassword, pendingPhone } = get();
      if (!pendingEmail) {
        throw new Error('No pending email found');
      }

      const response = await apiClient.verifyOTP(pendingEmail, otp, pendingName, pendingPassword, pendingPhone);
      if (response.success) {
        const { accessToken, refreshToken, user } = response;
        
        // Store tokens
        await apiClient.setTokens(accessToken, refreshToken);

        set({
          user,
          isAuthenticated: true,
          otpSent: false,
          pendingEmail: null,
          pendingName: null,
          pendingPassword: null,
          pendingPhone: null,
          isLoading: false,
        });
        return true;
      }
      throw new Error(response.message || 'Failed to verify OTP');
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.callLogout();
      
      // Clear all cached local data for this user
      useExpenseStore.getState().clearData();
      useFriendsStore.getState().clearData();
      
      // Clear install date
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('INSTALL_DATE');
      } catch (storageErr) {
        console.error('Error clearing install date:', storageErr);
      }

      set({
        user: null,
        isAuthenticated: false,
        pendingEmail: null,
        pendingName: null,
        pendingPassword: null,
        pendingPhone: null,
        otpSent: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      // Clear data anyway on forced logout
      useExpenseStore.getState().clearData();
      useFriendsStore.getState().clearData();
      
      // Clear install date
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('INSTALL_DATE');
      } catch (storageErr) {
        console.error('Error clearing install date:', storageErr);
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Reset OTP state
   */
  resetOtp: () => {
    set({
      otpSent: false,
      pendingEmail: null,
      pendingName: null,
      pendingPassword: null,
      pendingPhone: null,
      error: null,
    });
  },

  /**
   * Update user profile
   */
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateUserProfile(data);
      if (response.success) {
        set({
          user: response.user,
          isLoading: false,
        });
        return true;
      }
      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Register push token
   */
  registerPushToken: async (token) => {
    try {
      const response = await apiClient.registerPushToken(token);
      if (response.success) {
        set({
          user: response.user,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Push token registration error:', error);
      return false;
    }
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.changePassword(currentPassword, newPassword);
      if (response.success) {
        set({
          user: response.user,
          isLoading: false,
        });
        return true;
      }
      throw new Error(response.message || 'Failed to change password');
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Send password reset email
   */
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.forgotPassword(email);
      if (response.success) {
        set({
          isLoading: false,
        });
        return true;
      }
      throw new Error(response.message || 'Failed to send reset email');
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (email, token, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.resetPassword(email, token, newPassword);
      if (response.success) {
        set({
          isLoading: false,
        });
        return true;
      }
      throw new Error(response.message || 'Failed to reset password');
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return false;
    }
  },
}));

export default useAuthStore;
