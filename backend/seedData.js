/**
 * Test Data Seeding Script
 * Populates MongoDB with test data for comprehensive testing
 * Run: node seedData.js (from backend directory)
 */

const mongoose = require('mongoose');
const { encryptPassword } = require('./src/utils/hashUtils');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Expense = require('./src/models/Expense');
const Friend = require('./src/models/Friend');

const logger = require('./src/utils/logger');

// Test data
const TEST_USERS = [
  {
    name: 'John Doe',
    email: 'testuser1@gmail.com',
    phone: '9876543210',
    currency: 'USD',
    expoPushToken: 'ExponentPushToken[test_token_1]',
  },
  {
    name: 'Jane Smith',
    email: 'testuser2@gmail.com',
    phone: '9876543211',
    currency: 'INR',
    expoPushToken: 'ExponentPushToken[test_token_2]',
  },
  {
    name: 'Admin User',
    email: 'kishorekichuper@gmail.com',
    phone: '9876543212',
    currency: 'USD',
    expoPushToken: 'ExponentPushToken[test_token_admin]',
  },
  {
    name: 'Test User 4',
    email: 'testuser4@gmail.com',
    phone: '9876543213',
    currency: 'EUR',
    expoPushToken: 'ExponentPushToken[test_token_4]',
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    logger.info('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('✅ MongoDB connected');

    // Clear existing test data (ONLY test users)
    logger.info('🗑️  Clearing existing test users...');
    await User.deleteMany({ email: { $in: TEST_USERS.map(u => u.email) } });
    await Expense.deleteMany({ userEmail: { $in: TEST_USERS.map(u => u.email) } });
    await Friend.deleteMany({});
    logger.info('✅ Test data cleared');

    // Create test users
    logger.info('👤 Creating test users...');
    const createdUsers = [];
    
    for (const userData of TEST_USERS) {
      const encryptedPassword = encryptPassword('Test@123456');
      
      const user = new User({
        ...userData,
        password: encryptedPassword,
      });
      
      await user.save();
      createdUsers.push(user);
      logger.info(`✅ User created: ${user.email}`);
    }

    // Create friend relationships
    logger.info('👥 Creating friend relationships...');
    if (createdUsers.length >= 2) {
      // Make user 1 and user 2 friends
      const friend1 = new Friend({
        userId: createdUsers[0]._id,
        friendId: createdUsers[1]._id,
        friendEmail: createdUsers[1].email,
        status: 'accepted',
      });
      await friend1.save();

      const friend2 = new Friend({
        userId: createdUsers[1]._id,
        friendId: createdUsers[0]._id,
        friendEmail: createdUsers[0].email,
        status: 'accepted',
      });
      await friend2.save();
      
      logger.info(`✅ Friendship created between ${createdUsers[0].email} and ${createdUsers[1].email}`);
    }

    // Create sample expenses for user 1
    logger.info('💰 Creating sample expenses...');
    const expenseCategories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health'];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const expense = new Expense({
        userId: createdUsers[0]._id,
        userEmail: createdUsers[0].email,
        amount: Math.floor(Math.random() * 500) + 50,
        category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
        description: `Sample expense ${i + 1}`,
        date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000), // Past days
        splitWith: [],
      });
      await expense.save();
      logger.info(`✅ Expense created: ${expense.category} - $${expense.amount}`);
    }

    // Create sample expenses for user 2
    for (let i = 0; i < 8; i++) {
      const expense = new Expense({
        userId: createdUsers[1]._id,
        userEmail: createdUsers[1].email,
        amount: Math.floor(Math.random() * 300) + 100,
        category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
        description: `Sample expense for user 2 - ${i + 1}`,
        date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
        splitWith: [],
      });
      await expense.save();
      logger.info(`✅ Expense created for user 2: ${expense.category} - $${expense.amount}`);
    }

    // Print summary
    logger.info('');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('📊 DATABASE SEEDING COMPLETE!');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('');
    logger.info('📝 Test Users Created:');
    for (const user of createdUsers) {
      logger.info(`   • Email: ${user.email}`);
      logger.info(`     Password: Test@123456`);
      logger.info(`     Name: ${user.name}`);
      logger.info(`     Phone: ${user.phone}`);
      logger.info(`     Currency: ${user.currency}`);
      logger.info(`     User ID: ${user._id}`);
      logger.info('');
    }

    logger.info('💰 Sample Expenses:');
    logger.info(`   • User 1 (${createdUsers[0].email}): 12 expenses created`);
    logger.info(`   • User 2 (${createdUsers[1].email}): 8 expenses created`);
    logger.info('');

    logger.info('👥 Friend Relationships:');
    logger.info(`   • ${createdUsers[0].email} ↔ ${createdUsers[1].email} (accepted)`);
    logger.info('');

    logger.info('🧪 TESTING READY!');
    logger.info('');
    logger.info('✅ Frontend can now login with:');
    logger.info(`   Email: testuser1@gmail.com`);
    logger.info(`   Phone: 9876543210`);
    logger.info(`   (OTP will be sent to email)`);
    logger.info('');

    logger.info('🔐 Password Reset Testing:');
    logger.info('   POST /api/auth/forgot-password');
    logger.info('   Email: testuser1@gmail.com');
    logger.info('   → Token will be saved to database');
    logger.info('   → Email with reset link will be sent');
    logger.info('');

    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('');

    await mongoose.connection.close();
    logger.info('🔌 MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
