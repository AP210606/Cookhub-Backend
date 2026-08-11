
// // cookhub-backend/routes/adminRoutes.js
// const express = require('express');
// const router = express.Router();
// const Admin = require('../models/admin'); // Adjust path to your Admin model
// const { protect, authorizeRoles } = require('../middleware/authMiddleware');
// const { sendCookhubEmail } = require('../utils/email');

// if (!Admin || !protect || !authorizeRoles || !sendCookhubEmail) {
//   throw new Error('Required dependencies or middleware not found. Check imports and middleware setup.');
// }

// // Get admin profile
// router.get('/profile', protect, authorizeRoles('admin'), async (req, res) => {
//   try {
//     const admin = await Admin.findById(req.user.id).select('name email');
//     if (!admin) return res.status(404).json({ message: 'Admin not found' });
//     res.json(admin);
//   } catch (error) {
//     console.error('Error fetching admin profile:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Update admin profile
// router.put('/profile', protect, authorizeRoles('admin'), async (req, res) => {
//   try {
//     const { name, email } = req.body;
//     if (!name || !email) {
//       return res.status(400).json({ message: 'Name and email are required' });
//     }
//     const admin = await Admin.findByIdAndUpdate(
//       req.user.id,
//       { name, email },
//       { new: true, runValidators: true }
//     );
//     if (!admin) return res.status(404).json({ message: 'Admin not found' });
//     res.json({ message: 'Profile updated successfully', admin });
//   } catch (error) {
//     console.error('Error updating admin profile:', error);
//     res.status(400).json({ message: 'Validation error', error: error.message });
//   }
// });

// // Send manual email
// router.post('/send-email', protect, authorizeRoles('admin'), async (req, res) => {
//   try {
//     const { to, from, subject, html } = req.body;
//     if (!to || !from || !subject || !html) {
//       return res.status(400).json({ message: 'All fields (to, from, subject, html) are required' });
//     }
//     const emailStatus = await sendCookhubEmail(to, subject, html, from);
//     if (emailStatus.success) {
//       res.json({ message: 'Email sent successfully' });
//     } else {
//       res.status(500).json({ message: 'Failed to send email', error: emailStatus.message });
//     }
//   } catch (error) {
//     console.error('Error sending email:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// module.exports = router;
