// cookhub-backend/controllers/authController.js
const User = require('../models/User'); // Assuming you have a User model
import Cook from '../models/Cook.js';

exports.updateProfile = async (req, res) => {
  try {
    const { userId, updatedData } = req.body;
    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 1️⃣ Try finding user in Users collection
    let user = await User.findOne({ email });
    let role = 'user';

    // 🔹 2️⃣ If not found, check in Cooks collection
    if (!user) {
      user = await Cook.findOne({ email });
      if (user) {
        role = 'cook';
      }
    }

    // 🔹 3️⃣ If still not found, return error
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    // 🔹 4️⃣ Ensure password exists (avoid “missing password” bug)
    if (!user.password) {
      return res.status(400).json({ error: 'User record missing password. Please re-register.' });
    }

    // 🔹 5️⃣ Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // 🔹 6️⃣ Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 🔹 7️⃣ Respond with user details + role
    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};