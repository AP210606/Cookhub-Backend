const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Cook = require('../models/Cook');
const router = express.Router();

// Generate short-lived access token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '2h' });
};

// Generate long-lived refresh token (different secret)
const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
  };

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  const { name, email, password, assignedLocations } = req.body;

  try {
    // Check if email already exists in either collection
    const userExists = await User.findOne({ email });
    const cookExists = await Cook.findOne({ email });

    if (userExists || cookExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Default registration adds to Users (normal)
    // NOTE: User model has a pre-save hook that hashes the password.
    // To avoid double-hashing, store the raw password here and let the model hash it.
    const newUser = new User({
      name,
      email,
      password: password,
      assignedLocations: assignedLocations || [],
      role: 'user',
    });

    await newUser.save();

    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 1️⃣ Check in Cook collection first (include password explicitly)
    let user = await Cook.findOne({ email }).select('+password');
    let role = 'cook';

    // 2️⃣ If not found in cooks, check in users
    if (!user) {
      user = await User.findOne({ email }).select('+password');
      role = user ? user.role : null;
    }

    // 3️⃣ If not found anywhere
    if (!user) {
      return res.status(401).json({ message: 'Invalid email' });
    }

    // 4️⃣ Safely compare passwords
    if (!user.password) {
      console.error("⚠️ No password field found for user:", email, "in role:", role);
      return res.status(500).json({ message: "User record missing password. Please re-register." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // 5️⃣ Generate tokens and save login time + refresh token
    const accessToken = generateToken(user._id, role);
    const refreshToken = generateRefreshToken(user._id, role);
    const loginTime = new Date().toISOString();

    // persist refresh token on the user/cook record for server-side revocation/rotation
    try {
      user.refreshToken = refreshToken;
      user.lastLogin = loginTime;
      await user.save();
    } catch (saveErr) {
      console.warn('Could not persist refresh token:', saveErr && saveErr.message ? saveErr.message : saveErr);
    }

    // set HttpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role,
      },
      token: accessToken,
      loginTime,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ================= REFRESH =================
// Exchange valid refresh token (cookie or body) for a new access token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token provided' });

    // verify token signature
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch (err) {
      console.warn('Refresh token verify failed:', err && err.message ? err.message : err);
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // find user or cook and ensure stored refreshToken matches
    let account = await User.findById(decoded.id);
    let role = 'user';
    if (!account) {
      account = await Cook.findById(decoded.id);
      role = 'cook';
    }
    if (!account) return res.status(403).json({ message: 'Account not found for refresh token' });

    if (!account.refreshToken || account.refreshToken !== token) {
      return res.status(403).json({ message: 'Refresh token does not match' });
    }

    // issue new access token (we do not rotate refresh token here, but could)
    const newAccessToken = generateToken(decoded.id, decoded.role || role);
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Refresh error:', err && err.message ? err.message : err);
    return res.status(500).json({ message: 'Refresh failed' });
  }
});

// ================= LOGOUT =================
// Clears refresh token cookie and revokes server-side stored refresh token
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      // try to clear from either Users or Cooks collection
      await User.findOneAndUpdate({ refreshToken: token }, { $unset: { refreshToken: '' } });
      await Cook.findOneAndUpdate({ refreshToken: token }, { $unset: { refreshToken: '' } });
    }
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' });
    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err && err.message ? err.message : err);
    return res.status(500).json({ message: 'Logout failed' });
  }
});


module.exports = router;

