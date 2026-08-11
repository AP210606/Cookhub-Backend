// cookhub-backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/update-profile', authController.updateProfile);

module.exports = router;