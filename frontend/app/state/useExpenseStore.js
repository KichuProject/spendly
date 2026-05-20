import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toDateKey, isSameDay, getStartOfWeek, getStartOfMonth, getStartOfDay, parseDateSafely } from '../utils/dateUtils';
import { getCategoryInfo, getCategoryColorByName } from '../utils/categoryUtils';
import { apiClient } from '../utils/apiClient';

const normalizeExpense = (exp) => {
  if (!exp) return exp;
  return {
    ...exp,
    id: exp._id || exp.id,
    _id: exp._id || exp.id,
    categoryColor: exp.categoryColor || getCategoryColorByName(exp.category || 'Other'),
  };
};

const normalizeExpenses = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeExpense);
};

const useExpenseStore = create(
  persist(
    (set, get) => ({
      expenses: [],
      dayCompletions: {},
      pastReasons: [],
      isLoading: false,
      error: null,
      lastSyncTime: null,
      installDate: null,

      setInstallDate: (date) => set({ installDate: date }),

      /**
       * Load expenses from API
       */
      loadExpenses: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getExpenses(filters);
          if (response.success) {
            // Extract past reasons from expenses
            const reasons = new Set();
            response.data.forEach((exp) => {
              reasons.add(exp.reason.toLowerCase());
            });

            set({
              expenses: normalizeExpenses(response.data),
              pastReasons: Array.from(reasons),
              isLoading: false,
              lastSyncTime: new Date().toISOString(),
            });
            return true;
          }
          throw new Error(response.message || 'Failed to load expenses');
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          return false;
        }
      },

      /**
       * Load today's expenses
       */
      loadTodayExpenses: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getTodayExpenses();
          if (response.success) {
            set({
              expenses: normalizeExpenses(response.data),
              isLoading: false,
            });
            return true;
          }
          return false;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      /**
       * Load week expenses
       */
      loadWeekExpenses: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getWeekExpenses();
          if (response.success) {
            set({
              expenses: normalizeExpenses(response.data),
              isLoading: false,
            });
            return true;
          }
          return false;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      /**
       * Load month expenses
       */
      loadMonthExpenses: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getMonthExpenses();
          if (response.success) {
            set({
              expenses: normalizeExpenses(response.data),
              isLoading: false,
            });
            return true;
          }
          return false;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      /**
       * Create expense with API
       */
      addExpense: async (expense) => {
        set({ isLoading: true, error: null });
        try {
          const expenseData = {
            amount: expense.amount,
            reason: expense.reason,
            category: expense.category,
            emoji: expense.emoji,
            date: expense.date || new Date().toISOString(),
            type: expense.type || 'solo',
            splits: expense.splits || [],
            notes: expense.notes || null,
            paymentMethod: expense.paymentMethod || 'cash',
          };

          const response = await apiClient.createExpense(expenseData);
          if (response.success) {
            // Add to local state
            set((state) => {
              const reasons = state.pastReasons.includes(expense.reason.toLowerCase())
                ? state.pastReasons
                : [...state.pastReasons, expense.reason.toLowerCase()];
              return {
                expenses: [normalizeExpense(response.data), ...state.expenses],
                pastReasons: reasons,
                isLoading: false,
              };
            });
            return response.data;
          }
          throw new Error(response.message || 'Failed to create expense');
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Update expense
       */
      updateExpense: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.updateExpense(id, updates);
          if (response.success) {
            set((state) => ({
              expenses: state.expenses.map((e) => (e._id === id ? normalizeExpense(response.data) : e)),
              isLoading: false,
            }));
            return true;
          }
          throw new Error(response.message || 'Failed to update expense');
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      /**
       * Delete expense
       */
      deleteExpense: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.deleteExpense(id);
          if (response.success) {
            set((state) => ({
              expenses: state.expenses.filter((e) => e._id !== id),
              isLoading: false,
            }));
            return true;
          }
          throw new Error(response.message || 'Failed to delete expense');
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      /**
       * Update split settlement
       */
      updateSplitSettlement: async (expenseId, friendId, paid) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.updateSplitSettlement(expenseId, friendId, paid);
          if (response.success) {
            set((state) => ({
              expenses: state.expenses.map((e) => (e._id === expenseId ? normalizeExpense(response.data) : e)),
              isLoading: false,
            }));
            return true;
          }
          throw new Error(response.message || 'Failed to update split');
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      /**
       * Settle all with friend
       */
      settleAllWithFriend: async (friendId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.settleAllWithFriend(friendId);
          if (response.success) {
            // Reload expenses
            await get().loadExpenses();
            return true;
          }
          throw new Error(response.message || 'Failed to settle');
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      loadDayCompletions: async () => {
        set({ isLoading: true, error: null });
        try {
          const installDate = get().installDate;
          const startLimit = installDate ? toDateKey(parseDateSafely(installDate)) : toDateKey(new Date(Date.now() - 30 * 86400000));
          const endLimit = toDateKey(new Date());

          const response = await apiClient.getDayCompletions(startLimit, endLimit);
          if (response.success) {
            const completions = {};
            response.data.forEach((item) => {
              completions[item.dateKey] = item.isComplete;
            });
            set({
              dayCompletions: completions,
              isLoading: false,
            });
            get().syncNotifications();
            return true;
          }
          return false;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      /**
       * Mark day complete
       */
      markDayComplete: async (date) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.markDayComplete(date);
          if (response.success) {
            const dateKey = toDateKey(parseDateSafely(date));
            set((state) => ({
              dayCompletions: { ...state.dayCompletions, [dateKey]: true },
              isLoading: false,
            }));
            get().syncNotifications();
            return true;
          }
          throw new Error(response.message || 'Failed to mark day complete');
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      /**
       * Mark day incomplete
       */
      unmarkDayComplete: async (date) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.markDayIncomplete(date);
          if (response.success) {
            const dateKey = toDateKey(parseDateSafely(date));
            set((state) => {
              const copy = { ...state.dayCompletions };
              delete copy[dateKey];
              return { dayCompletions: copy, isLoading: false };
            });
            get().syncNotifications();
            return true;
          }
          throw new Error(response.message || 'Failed to unmark day complete');
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      isDayComplete: (dateKey) => {
        return get().dayCompletions[dateKey] === true;
      },

      // Local queries (operate on already-loaded expenses)
      getDayExpenses: (date) => {
        return get().expenses.filter((e) => isSameDay(e.date, date));
      },

      getDayTotal: (date) => {
        return get().expenses
          .filter((e) => isSameDay(e.date, date))
          .reduce((sum, e) => sum + e.amount, 0);
      },

      getExpensesByDateRange: (start, end) => {
        const s = getStartOfDay(start).getTime();
        const e = parseDateSafely(end);
        e.setHours(23, 59, 59, 999);
        const endTime = e.getTime();
        return get().expenses.filter((exp) => {
          const t = parseDateSafely(exp.date).getTime();
          return t >= s && t <= endTime;
        });
      },

      getMonthTotal: (date) => {
        const d = date ? parseDateSafely(date) : new Date();
        const start = getStartOfMonth(d);
        const end = parseDateSafely(d);
        end.setHours(23, 59, 59, 999);
        return get().expenses
          .filter((e) => {
            const t = parseDateSafely(e.date);
            return t >= start && t <= end;
          })
          .reduce((sum, e) => sum + e.amount, 0);
      },

      getWeekTotal: () => {
        const now = new Date();
        const start = getStartOfWeek(now);
        const end = parseDateSafely(now);
        end.setHours(23, 59, 59, 999);
        return get().expenses
          .filter((e) => {
            const t = parseDateSafely(e.date);
            return t >= start && t <= end;
          })
          .reduce((sum, e) => sum + e.amount, 0);
      },

      getTodayTotal: () => {
        return get().getDayTotal(new Date());
      },

      getIncompleteDays: () => {
        const { dayCompletions, installDate } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startLimit = installDate ? getStartOfDay(installDate) : new Date(today.getTime() - 7 * 86400000);
        const uniqueDays = new Set();

        const current = new Date(startLimit.getTime());
        
        // Only include "Today" in incomplete counts if it is past 10:00 PM local time
        const isPast10PM = new Date().getHours() >= 22;
        const endLimit = isPast10PM ? today : new Date(today.getTime() - 86400000);

        while (current <= endLimit) {
          const dk = toDateKey(current);
          if (!dayCompletions[dk]) {
            uniqueDays.add(dk);
          }
          current.setDate(current.getDate() + 1);
        }

        return Array.from(uniqueDays);
      },

      getUniqueDates: () => {
        const dates = new Set();
        get().expenses.forEach((e) => dates.add(toDateKey(e.date)));
        return Array.from(dates).sort().reverse();
      },

      getCategoryBreakdown: (startDate, endDate) => {
        const filtered = endDate
          ? get().getExpensesByDateRange(startDate, endDate)
          : get().expenses;
        const breakdown = {};
        filtered.forEach((e) => {
          const cat = e.category || 'Other';
          if (!breakdown[cat]) {
            breakdown[cat] = { name: cat, emoji: e.emoji, color: getCategoryColorByName(cat), total: 0, count: 0 };
          }
          breakdown[cat].total += e.amount;
          breakdown[cat].count += 1;
        });
        return Object.values(breakdown).sort((a, b) => b.total - a.total);
      },

      getTopExpenses: (limit = 5, startDate, endDate) => {
        const filtered = endDate
          ? get().getExpensesByDateRange(startDate, endDate)
          : get().expenses;
        return [...filtered].sort((a, b) => b.amount - a.amount).slice(0, limit);
      },
      notificationsList: [],

      syncNotifications: () => {
        const { dayCompletions, installDate, notificationsList } = get();
        if (!installDate) return;

        // Retrieve db-dismissed keys from user profile to prevent re-adding
        const useAuthStore = require('./useAuthStore').default;
        const { user } = useAuthStore.getState();
        const dbDeleted = user?.deletedNotifications || [];

        const startLimit = getStartOfDay(installDate);
        const isPast10PM = new Date().getHours() >= 22;
        const maxDay = isPast10PM ? new Date() : new Date(Date.now() - 86400000);
        const today = getStartOfDay(maxDay);
        const days = [];
        const current = new Date(today);
        
        while (current >= startLimit) {
          days.push(new Date(current));
          current.setDate(current.getDate() - 1);
        }

        const existingMap = {};
        (notificationsList || []).forEach(n => {
          existingMap[n.dateKey] = n;
        });

        const updatedList = [];
        days.forEach(day => {
          const dateKey = toDateKey(day);
          const isComplete = dayCompletions[dateKey] === true;

          const existing = existingMap[dateKey];
          const isDbDeleted = dbDeleted.includes(dateKey);
          
          if (isDbDeleted || (existing && existing.deleted)) {
            updatedList.push({
              id: dateKey,
              dateKey,
              isSolved: isComplete,
              deleted: true,
            });
            return;
          }

          if (!isComplete || existing) {
            updatedList.push({
              id: dateKey,
              dateKey,
              isSolved: isComplete,
              deleted: false,
            });
          }
        });

        updatedList.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
        set({ notificationsList: updatedList });
      },

      deleteNotification: async (dateKey) => {
        // Optimistic local update
        set((state) => ({
          notificationsList: (state.notificationsList || []).map(n =>
            n.dateKey === dateKey ? { ...n, deleted: true } : n
          )
        }));

        try {
          const response = await apiClient.dismissNotifications([dateKey]);
          if (response.success && response.deletedNotifications) {
            const useAuthStore = require('./useAuthStore').default;
            useAuthStore.setState((state) => ({
              user: state.user ? { ...state.user, deletedNotifications: response.deletedNotifications } : null
            }));
          }
        } catch (err) {
          console.error('Failed to dismiss notification in DB:', err);
        }
      },

      clearAllNotifications: async () => {
        const visible = (get().notificationsList || []).filter(n => !n.deleted);
        const keys = visible.map(n => n.dateKey);
        
        if (keys.length === 0) return;

        // Optimistic local update
        set((state) => ({
          notificationsList: (state.notificationsList || []).map(n => ({ ...n, deleted: true }))
        }));

        try {
          const response = await apiClient.dismissNotifications(keys);
          if (response.success && response.deletedNotifications) {
            const useAuthStore = require('./useAuthStore').default;
            useAuthStore.setState((state) => ({
              user: state.user ? { ...state.user, deletedNotifications: response.deletedNotifications } : null
            }));
          }
        } catch (err) {
          console.error('Failed to clear notifications in DB:', err);
        }
      },

      clearData: () => {
        set({
          expenses: [],
          dayCompletions: {},
          pastReasons: [],
          isLoading: false,
          error: null,
          lastSyncTime: null,
          installDate: null,
          notificationsList: [],
        });
      },
    }),
    {
      name: 'spendly-expenses-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useExpenseStore;
