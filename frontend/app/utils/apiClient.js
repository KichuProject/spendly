/**
 * API Client for Spend App
 * Handles all HTTP requests to the backend with timestamps
 * Uses AsyncStorage for token persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configuration - Intelligent and dynamic IP resolver for Web, Emulator, and Local Wi-Fi Network
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Try to parse dynamic host IP from Expo dev server (perfect for physical devices on same Wi-Fi)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    return `http://${hostIp}:5000/api`;
  }
  
  // Platform-specific fallback defaults if hostUri is unavailable (e.g. built assets)
  return Platform.OS === 'android' 
    ? 'http://10.0.2.2:5000/api' 
    : 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();

class APIClient {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.baseURL = BASE_URL;
  }

  /**
   * Initialize API client by loading tokens from AsyncStorage
   */
  async initialize() {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    } catch (error) {
      console.error('Error initializing API client:', error);
    }
  }

  /**
   * Generic fetch method with error handling and token refresh
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // If unauthorized, try to refresh token
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request
          headers.Authorization = `Bearer ${this.accessToken}`;
          response = await fetch(url, { ...options, headers });
        } else {
          // Refresh failed, logout user
          await this.logout();
          throw new Error('Token refresh failed. Please login again.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * Set tokens (called after login/signup)
   */
  async setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    try {
      if (!this.refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.refreshToken}`,
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return false;
      }

      this.accessToken = data.accessToken;
      await AsyncStorage.setItem('accessToken', data.accessToken);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Clear tokens
   */
  async logout() {
    this.accessToken = null;
    this.refreshToken = null;
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  }

  // ==================== AUTH ENDPOINTS ====================

  /**
   * Send OTP to email
   */
  async sendOTP(email, type = 'signup', phone = null) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, type, phone }),
    });
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email, otp, name = null, password = null, phone = null) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, name, password, phone }),
    });
  }

  /**
   * Direct password-based login
   */
  async login(emailOrPhone, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrPhone, password }),
    });
  }

  /**
   * Logout
   */
  async callLogout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    await this.logout();
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Verify password reset token
   */
  async verifyResetToken(email, token) {
    return this.request('/auth/verify-spendreset-token', {
      method: 'POST',
      body: JSON.stringify({ email, token }),
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(email, token, newPassword) {
    return this.request('/auth/spendreset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    });
  }

  // ==================== USER ENDPOINTS ====================

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    return this.request('/users/me');
  }

  /**
   * Update user profile
   */
  async updateUserProfile(data) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    return this.request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  /**
   * Register push token
   */
  async registerPushToken(token) {
    return this.request('/users/register-push-token', {
      method: 'POST',
      body: JSON.stringify({ token, expoPushToken: token }),
    });
  }

  /**
   * Enable notifications
   */
  async enableNotifications() {
    return this.request('/users/enable-notifications', { method: 'POST' });
  }

  /**
   * Disable notifications
   */
  async disableNotifications() {
    return this.request('/users/disable-notifications', { method: 'POST' });
  }

  /**
   * Dismiss notifications by adding dateKeys to user's list
   */
  async dismissNotifications(dateKeys) {
    return this.request('/users/dismiss-notifications', {
      method: 'POST',
      body: JSON.stringify({ dateKeys }),
    });
  }

  // ==================== EXPENSE ENDPOINTS ====================

  /**
   * Create expense with timestamps
   */
  async createExpense(expenseData) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  /**
   * Get all expenses with filters
   */
  async getExpenses(filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    if (filters.type) params.append('type', filters.type);

    return this.request(`/expenses?${params.toString()}`);
  }

  /**
   * Get single expense
   */
  async getExpense(id) {
    return this.request(`/expenses/${id}`);
  }

  /**
   * Update expense
   */
  async updateExpense(id, data) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete expense
   */
  async deleteExpense(id) {
    return this.request(`/expenses/${id}`, { method: 'DELETE' });
  }

  /**
   * Get today's expenses
   */
  async getTodayExpenses() {
    return this.request('/expenses/today');
  }

  /**
   * Get week expenses
   */
  async getWeekExpenses() {
    return this.request('/expenses/week');
  }

  /**
   * Get month expenses
   */
  async getMonthExpenses() {
    return this.request('/expenses/month');
  }

  /**
   * Get expenses by date
   */
  async getExpensesByDate(dateKey) {
    return this.request(`/expenses/date/${dateKey}`);
  }

  /**
   * Update split settlement
   */
  async updateSplitSettlement(expenseId, friendId, paid) {
    return this.request(`/expenses/${expenseId}/split/${friendId}`, {
      method: 'PUT',
      body: JSON.stringify({ paid }),
    });
  }

  /**
   * Settle all with friend
   */
  async settleAllWithFriend(friendId) {
    return this.request(`/expenses/settle/${friendId}`, { method: 'POST' });
  }

  // ==================== FRIEND ENDPOINTS ====================

  /**
   * Create friend with timestamps
   */
  async createFriend(friendData) {
    return this.request('/friends', {
      method: 'POST',
      body: JSON.stringify(friendData),
    });
  }

  /**
   * Get all friends with timestamps
   */
  async getFriends() {
    return this.request('/friends');
  }

  /**
   * Get single friend with balance
   */
  async getFriend(id) {
    return this.request(`/friends/${id}`);
  }

  /**
   * Update friend
   */
  async updateFriend(id, data) {
    return this.request(`/friends/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete friend
   */
  async deleteFriend(id) {
    return this.request(`/friends/${id}`, { method: 'DELETE' });
  }

  /**
   * Search friends
   */
  async searchFriends(query) {
    return this.request(`/friends/search?query=${encodeURIComponent(query)}`);
  }

  /**
   * Get friend balance
   */
  async getFriendBalance(friendId) {
    return this.request(`/friends/${friendId}/balance`);
  }

  // ==================== DAY COMPLETION ENDPOINTS ====================

  /**
   * Mark day as complete
   */
  async markDayComplete(date) {
    return this.request('/days/mark-complete', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  }

  /**
   * Mark day as incomplete
   */
  async markDayIncomplete(date) {
    return this.request('/days/unmark-complete', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  }

  /**
   * Get day status
   */
  async getDayStatus(dateKey) {
    return this.request(`/days/status/${dateKey}`);
  }

  /**
   * Get incomplete days
   */
  async getIncompleteDays(days = 7) {
    return this.request(`/days/incomplete?days=${days}`);
  }

  /**
   * Get day completions for date range
   */
  async getDayCompletions(startDate, endDate) {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    return this.request(`/days/completions?${params.toString()}`);
  }

  /**
   * Initialize days for a date range
   */
  async initializeDays(startDate, endDate) {
    return this.request('/days/initialize', {
      method: 'POST',
      body: JSON.stringify({ startDate, endDate }),
    });
  }

  // ==================== ANALYTICS ENDPOINTS ====================

  /**
   * Get category breakdown
   */
  async getCategoryBreakdown(filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);

    return this.request(`/analytics/breakdown?${params.toString()}`);
  }

  /**
   * Get top expenses
   */
  async getTopExpenses(limit = 10) {
    return this.request(`/analytics/top-expenses?limit=${limit}`);
  }

  /**
   * Get friend balance (analytics)
   */
  async getFriendBalanceAnalytics(friendId) {
    return this.request(`/analytics/friend-balance/${friendId}`);
  }

  /**
   * Get total balance
   */
  async getTotalBalance() {
    return this.request('/analytics/total-balance');
  }

  /**
   * Get spending trends
   */
  async getSpendingTrends(period = 'daily', days = 30) {
    return this.request(`/analytics/trends?period=${period}&days=${days}`);
  }

  // ==================== SYSTEM ENDPOINTS ====================

  /**
   * Get app version config
   */
  async getAppVersion(platform) {
    return this.request(`/version?platform=${platform}`);
  }
}

// Export singleton instance
export const apiClient = new APIClient();

export default apiClient;
