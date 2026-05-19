/**
 * Friend Controller
 * Handles friend management operations
 */

const Friend = require('../models/Friend');
const Expense = require('../models/Expense');
const logger = require('../utils/logger');

// Gradient colors for friends
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

/**
 * Helper function to get initials from name
 */
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/**
 * Create friend with timestamps
 */
exports.createFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Friend name is required',
      });
    }

    // Check if friend already exists
    const existingFriend = await Friend.findOne({
      userId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });

    if (existingFriend) {
      return res.status(400).json({
        success: false,
        message: 'Friend already exists',
      });
    }

    // Get friend count to assign gradient
    const friendCount = await Friend.countDocuments({ userId });
    const gradientIndex = friendCount % FRIEND_GRADIENTS.length;

    const friend = new Friend({
      userId,
      name: name.trim(),
      initials: getInitials(name),
      gradientIndex,
      gradient: FRIEND_GRADIENTS[gradientIndex],
      email: email || null,
      phone: phone || null,
      notes: notes || null,
    });

    await friend.save();

    logger.info(`Friend created: ${friend._id} for user ${userId}`);

    res.status(201).json({
      success: true,
      data: friend,
      message: 'Friend added successfully',
    });
  } catch (error) {
    logger.error(`Error creating friend: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all friends for user with timestamps
 */
exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    const friends = await Friend.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: friends,
      count: friends.length,
    });
  } catch (error) {
    logger.error(`Error fetching friends: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get single friend with balance info
 */
exports.getFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const friend = await Friend.findOne({
      _id: id,
      userId,
    });

    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'Friend not found',
      });
    }

    // Calculate balance with this friend
    const expenses = await Expense.find({
      userId,
      'splits.friendId': id,
    });

    let theyOweMe = 0;
    let iOweThem = 0;
    let settled = 0;
    let unsettled = 0;

    expenses.forEach((exp) => {
      if (!exp.splits) return;
      const split = exp.splits.find((s) => s.friendId.toString() === id);
      if (!split) return;

      if (split.direction === 'theyOwe') {
        if (split.paid) {
          settled += split.amount;
        } else {
          unsettled += split.amount;
          theyOweMe += split.amount;
        }
      } else if (split.direction === 'iOwe') {
        if (split.paid) {
          settled += split.amount;
        } else {
          unsettled += split.amount;
          iOweThem += split.amount;
        }
      }
    });

    const friendWithBalance = {
      ...friend.toObject(),
      balance: {
        theyOweMe,
        iOweThem,
        settled,
        unsettled,
        net: theyOweMe - iOweThem,
      },
    };

    res.status(200).json({
      success: true,
      data: friendWithBalance,
    });
  } catch (error) {
    logger.error(`Error fetching friend: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update friend with timestamps
 */
exports.updateFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, email, phone, notes, gradient, gradientIndex } = req.body;

    const friend = await Friend.findOne({
      _id: id,
      userId,
    });

    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'Friend not found',
      });
    }

    // Update fields
    if (name !== undefined) {
      friend.name = name.trim();
      friend.initials = getInitials(name);
    }
    if (email !== undefined) friend.email = email;
    if (phone !== undefined) friend.phone = phone;
    if (notes !== undefined) friend.notes = notes;
    if (gradient !== undefined) friend.gradient = gradient;
    if (gradientIndex !== undefined) friend.gradientIndex = gradientIndex;

    await friend.save();

    logger.info(`Friend updated: ${id}`);

    res.status(200).json({
      success: true,
      data: friend,
      message: 'Friend updated successfully',
    });
  } catch (error) {
    logger.error(`Error updating friend: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete friend
 */
exports.deleteFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const friend = await Friend.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'Friend not found',
      });
    }

    // Note: We don't delete expenses, but you could update them
    logger.info(`Friend deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Friend deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting friend: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Search friends
 */
exports.searchFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const friends = await Friend.find({
      userId,
      name: { $regex: query, $options: 'i' },
    }).lean();

    res.status(200).json({
      success: true,
      data: friends,
      count: friends.length,
    });
  } catch (error) {
    logger.error(`Error searching friends: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get friend balance
 */
exports.getFriendBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const expenses = await Expense.find({
      userId,
      'splits.friendId': friendId,
    });

    let theyOweMe = 0;
    let iOweThem = 0;
    let settled = 0;
    let unsettled = 0;

    expenses.forEach((exp) => {
      if (!exp.splits) return;
      const split = exp.splits.find((s) => s.friendId.toString() === friendId);
      if (!split) return;

      if (split.direction === 'theyOwe') {
        if (split.paid) {
          settled += split.amount;
        } else {
          unsettled += split.amount;
          theyOweMe += split.amount;
        }
      } else if (split.direction === 'iOwe') {
        if (split.paid) {
          settled += split.amount;
        } else {
          unsettled += split.amount;
          iOweThem += split.amount;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        theyOweMe,
        iOweThem,
        settled,
        unsettled,
        net: theyOweMe - iOweThem,
      },
    });
  } catch (error) {
    logger.error(`Error fetching friend balance: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
