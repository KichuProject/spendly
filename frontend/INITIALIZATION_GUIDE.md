/**
 * Example: How to Initialize Stores on App Start
 * 
 * This should be added to App.js or a useEffect hook
 */

import { useEffect } from 'react';
import useAuthStore from './app/state/useAuthStore';
import useExpenseStore from './app/state/useExpenseStore';
import useFriendsStore from './app/state/useFriendsStore';

// Add this to App.js useEffect hook:
export function initializeApp() {
  useEffect(() => {
    const setupApp = async () => {
      // 1. Initialize auth - check if user is already logged in
      const authStore = useAuthStore.getState();
      await authStore.initialize();

      // Check if user is authenticated
      if (authStore.isAuthenticated) {
        // 2. Load user's friends from database
        const friendsStore = useFriendsStore.getState();
        await friendsStore.loadFriends();

        // 3. Load user's expenses from database
        const expenseStore = useExpenseStore.getState();
        await expenseStore.loadExpenses();

        // 4. Optional: Load today's expenses for quick access
        // await expenseStore.loadTodayExpenses();
      }
    };

    setupApp();
  }, []);
}

/**
 * Example: Screen Initialization Patterns
 */

// ============ HomeScreen ============
// When user navigates to home, ensure latest data:
export function HomeScreenExample() {
  useEffect(() => {
    const loadData = async () => {
      const expenseStore = useExpenseStore.getState();
      
      // Based on active filter:
      if (filter === 'today') {
        await expenseStore.loadTodayExpenses();
      } else if (filter === 'week') {
        await expenseStore.loadWeekExpenses();
      } else if (filter === 'month') {
        await expenseStore.loadMonthExpenses();
      } else {
        await expenseStore.loadExpenses();
      }
    };

    loadData();
  }, [filter]); // Re-load when filter changes
}

// ============ FriendsScreen ============
// Load friends and their balances:
export function FriendsScreenExample() {
  useEffect(() => {
    const loadData = async () => {
      const friendsStore = useFriendsStore.getState();
      const expenseStore = useExpenseStore.getState();

      // Load friends
      await friendsStore.loadFriends();

      // Load expenses (for balance calculation)
      await expenseStore.loadExpenses();
    };

    loadData();
  }, []);
}

// ============ AddExpenseSheet ============
// When submitting a new expense:
export async function handleAddExpense(expenseData) {
  const expenseStore = useExpenseStore.getState();

  try {
    // This creates in DB with timestamps
    const newExpense = await expenseStore.addExpense({
      amount: 500,
      reason: 'Coffee',
      date: new Date().toISOString(),
      type: 'solo', // or 'split'
      splits: [], // Add friend splits here if type is 'split'
    });

    // Expense now has: _id, createdAt, updatedAt in MongoDB
    console.log('Created expense:', newExpense);

    // Optionally reload expenses
    await expenseStore.loadExpenses();
  } catch (error) {
    console.error('Error adding expense:', error.message);
  }
}

// ============ AddFriendSheet ============
// When adding a new friend:
export async function handleAddFriend(name) {
  const friendsStore = useFriendsStore.getState();

  try {
    // This creates in DB with timestamps and auto-assigned gradient
    const newFriend = await friendsStore.addFriend(
      name,
      'email@example.com', // optional
      '+1234567890' // optional
    );

    // Friend now has: _id, name, gradient, createdAt, updatedAt in MongoDB
    console.log('Created friend:', newFriend);

    // Optionally reload friends
    await friendsStore.loadFriends();
  } catch (error) {
    console.error('Error adding friend:', error.message);
  }
}

// ============ DayDetailScreen ============
// When marking a day as complete:
export async function handleMarkDayComplete(date) {
  const expenseStore = useExpenseStore.getState();

  try {
    // This marks day complete with completedAt timestamp
    await expenseStore.markDayComplete(date);

    console.log('Day marked complete');

    // Optionally refresh day completions
    // This updates dayCompletions in state
  } catch (error) {
    console.error('Error marking day complete:', error.message);
  }
}

// ============ ExpenseCard (Edit) ============
// When updating an expense:
export async function handleUpdateExpense(expenseId, updates) {
  const expenseStore = useExpenseStore.getState();

  try {
    // This updates in DB, timestamp is auto-updated by MongoDB
    await expenseStore.updateExpense(expenseId, {
      amount: 600, // new amount
      reason: 'Lunch', // new reason
      // Other fields: category, splits, etc.
    });

    console.log('Expense updated (with new updatedAt timestamp)');

    // Optionally reload to get latest
    await expenseStore.loadExpenses();
  } catch (error) {
    console.error('Error updating expense:', error.message);
  }
}

// ============ ExpenseCard (Delete) ============
// When deleting an expense:
export async function handleDeleteExpense(expenseId) {
  const expenseStore = useExpenseStore.getState();

  try {
    // This deletes from DB
    await expenseStore.deleteExpense(expenseId);

    console.log('Expense deleted');

    // Optionally reload expenses
    await expenseStore.loadExpenses();
  } catch (error) {
    console.error('Error deleting expense:', error.message);
  }
}

// ============ SplitSettlement ============
// When marking a split as paid:
export async function handleMarkSplitPaid(expenseId, friendId) {
  const expenseStore = useExpenseStore.getState();

  try {
    // This updates split.paid and saves to DB
    await expenseStore.updateSplitSettlement(expenseId, friendId, true);

    console.log('Split marked as paid');

    // Optionally reload expenses
    await expenseStore.loadExpenses();
  } catch (error) {
    console.error('Error updating split:', error.message);
  }
}

// ============ LoginScreen ============
// When user enters OTP:
export async function handleLoginOTP(email, otp, name) {
  const authStore = useAuthStore.getState();
  const friendsStore = useFriendsStore.getState();
  const expenseStore = useExpenseStore.getState();

  try {
    // Verify OTP via API
    const success = await authStore.verifyOtp(otp);

    if (success) {
      console.log('Login successful!');
      // Tokens are now stored in AsyncStorage

      // Load user data
      await friendsStore.loadFriends();
      await expenseStore.loadExpenses();

      // Navigate to home screen
      navigation.replace('Home');
    }
  } catch (error) {
    console.error('Error verifying OTP:', error.message);
  }
}

// ============ SettingsScreen (Logout) ============
// When user wants to logout:
export async function handleLogout() {
  const authStore = useAuthStore.getState();

  try {
    // This calls API logout + clears tokens
    await authStore.logout();

    console.log('Logged out successfully');

    // Navigate to login screen
    navigation.replace('Login');
  } catch (error) {
    console.error('Error logging out:', error.message);
  }
}

/**
 * Error Handling Pattern
 */
export function useExpenseWithErrorHandling() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const expenseStore = useExpenseStore.getState();

  const loadExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      await expenseStore.loadExpenses();
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  return { loadExpenses, loading, error };
}

/**
 * Offline Support Pattern
 * AsyncStorage caches latest data, so app works offline
 */
export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(true);
  const expenseStore = useExpenseStore.getState();

  useEffect(() => {
    // Monitor connectivity
    const subscription = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);

      // When coming online, sync data
      if (state.isConnected) {
        expenseStore.loadExpenses();
      }
    });

    return () => subscription?.();
  }, []);

  return { isOnline };
}
