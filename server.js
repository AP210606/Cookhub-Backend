// Updated: cookhub-backend/server.js
// Changes: 
// - Added import for cookRoutes (already there, but ensured)
// - Fixed duplicate auth routes: Removed authRoutess as it's likely a typo; use authRoutes
// - Ensured /api/cooks is mounted for login/me/bookings

const { google } = require('googleapis');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth'); // For users
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const adminSettingsRoutes = require('./routes/adminSettings');
const cookRoutes = require('./routes/cooks'); // For cooks login/me/bookings
// const authRoutess = require('./routes/authRoutes'); // Removed duplicate
const applicationRoutes = require('./routes/applicationRoutes');
const meRoutes = require('./routes/meRoutes');
const ratingsRoutes = require('./routes/ratings');

const app = express();

// Middleware
app.use(cors({
  origin: "*"
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes); // User login/register
app.use('/api/cooks', cookRoutes); // Cook login/me/bookings
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-settings', adminSettingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api', meRoutes);
app.use('/api/ratings', ratingsRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Cookhub Backend API is running');
});

// Global error-handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// OAuth2 client for Gmail (unchanged)
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function createTransporter() {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    // nodemailer uses createTransport (not createTransporter)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken?.token || accessToken,
      },
    });
  } catch (error) {
    console.error('Error creating email transporter:', error.message);
    throw error;
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





// // Updated: cookhub-backend/server.js
// // Changes: 
// // - Added import for cookRoutes (already there, but ensured)
// // - Fixed duplicate auth routes: Removed authRoutess as it's likely a typo; use authRoutes
// // - Ensured /api/cooks is mounted for login/me/bookings
// // - Added multer for profile photo upload handling
// // - Added authenticateToken middleware
// // - Added PUT /api/users/:id route for profile updates (handles FormData, validation, auth)
// // - Added static file serving for /uploads
// // - Ensured route is before global error handler

// const { google } = require('googleapis');
// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const nodemailer = require('nodemailer');
// const multer = require('multer'); // Added for file uploads
// const path = require('path'); // Added for file paths
// const jwt = require('jsonwebtoken'); // Added for auth
// const connectDB = require('./config/db');
// const contactRoutes = require('./routes/contact');
// const authRoutes = require('./routes/auth'); // For users
// const bookingRoutes = require('./routes/bookings');
// const adminRoutes = require('./routes/admin');
// const adminSettingsRoutes = require('./routes/adminSettings');
// const cookRoutes = require('./routes/cooks'); // For cooks login/me/bookings
// // const authRoutess = require('./routes/authRoutes'); // Removed duplicate
// const applicationRoutes = require('./routes/applicationRoutes');
// const meRoutes = require('./routes/meRoutes');
// const User = require('./models/User'); // Assuming your User model path; adjust if needed

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Multer setup for profilePhoto (optional; handles up to 5MB images)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Ensure 'uploads' folder exists
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files allowed!'), false);
//     }
//   },
// });

// // Serve uploaded files statically
// app.use('/uploads', express.static('uploads'));

// // JWT auth middleware
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ message: 'Access token required' });
//   }

//   jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
//     if (err) {
//       return res.status(403).json({ message: 'Invalid token' });
//     }
//     req.user = user; // Attach decoded user to req
//     next();
//   });
// };

// // Connect to MongoDB
// connectDB();

// // API Routes
// app.use('/api/auth', authRoutes); // User login/register
// app.use('/api/cooks', cookRoutes); // Cook login/me/bookings
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/admin-settings', adminSettingsRoutes);
// app.use('/api/contact', contactRoutes);
// app.use('/api/applications', applicationRoutes);
// app.use('/api', meRoutes);

// // New: User profile update route (PUT /api/users/:id)
// app.put('/api/users/:id', authenticateToken, upload.single('profilePhoto'), async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (req.user.id !== id) { // Ensure user can only update own profile
//       return res.status(403).json({ message: 'Unauthorized to update this profile' });
//     }

//     const { name, email, phone, bio } = req.body;

//     // Basic validation
//     if (!phone?.trim()) {
//       return res.status(400).json({ message: 'Mobile number is required' });
//     }
//     if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       return res.status(400).json({ message: 'Invalid email format' });
//     }

//     // Prepare update data
//     const updateData = { name, email, phone, bio: bio || '' };
//     if (req.file) {
//       updateData.profilePhoto = `/uploads/${req.file.filename}`;
//     }

//     // Update in DB
//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     ).select('-password'); // Exclude sensitive fields

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json(updatedUser); // Return updated user
//   } catch (error) {
//     console.error('Profile update error:', error);
//     if (error instanceof multer.MulterError) {
//       return res.status(400).json({ message: error.message });
//     }
//     res.status(500).json({ message: 'Server error occurred. Please try again.' });
//   }
// });

// // Default route
// app.get('/', (req, res) => {
//   res.send('Cookhub Backend API is running');
// });

// // Global error-handling middleware
// app.use((err, req, res, next) => {
//   console.error('Server error:', err.message);
//   res.status(500).json({ message: 'Internal server error' });
// });

// // OAuth2 client for Gmail (unchanged)
// const oAuth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URI
// );

// oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// async function createTransporter() {
//   try {
//     const accessToken = await oAuth2Client.getAccessToken();
//     // nodemailer uses createTransport (not createTransporter)
//     return nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: process.env.EMAIL,
//         clientId: process.env.CLIENT_ID,
//         clientSecret: process.env.CLIENT_SECRET,
//         refreshToken: process.env.REFRESH_TOKEN,
//         accessToken: accessToken?.token || accessToken,
//       },
//     });
//   } catch (error) {
//     console.error('Error creating email transporter:', error.message);
//     throw error;
//   }
// }

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));