// ------------------ Forgot / Reset Password ------------------
// POST /api/auth/forgot-password  { email }
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Try to find user in Users or Cooks
    let account = await User.findOne({ email });
    let accountType = 'user';
    if (!account) {
      account = await Cook.findOne({ email });
      accountType = 'cook';
    }

    if (!account) {
      // Do not reveal whether email exists
      return res.json({ message: 'If an account with that email exists, reset instructions have been sent.' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour

    account.resetPasswordToken = token;
    account.resetPasswordExpires = new Date(expires);
    await account.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;

    // Try to send email if sendEmail util is available; otherwise return resetUrl in non-production.
    try {
      const sendEmail = require('../utils/sendEmail');
      if (typeof sendEmail === 'function') {
        await sendEmail({
          email,
          subject: 'Cookhub password reset',
          message: `<p>You requested a password reset. Click the link below to reset your password (valid 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
        });
      }
    } catch (e) {
      // sendEmail may not be configured; ignore and fall back
      console.warn('sendEmail error or not configured:', e && e.message ? e.message : e);
    }

    const responseBody = { message: 'If an account with that email exists, reset instructions have been sent.' };
    if (process.env.NODE_ENV !== 'production') responseBody.resetUrl = resetUrl; // helpful for dev

    return res.json(responseBody);
  } catch (err) {
    console.error('Forgot password error', err && err.message ? err.message : err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/reset-password  { token, password }
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password are required' });

    // Find account by token (user or cook)
    let account = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
    let accountType = 'user';
    if (!account) {
      account = await Cook.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } }).select('+password');
      accountType = 'cook';
    }

    if (!account) return res.status(400).json({ message: 'Invalid or expired token' });

    if (accountType === 'user') {
      account.password = password; // User schema pre-save will hash
      account.resetPasswordToken = undefined;
      account.resetPasswordExpires = undefined;
      await account.save();
    } else {
      // Cook: hash manually
      const salt = await bcrypt.genSalt(10);
      account.password = await bcrypt.hash(password, salt);
      account.resetPasswordToken = undefined;
      account.resetPasswordExpires = undefined;
      await account.save();
    }

    return res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (err) {
    console.error('Reset password error', err && err.message ? err.message : err);
    return res.status(500).json({ message: 'Server error' });
  }
});









// // cookhub-backend/routes/auth.js
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const User = require('../models/User');

// const router = express.Router();

// // ✅ Generate JWT Token with role + assignedLocations
// const generateToken = (user) => {
//   return jwt.sign(
//     { id: user._id, role: user.role, assignedLocations: user.assignedLocations },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
//   );
// };

// // @route   POST /api/auth/login
// // @desc    Authenticate user & get token
// // @access  Public
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // ✅ Compare with stored hash
//     const isMatch = await bcrypt.compare(password, user.passwordHash);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const token = generateToken(user);

//     res.json({
//       message: 'Login successful',
//       token,
//       user: {
//         _id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         assignedLocations: user.assignedLocations
//       }
//     });

//   } catch (err) {
//     console.error('Login error:', err.message);
//     res.status(500).json({ message: 'Server error during login' });
//   }
// });

// // @route   POST /api/auth/register
// // @desc    Register a new coordinator (should be admin protected in production)
// // @access  Public (for now)
// router.post('/register', async (req, res) => {
//   const { username, email, password, assignedLocations } = req.body;

//   try {
//     if (!username || !email || !password || !Array.isArray(assignedLocations)) {
//       return res.status(400).json({ message: 'All fields are required, and assignedLocations must be an array' });
//     }

//     // Check for existing user
//     const existingUser = await User.findOne({ $or: [{ email }, { username }] });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User with this email or username already exists' });
//     }

//     // ✅ Hash password before saving
//     const passwordHash = await bcrypt.hash(password, 10);

//     const user = new User({
//       username,
//       email,
//       passwordHash,
//       assignedLocations,
//       role: 'coordinator'
//     });

//     await user.save();

//     res.status(201).json({
//       message: 'Coordinator created successfully',
//       user: {
//         _id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         assignedLocations: user.assignedLocations
//       }
//     });

//   } catch (err) {
//     console.error('Register error:', err.message);
//     res.status(500).json({ message: 'Server error during registration' });
//   }
// });

// module.exports = router;














// // cookhub-backend/routes/auth.js
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const router = express.Router();

// // ✅ Use environment variable for token expiry
// const generateToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN || '1h', // fallback if not set
//     });
// };

// router.post('/register', async (req, res) => {
//     const { name, email, password } = req.body;

//     try {
//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         user = new User({ name, email, password });

//         await user.save();

//         res.status(201).json({
//             message: 'Registration successful',
//             user: {
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//             },
//             token: generateToken(user._id),
//         });

//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server error');
//     }
// });

// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: 'Invalid credentials' });
//         }

//         const isMatch = await user.matchPassword(password);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid credentials' });
//         }

//         res.json({
//             message: 'Login successful',
//             user: {
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//             },
//             token: generateToken(user._id),
//         });

//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server error');
//     }
// });

// module.exports = router;




