// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/authMiddleware'); // Uses your updated middleware
// const User = require('../models/User');
// const Cook = require('../models/Cook');

// // Unified GET /me endpoint for all roles
// router.get('/me', protect, async (req, res) => {
//   try {
//     let profile = null;
//     const role = req.user.role; // From middleware (e.g., 'cook', 'user', 'coordinator', 'admin')

//     if (role === 'cook') {
//       profile = await Cook.findById(req.user.id).select('-password'); // Query Cook model
//     } else {
//       profile = await User.findById(req.user.id).select('-password'); // Query User model for others
//     }

//     if (!profile) {
//       return res.status(404).json({ message: 'Profile not found for this account.' });
//     }

//     // Standardize response: Add role if missing, exclude sensitive fields
//     const profileData = {
//       ...profile.toObject(),
//       role: role,
//     };

//     res.json(profileData);
//   } catch (error) {
//     console.error('Profile fetch error:', error);
//     res.status(500).json({ message: 'Server error fetching profile.' });
//   }
// });

// module.exports = router;









import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js"; // adjust if model path differs

const router = express.Router();

// Ensure upload folder exists
const uploadDir = path.join(process.cwd(), "uploads/profilePhotos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ✅ Update User Profile (PUT /api/users/:id)
router.put("/users/:id", upload.single("profilePhoto"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, bio } = req.body;

    const updateData = { name, email, phone, bio };

    if (req.file) {
      updateData.profilePhoto = `/uploads/profilePhotos/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
