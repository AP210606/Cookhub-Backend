// // D:\DNG\cookhub-app-anil\cookhub-backend\routes\settings.js
// const express = require('express');
// const router = express.Router();
// const AppSetting = require('../models/AppSetting');
// const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// // @route   GET /api/settings/email
// // @desc    Get the current notification email
// // @access  Private/Admin
// router.get('/email', protect, authorizeRoles('admin'), async (req, res) => {
//     try {
//         const setting = await AppSetting.findOne({ key: 'notification_email' });
//         // If the setting doesn't exist, return a default value or null
//         res.json({ email: setting ? setting.value : null });
//     } catch (error) {
//         console.error('Error fetching notification email:', error.message);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // @route   PUT /api/settings/email
// // @desc    Update the notification email
// // @access  Private/Admin
// router.put('/email', protect, authorizeRoles('admin'), async (req, res) => {
//     const { newEmail } = req.body;

//     if (!newEmail || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(newEmail)) {
//         return res.status(400).json({ message: 'Please provide a valid email address.' });
//     }

//     try {
//         // Find and update the setting, or create it if it doesn't exist
//         const updatedSetting = await AppSetting.findOneAndUpdate(
//             { key: 'notification_email' },
//             { value: newEmail },
//             { new: true, upsert: true, setDefaultsOnInsert: true }
//         );
//         res.json({ message: 'Email updated successfully!', updatedSetting });
//     } catch (error) {
//         console.error('Error updating notification email:', error.message);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// module.exports = {router, authorizeRoles};
