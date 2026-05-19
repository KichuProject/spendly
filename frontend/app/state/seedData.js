import { toDateKey } from '../utils/dateUtils';
import { getCategoryInfo } from '../utils/categoryUtils';

// Fixed baseline date (Monday, 18 May 2026) to lock mock expenses to their calendar days
const BASELINE_DATE = new Date('2026-05-18T12:00:00');

// Generate a date N days ago relative to the fixed baseline date
function daysAgo(n) {
  const d = new Date(BASELINE_DATE);
  d.setDate(d.getDate() - n);
  d.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

function makeId(prefix, n) {
  return `${prefix}_${n}_${Math.random().toString(36).substr(2, 5)}`;
}

// Friends seed data
export const SEED_FRIENDS = [
  { id: 'f1', name: 'Arjun Mehta', initials: 'AM', gradientIndex: 0, gradient: ['#7C3AED', '#4F46E5'], createdAt: daysAgo(30) },
  { id: 'f2', name: 'Priya Sharma', initials: 'PS', gradientIndex: 1, gradient: ['#F43F5E', '#EC4899'], createdAt: daysAgo(25) },
  { id: 'f3', name: 'Rahul Kumar', initials: 'RK', gradientIndex: 2, gradient: ['#0EA5E9', '#06B6D4'], createdAt: daysAgo(20) },
  { id: 'f4', name: 'Sneha Patel', initials: 'SP', gradientIndex: 3, gradient: ['#10B981', '#059669'], createdAt: daysAgo(15) },
  { id: 'f5', name: 'Vikram Reddy', initials: 'VR', gradientIndex: 4, gradient: ['#F59E0B', '#D97706'], createdAt: daysAgo(10) },
];

// Expense seed data
const rawExpenses = [
  // Yesterday / Past Days
  { reason: 'Morning Coffee', amount: 180, daysAgo: 1, type: 'solo' },
  { reason: 'Uber to Office', amount: 250, daysAgo: 1, type: 'solo' },
  { reason: 'Team Lunch', amount: 1200, daysAgo: 1, type: 'split', friends: ['f1', 'f2'], direction: 'theyOwe' },

  // Yesterday
  { reason: 'Grocery Shopping', amount: 850, daysAgo: 1, type: 'solo' },
  { reason: 'Netflix Subscription', amount: 649, daysAgo: 1, type: 'split', friends: ['f3'], direction: 'theyOwe' },
  { reason: 'Dinner at Restaurant', amount: 1600, daysAgo: 1, type: 'split', friends: ['f1', 'f4'], direction: 'theyOwe' },

  // 2 days ago
  { reason: 'Petrol', amount: 1500, daysAgo: 2, type: 'solo' },
  { reason: 'Movie Tickets', amount: 800, daysAgo: 2, type: 'split', friends: ['f2', 'f5'], direction: 'theyOwe', somePaid: true },
  { reason: 'Popcorn & Drinks', amount: 450, daysAgo: 2, type: 'split', friends: ['f2', 'f5'], direction: 'theyOwe' },

  // 3 days ago
  { reason: 'Zomato Order', amount: 520, daysAgo: 3, type: 'solo' },
  { reason: 'Auto Rickshaw', amount: 80, daysAgo: 3, type: 'solo' },
  { reason: 'Electricity Bill', amount: 2200, daysAgo: 3, type: 'solo' },

  // 4 days ago
  { reason: 'Lunch with Priya', amount: 900, daysAgo: 4, type: 'split', friends: ['f2'], direction: 'iOwe', paid: true },
  { reason: 'Books from Amazon', amount: 1350, daysAgo: 4, type: 'solo' },

  // 5 days ago
  { reason: 'Gym Membership', amount: 3000, daysAgo: 5, type: 'solo' },
  { reason: 'Protein Shake', amount: 180, daysAgo: 5, type: 'solo' },

  // 6 days ago
  { reason: 'Swiggy Order', amount: 380, daysAgo: 6, type: 'solo' },
  { reason: 'Trip Planning Contribution', amount: 5000, daysAgo: 6, type: 'split', friends: ['f1', 'f3', 'f5'], direction: 'theyOwe' },

  // 7 days ago
  { reason: 'Haircut at Salon', amount: 500, daysAgo: 7, type: 'solo' },
  { reason: 'Phone Recharge', amount: 599, daysAgo: 7, type: 'solo' },

  // 8 days ago
  { reason: 'Coffee with Sneha', amount: 450, daysAgo: 8, type: 'split', friends: ['f4'], direction: 'iOwe' },
  { reason: 'Metro Card Recharge', amount: 500, daysAgo: 8, type: 'solo' },

  // 9 days ago
  { reason: 'Breakfast at Cafe', amount: 350, daysAgo: 9, type: 'solo' },
  { reason: 'Office Stationery', amount: 280, daysAgo: 9, type: 'solo' },

  // 10 days ago
  { reason: 'Birthday Gift for Rahul', amount: 1500, daysAgo: 10, type: 'split', friends: ['f1', 'f2', 'f4'], direction: 'theyOwe', somePaid: true },
  { reason: 'Uber Pool', amount: 120, daysAgo: 10, type: 'solo' },

  // 11 days ago
  { reason: 'Weekly Vegetables', amount: 650, daysAgo: 11, type: 'solo' },
  { reason: 'Laundry Service', amount: 400, daysAgo: 11, type: 'solo' },

  // 12 days ago
  { reason: 'Dinner Split with Vikram', amount: 2200, daysAgo: 12, type: 'split', friends: ['f5'], direction: 'theyOwe', paid: true },
  { reason: 'Ice Cream', amount: 200, daysAgo: 12, type: 'solo' },

  // 13 days ago
  { reason: 'Spotify Annual Plan', amount: 1189, daysAgo: 13, type: 'split', friends: ['f3'], direction: 'theyOwe' },
  { reason: 'Auto to Mall', amount: 150, daysAgo: 13, type: 'solo' },
  { reason: 'Shopping — New Shoes', amount: 3500, daysAgo: 13, type: 'solo' },

  // 14 days ago
  { reason: 'Chai & Samosa', amount: 60, daysAgo: 14, type: 'solo' },
  { reason: 'Medicine from Pharmacy', amount: 320, daysAgo: 14, type: 'solo' },
  { reason: 'Water Bill', amount: 450, daysAgo: 14, type: 'solo' },
];

function buildExpense(raw, idx, installDate) {
  const info = getCategoryInfo(raw.reason);
  const base = installDate ? new Date(installDate) : new Date();
  base.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
  const dateStr = base.toISOString();
  
  const expense = {
    id: makeId('exp', idx),
    reason: raw.reason,
    amount: raw.amount,
    date: dateStr,
    type: raw.type,
    emoji: info.emoji,
    category: info.name,
    categoryColor: info.color,
    createdAt: dateStr,
    splits: null,
  };

  if (raw.type === 'split' && raw.friends) {
    const shareAmount = Math.round(raw.amount / (raw.friends.length + 1));
    expense.splits = raw.friends.map((fId, i) => ({
      friendId: fId,
      friendName: SEED_FRIENDS.find((f) => f.id === fId)?.name || 'Unknown',
      amount: shareAmount,
      direction: raw.direction || 'theyOwe',
      paid: raw.paid || (raw.somePaid && i === 0) || false,
    }));
  }

  return expense;
}

export function getSeedData(installDate) {
  const expenses = rawExpenses.map((raw, idx) => buildExpense(raw, idx, installDate));

  // No past completed days since installation starts on day 0
  const dayCompletions = {};

  // Build past reasons
  const pastReasons = [...new Set(rawExpenses.map((r) => r.reason.toLowerCase()))];

  return {
    expenses,
    dayCompletions,
    pastReasons,
  };
}
