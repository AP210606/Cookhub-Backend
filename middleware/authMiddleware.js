// Updated: cookhub-backend/middleware/authMiddleware.js
// Changes: 
// - Updated protect to handle both User and Cook models
// - Added support for Cook model import
// - Ensured req.user includes role for both
// - Fixed authorizeRoles to use req.user.role consistently

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Cook = require('../models/Cook'); // Added Cook import

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Extract token
        token = req.headers.authorization.split(' ')[1];

        // Quick decode to check shape and expiry without throwing
        const decodedUnverified = jwt.decode(token);

        if (!decodedUnverified || !decodedUnverified.id) {
            return res.status(401).json({ message: 'Not authorized, token invalid.' });
        }

        // Check expiration manually (jwt.decode returns exp in seconds)
        const now = Math.floor(Date.now() / 1000);
        if (decodedUnverified.exp && decodedUnverified.exp < now) {
            // Don't print full stack for common expired-token case; return friendly message
            console.warn('Auth middleware: received expired token for id:', decodedUnverified.id);
            return res.status(401).json({ message: 'Session expired. Please login again.' });
        }

        // Now verify signature and other checks
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if it's a User or Cook
            let user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
                return next();
            }

            let cook = await Cook.findById(decoded.id).select('-password');
            if (cook) {
                req.user = { ...cook.toObject(), role: cook.role || 'cook' }; // Ensure role
                return next();
            }

            return res.status(401).json({ message: 'Not authorized, token failed - user/cook not found' });
        } catch (error) {
            // Log only the error message to avoid noisy stack traces
            console.warn('Auth middleware: Token verification failed:', error && error.message ? error.message : error);

            if (error && error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Session expired. Please login again.' });
            }

            return res.status(401).json({ message: 'Not authorized, token verification failed.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, token missing.' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Not authorized, user role missing.' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Not authorized, requires one of these roles: ${roles.join(', ')}.` });
        }

        next();
    };
};

module.exports = { protect, authorizeRoles };






// // cookhub-backend/middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');
// const asyncHandler = require('express-async-handler');
// const User = require('../models/User');

// // Protect routes (JWT verification)
// const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       token = req.headers.authorization.split(' ')[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id).select('-password');

//       if (!req.user) {
//         return res.status(401).json({ message: 'User not found, token invalid' });
//       }

//       next();
//     } catch (error) {
//       console.error('Auth Error:', error);

//       if (error.name === 'TokenExpiredError') {
//         return res.status(401).json({ message: 'Session expired. Please login again.' });
//       }

//       res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   }

//   if (!token) {
//     res.status(401).json({ message: 'Not authorized, no token provided' });
//   }
// });

// // Admin or Coordinator authorization middleware
// const authorizeAdminOrCoordinator = (req, res, next) => {
//   if (req.user && (req.user.role === 'admin' || req.user.role === 'coordinator')) {
//     next();
//   } else {
//     res.status(403).json({ message: 'Not authorized as admin or coordinator' });
//   }
// };

// module.exports = { protect, authorizeAdminOrCoordinator };












// // D:\DNG\cookhub-app-anil\cookhub-backend\middleware\authMiddleware.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/User'); // Assuming your User model is in this path
// const asyncHandler = require('express-async-handler');

// // Middleware to protect routes by checking for a valid token
// const protect = asyncHandler(async (req, res, next) => {
//     let token;
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         try {
//             // Get token from header
//             token = req.headers.authorization.split(' ')[1];

//             // Verify token
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);

//             // Get user from the token and attach to the request object
//             req.user = await User.findById(decoded.id).select('-password');

//             next();
//         } catch (error) {
//             console.error(error);
//             res.status(401);
//             throw new Error('Not authorized, token failed');
//         }
//     }
//     if (!token) {
//         res.status(401);
//         throw new Error('Not authorized, no token');
//     }
// });

// // Middleware to authorize users based on their role
// const authorizeRoles = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             res.status(403);
//             throw new Error(`User role ${req.user.role} is not authorized to access this route`);
//         }
//         next();
//     };
// };

// // This line is crucial! It exports both functions so they can be used in other files.
// module.exports = { protect, authorizeRoles };
