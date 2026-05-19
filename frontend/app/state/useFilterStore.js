import { create } from 'zustand';

const useFilterStore = create((set) => ({
  // Home screen filter
  homeFilter: 'past7',
  homeCustomRange: null,
  setHomeFilter: (filter) => set({ homeFilter: filter }),
  setHomeCustomRange: (range) => set({ homeCustomRange: range, homeFilter: 'custom' }),

  // Day detail filter
  dayDetailFilter: 'all',
  setDayDetailFilter: (filter) => set({ dayDetailFilter: filter }),

  // Friends screen filter
  friendsFilter: 'all',
  friendsDateRange: null,
  setFriendsFilter: (filter) => set({ friendsFilter: filter }),
  setFriendsDateRange: (range) => set({ friendsDateRange: range }),

  // Friend detail filter
  friendDetailFilter: 'all',
  friendDetailDateRange: null,
  friendDetailDay: null,
  setFriendDetailFilter: (filter) => set({ friendDetailFilter: filter }),
  setFriendDetailDateRange: (range) => set({ friendDetailDateRange: range }),
  setFriendDetailDay: (day) => set({ friendDetailDay: day }),

  // Stats filter
  statsTimeframe: 'daily',
  statsDateRange: null,
  statsCategory: 'all',
  statsMonth: new Date(),
  setStatsTimeframe: (tf) => set({ statsTimeframe: tf }),
  setStatsDateRange: (range) => set({ statsDateRange: range }),
  setStatsCategory: (cat) => set({ statsCategory: cat }),
  setStatsMonth: (month) => set({ statsMonth: month }),

  // Reset
  resetAllFilters: () => set({
    homeFilter: 'past7',
    homeCustomRange: null,
    dayDetailFilter: 'all',
    friendsFilter: 'all',
    friendsDateRange: null,
    friendDetailFilter: 'all',
    friendDetailDateRange: null,
    friendDetailDay: null,
    statsTimeframe: 'daily',
    statsDateRange: null,
    statsCategory: 'all',
  }),
}));

export default useFilterStore;
