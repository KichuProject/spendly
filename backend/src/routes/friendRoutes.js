/**
 * Friend Routes
 * Manage friends for split expenses with timestamps
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  createFriend,
  getFriends,
  getFriend,
  updateFriend,
  deleteFriend,
  searchFriends,
  getFriendBalance,
} = require('../controllers/friendController');

router.use(authMiddleware);

/**
 * POST /api/friends
 * Create friend with timestamps
 */
router.post('/', createFriend);

/**
 * GET /api/friends
 * Get all friends with timestamps
 */
router.get('/', getFriends);

/**
 * GET /api/friends/search?query=
 * Search friends
 */
router.get('/search', searchFriends);

/**
 * GET /api/friends/:id
 * Get friend with balance
 */
router.get('/:id', getFriend);

/**
 * GET /api/friends/:friendId/balance
 * Get friend balance
 */
router.get('/:friendId/balance', getFriendBalance);

/**
 * PUT /api/friends/:id
 * Update friend with timestamps
 */
router.put('/:id', updateFriend);

/**
 * DELETE /api/friends/:id
 * Delete friend
 */
router.delete('/:id', deleteFriend);

module.exports = router;
