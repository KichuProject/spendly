/**
 * Test Data Seeding via API
 * Creates test data through running Express server
 * Access: GET /api/test/seed
 */

const router = require('express').Router();
const User = require('../models/User');
const Expense = require('../models/Expense');
const Friend = require('../models/Friend');
const { encryptPassword } = require('../utils/hashUtils');
const logger = require('../utils/logger');

const TEST_USERS = [
  {
    name: 'John Doe',
    email: 'testuser1@gmail.com',
    phone: '9876543210',
    currency: 'USD',
    expoPushToken: 'ExponentPushToken[test_token_1]',
    password: 'Test@123456',
  },
  {
    name: 'Jane Smith',
    email: 'testuser2@gmail.com',
    phone: '9876543211',
    currency: 'INR',
    expoPushToken: 'ExponentPushToken[test_token_2]',
    password: 'Test@123456',
  },
  {
    name: 'Admin User',
    email: 'kishorekichuper@gmail.com',
    phone: '9876543212',
    currency: 'USD',
    expoPushToken: 'ExponentPushToken[test_token_admin]',
    password: 'Test@123456',
  },
  {
    name: 'Test User 4',
    email: 'testuser4@gmail.com',
    phone: '9876543213',
    currency: 'EUR',
    expoPushToken: 'ExponentPushToken[test_token_4]',
    password: 'Test@123456',
  },
];

/**
 * GET /api/test/seed
 * Seeds database with test data
 */
router.get('/seed', async (req, res) => {
  try {
    logger.info('🔍 API Seed Route Called');
    
    // Clear existing test data
    logger.info('🗑️  Clearing existing test users...');
    await User.deleteMany({ email: { $in: TEST_USERS.map(u => u.email) } });
    await Expense.deleteMany({ userEmail: { $in: TEST_USERS.map(u => u.email) } });
    logger.info('✅ Test data cleared');

    // Create test users
    logger.info('👤 Creating test users...');
    const createdUsers = [];
    
    for (const userData of TEST_USERS) {
      // Encrypt password (reversible)
      const encryptedPassword = encryptPassword(userData.password);
      
      const user = new User({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        currency: userData.currency,
        expoPushToken: userData.expoPushToken,
        password: encryptedPassword,
      });
      
      await user.save();
      createdUsers.push(user);
      logger.info(`✅ User created: ${user.email}`);
    }

    // Create friend relationships
    logger.info('👥 Creating friend relationships...');
    if (createdUsers.length >= 2) {
      const friend1 = new Friend({
        userId: createdUsers[0]._id,
        name: createdUsers[1].name,
        email: createdUsers[1].email,
        phone: createdUsers[1].phone,
        status: 'accepted',
      });
      await friend1.save();

      const friend2 = new Friend({
        userId: createdUsers[1]._id,
        name: createdUsers[0].name,
        email: createdUsers[0].email,
        phone: createdUsers[0].phone,
        status: 'accepted',
      });
      await friend2.save();
      
      logger.info(`✅ Friendship: ${createdUsers[0].email} ↔ ${createdUsers[1].email}`);
    }

    // Create sample expenses
    logger.info('💰 Creating sample expenses...');
    const expenseCategories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health'];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const expense = new Expense({
        userId: createdUsers[0]._id,
        amount: Math.floor(Math.random() * 500) + 50,
        category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
        reason: `Sample expense ${i + 1}`,
        date: date,
        dateKey: dateKey,
        type: 'solo',
        splits: [],
      });
      await expense.save();
    }

    for (let i = 0; i < 8; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const expense = new Expense({
        userId: createdUsers[1]._id,
        amount: Math.floor(Math.random() * 300) + 100,
        category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
        reason: `Sample expense for user 2 - ${i + 1}`,
        date: date,
        dateKey: dateKey,
        type: 'solo',
        splits: [],
      });
      await expense.save();
    }

    logger.info('✅ Sample expenses created');

    // Return summary
    res.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        users: createdUsers.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          currency: u.currency,
          password: 'Test@123456 (hashed in DB)',
        })),
        summary: {
          usersCreated: createdUsers.length,
          friendshipCreated: createdUsers.length >= 2,
          expensesUser1: 12,
          expensesUser2: 8,
          totalExpenses: 20,
        },
      },
    });

  } catch (error) {
    logger.error('❌ Error seeding database:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error seeding database',
      error: error.message,
    });
  }
});

/**
 * GET /api/test/clear
 * Clear all test data
 */
router.get('/clear', async (req, res) => {
  try {
    logger.info('🗑️  Clearing all test data...');
    await User.deleteMany({ email: { $in: TEST_USERS.map(u => u.email) } });
    await Expense.deleteMany({ userEmail: { $in: TEST_USERS.map(u => u.email) } });
    await Friend.deleteMany({});
    
    res.json({
      success: true,
      message: 'All test data cleared',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/test/stats
 * Get database statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const expenseCount = await Expense.countDocuments();
    const friendCount = await Friend.countDocuments();
    const testUserCount = await User.countDocuments({
      email: { $in: TEST_USERS.map(u => u.email) },
    });

    res.json({
      success: true,
      stats: {
        totalUsers: userCount,
        testUsers: testUserCount,
        totalExpenses: expenseCount,
        totalFriendships: friendCount,
        testUsersList: TEST_USERS.map(u => u.email),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/test/users-with-passwords
 * Get all test users with decrypted passwords (for testing only!)
 */
router.get('/users-with-passwords', async (req, res) => {
  try {
    const { decryptPassword } = require('../utils/hashUtils');
    
    const testUsers = await User.find({
      email: { $in: TEST_USERS.map(u => u.email) },
    }).select('+password');

    const usersWithPasswords = testUsers.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      currency: user.currency,
      encryptedPassword: user.password,
      decryptedPassword: decryptPassword(user.password),
      createdAt: user.createdAt,
    }));

    res.json({
      success: true,
      message: '⚠️ PASSWORDS DECRYPTED - FOR TESTING ONLY!',
      users: usersWithPasswords,
    });
  } catch (error) {
    logger.error('Error fetching users with passwords:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/test/user-password/:email
 * Get a specific user's password decrypted
 */
router.get('/user-password/:email', async (req, res) => {
  try {
    const { decryptPassword } = require('../utils/hashUtils');
    const { email } = req.params;

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        encryptedPassword: user.password,
        decryptedPassword: decryptPassword(user.password),
      },
    });
  } catch (error) {
    logger.error('Error fetching user password:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
