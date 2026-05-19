const express = require('express');
const router = express.Router();
const versionController = require('../controllers/versionController');
const { authMiddleware } = require('../middlewares/authMiddleware'); 

// Public route to check version
router.get('/', versionController.getVersion);

// Protected route to update version (Could add admin middleware here)
router.post('/', authMiddleware, versionController.updateVersion);

module.exports = router;
