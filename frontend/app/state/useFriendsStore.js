import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../utils/apiClient';

const normalizeFriend = (friend) => {
  if (!friend) return friend;
  return {
    ...friend,
    id: friend._id || friend.id,
    _id: friend._id || friend.id,
    initials: friend.initials || getInitials(friend.name),
  };
};

const normalizeFriends = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeFriend);
};

const FRIEND_GRADIENTS = [
  ['#7C3AED', '#4F46E5'],
  ['#F43F5E', '#EC4899'],
  ['#0EA5E9', '#06B6D4'],
  ['#10B981', '#059669'],
  ['#F59E0B', '#D97706'],
  ['#8B5CF6', '#6D28D9'],
  ['#14B8A6', '#0D9488'],
  ['#E11D48', '#BE123C'],
  ['#6366F1', '#4338CA'],
  ['#D946EF', '#A855F7'],
];

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function toTitleCase(str) {
  if (!str) return '';
  return str
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

const useFriendsStore = create(
  persist(
    (set, get) => ({
      friends: [],
      isLoading: false,
      error: null,

      /**
       * Load friends from API with timestamps
       */
      loadFriends: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getFriends();
          if (response.success) {
            set({
              friends: normalizeFriends(response.data),
              isLoading: false,
            });
            return true;
          }
          throw new Error(response.message || 'Failed to load friends');
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          return false;
        }
      },

      /**
       * Add friend via API with timestamps
       */
      addFriend: async (name, email = null, phone = null) => {
        set({ isLoading: true, error: null });
        try {
          const friendData = {
            name: toTitleCase(name),
            email,
            phone,
          };

          const response = await apiClient.createFriend(friendData);
          if (response.success) {
            set((state) => ({
              friends: [normalizeFriend(response.data), ...state.friends],
              isLoading: false,
            }));
            return normalizeFriend(response.data);
          }
          throw new Error(response.message || 'Failed to create friend');
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Remove friend
       */
      removeFriend: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.deleteFriend(id);
          if (response.success) {
            set((state) => ({
              friends: state.friends.filter((f) => f._id !== id),
              isLoading: false,
            }));
            return true;
          }
          throw new Error(response.message || 'Failed to delete friend');
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          return false;
        }
      },

      /**
       * Update friend
       */
      updateFriend: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.updateFriend(id, data);
          if (response.success) {
            set((state) => ({
              friends: state.friends.map((f) => (f._id === id ? normalizeFriend(response.data) : f)),
              isLoading: false,
            }));
            return true;
          }
          throw new Error(response.message || 'Failed to update friend');
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          return false;
        }
      },

      /**
       * Get friend by ID
       */
      getFriend: (id) => {
        return get().friends.find((f) => f._id === id);
      },

      /**
       * Get friend by name
       */
      getFriendByName: (name) => {
        return get().friends.find((f) => f.name.toLowerCase() === name.toLowerCase());
      },

      /**
       * Search friends locally
       */
      searchFriends: (query) => {
        if (!query) return get().friends;
        const lower = query.toLowerCase();
        return get().friends.filter((f) => f.name.toLowerCase().includes(lower));
      },

      /**
       * Search friends via API
       */
      searchFriendsAPI: async (query) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.searchFriends(query);
          if (response.success) {
            set({ isLoading: false });
            return normalizeFriends(response.data);
          }
          throw new Error(response.message || 'Failed to search friends');
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          return [];
        }
      },

      /**
       * Get friend balance (local calculation)
       */
      getFriendBalance: (friendId, expenses) => {
        if (!friendId || !expenses) {
          return {
            theyOweMe: 0,
            iOweThem: 0,
            settled: 0,
            unsettled: 0,
            net: 0,
            totalShared: 0,
            greenPercent: 100,
            redPercent: 100,
            expenseCount: 0,
            lastExpense: null,
          };
        }
        const friendExp = get().getFriendExpenses(friendId, expenses);
        let greenSettled = 0;
        let greenUnsettled = 0;
        let redSettled = 0;
        let redUnsettled = 0;

        friendExp.forEach((exp) => {
          if (!exp.splits) return;
          const split = exp.splits.find((s) => s.friendId && s.friendId.toString() === friendId.toString());
          if (!split) return;

          if (split.direction === 'theyOwe') {
            if (split.paid) {
              greenSettled += split.amount;
            } else {
              greenUnsettled += split.amount;
            }
          } else {
            if (split.paid) {
              redSettled += split.amount;
            } else {
              redUnsettled += split.amount;
            }
          }
        });

        const greenTotal = greenSettled + greenUnsettled;
        const greenPercent = greenTotal > 0 ? (greenSettled / greenTotal) * 100 : 100;

        const redTotal = redSettled + redUnsettled;
        const redPercent = redTotal > 0 ? (redSettled / redTotal) * 100 : 100;

        // Find the most recent expense
        const sorted = [...friendExp].sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastExpense = sorted[0] || null;

        return {
          theyOweMe: greenUnsettled,
          iOweThem: redUnsettled,
          settled: greenSettled + redSettled,
          unsettled: greenUnsettled + redUnsettled,
          net: greenUnsettled - redUnsettled,
          totalShared: greenTotal + redTotal,
          greenPercent,
          redPercent,
          expenseCount: friendExp.length,
          lastExpense,
        };
      },

      /**
       * Get friend expenses (local calculation)
       */
      getFriendExpenses: (friendId, expenses) => {
        if (!friendId || !Array.isArray(expenses)) return [];
        return expenses.filter((exp) =>
          exp.splits && exp.splits.some((s) => s.friendId && s.friendId.toString() === friendId)
        );
      },

      /**
       * Get total balances with all friends (local calculation)
       */
      getTotalBalances: (expenses) => {
        const { friends } = get();
        let totalTheyOwe = 0;
        let totalIOwe = 0;

        friends.forEach((friend) => {
          const friendExp = get().getFriendExpenses(friend._id, expenses);
          let theyOweMe = 0;
          let iOweThem = 0;

          friendExp.forEach((exp) => {
            if (!exp.splits) return;
            const split = exp.splits.find((s) => s.friendId && s.friendId.toString() === friend._id);
            if (!split) return;

            if (split.direction === 'theyOwe') {
              if (!split.paid) theyOweMe += split.amount;
            } else {
              if (!split.paid) iOweThem += split.amount;
            }
          });

          totalTheyOwe += theyOweMe;
          totalIOwe += iOweThem;
        });

        return {
          totalTheyOwe,
          totalIOwe,
          net: totalTheyOwe - totalIOwe,
        };
      },
      clearData: () => {
        set({
          friends: [],
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'spendly-friends-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export { FRIEND_GRADIENTS, getInitials };
export default useFriendsStore;
