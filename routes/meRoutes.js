// cookhub-backend/routes/meRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Uses your updated middleware
const User = require('../models/User');
const Cook = require('../models/Cook');

// GET /api/me - Returns profile based on token's model
router.get('/me', protect, async (req, res) => {
  try {
    // Middleware already sets req.user (from User or Cook)
    if (!req.user) {
      return res.status(401).json({ message: 'No user/cook found' });
    }

    // req.user may be a Mongoose document (has toObject) or a plain object
    let userObj;
    if (req.user && typeof req.user.toObject === 'function') {
      userObj = req.user.toObject();
    } else {
      // shallow copy to avoid mutating original
      userObj = { ...req.user };
    }

    // Ensure role exists; if modelName hints it's a Cook, default to 'cook'
    userObj.role = userObj.role || (userObj.modelName === 'Cook' ? 'cook' : userObj.role || 'user');

    // Exclude password if present
    if (userObj.password) delete userObj.password;

    res.json(userObj);
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

module.exports = router;