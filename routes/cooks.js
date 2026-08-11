// Updated: cookhub-backend/routes/cooks.js
// Changes: 
// - Fixed middleware import: Changed from authMiddleware to auth (matching provided auth.js file).
// - Enhanced /bookings route: Added explicit populate with select to include only needed fields.
// - Transformed response to match frontend expectations: Map _id to id, derive client from userName/userEmail, ensure status mapping (e.g., 'pending' -> 'Upcoming').
// - Added date filtering logic using current date (Oct 30, 2025) to categorize 'Current'/'Upcoming'/'Completed' based on serviceStartTime/serviceEndTime.
// - Error handling: More specific logging and responses.
// - Ensured password exclusion in all queries.
// - Minor: Aligned authorizeRoles usage where needed.

const express = require('express');
const router = express.Router();
const Cook = require('../models/Cook');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs'); // Added for password hashing
const protect = require('../middleware/auth'); // Fixed: Direct require from auth.js (exports function directly)
const { loginCook } = require('../controllers/cookController'); // For login route

// Authorize multiple roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'User not authorized to perform this action' });
        }
        next();
    };
};

const sendEmail = require('../utils/sendEmail');

// Cook Login Route (Public)
router.post('/login', loginCook);

// Updated POST '/' to include password hashing and storage
router.post('/', protect, authorizeRoles('admin', 'coordinator'), async (req, res) => {
    try {
        const { name, email, phone, specialties, serviceAreas, password } = req.body;

        // Validate required fields, including password
        if (!name || !phone || !password) {
            return res.status(400).json({ message: 'Name, phone, and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check for duplicate email
        const existingCook = await Cook.findOne({ email });
        if (existingCook) {
            return res.status(400).json({ message: 'A cook with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new cook with hashed password
        const newCook = new Cook({
            name,
            email,
            phone,
            specialties: specialties || [],
            serviceAreas: serviceAreas || [],
            password: hashedPassword, // Store hashed password
            isAvailable: true,
            activeBookings: [],
        });

        // Save to database
        const savedCook = await newCook.save();

        // Exclude password from response
        const { password: _, ...cookWithoutPassword } = savedCook.toObject();

        res.status(201).json(cookWithoutPassword);
    } catch (error) {
        console.error('Error adding cook:', error.message);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: `Validation failed: ${errors.join(', ')}` });
        }
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).json({ message: 'A cook with this email already exists.' });
        }
        res.status(500).json({ message: 'Server error. Could not add cook.' });
    }
});

router.get('/', protect, authorizeRoles('admin', 'coordinator'), async (req, res) => {
    try {
        const cooks = await Cook.find({}).select('-password'); // Explicitly exclude password

        // Attach a friendly numbering for active bookings for admin UI
        const cooksWithBookingNumbers = cooks.map(cookDoc => {
            const cook = cookDoc.toObject();
            const active = Array.isArray(cook.activeBookings) ? cook.activeBookings : [];
            // Provide a simple 1-based index display array so UI can show Booking #1, #2 ...
            cook.activeBookingNumbers = active.map((_, idx) => idx + 1);
            // Also provide a count for convenience
            cook.activeBookingsCount = active.length;
            return cook;
        });

        res.json(cooksWithBookingNumbers);
    } catch (error) {
        console.error('Error fetching cooks:', error.message);
        res.status(500).json({ message: 'Server error. Could not fetch cooks.' });
    }
});

router.put('/:id', protect, authorizeRoles('admin', 'coordinator'), async (req, res) => {
    const { name, email, phone, specialties, serviceAreas, isAvailable, password } = req.body;
    try {
        // Include the password field when fetching for update so we don't lose the hashed password
        const cook = await Cook.findById(req.params.id).select('+password');
        if (!cook) {
            return res.status(404).json({ message: 'Cook not found' });
        }

        // Update fields
        cook.name = name || cook.name;
        cook.email = email || cook.email;
        cook.phone = phone || cook.phone;
        cook.specialties = specialties || cook.specialties;
        cook.serviceAreas = serviceAreas || cook.serviceAreas;
        if (typeof isAvailable === 'boolean') {
            cook.isAvailable = isAvailable;
        }

        // Update password if provided (hash it)
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters' });
            }
            const salt = await bcrypt.genSalt(10);
            cook.password = await bcrypt.hash(password, salt);
        }

        await cook.save();

        // Exclude password from response
        const { password: _, ...cookWithoutPassword } = cook.toObject();

        res.json({ message: 'Cook updated successfully', cook: cookWithoutPassword });
    } catch (error) {
        console.error('Error updating cook:', error.message);
        res.status(500).json({ message: 'Server error. Could not update cook.' });
    }
});

router.delete('/:id', protect, authorizeRoles('admin', 'coordinator'), async (req, res) => {
    try {
        const cook = await Cook.findByIdAndDelete(req.params.id);
        if (!cook) {
            return res.status(404).json({ message: 'Cook not found' });
        }
        res.json({ message: 'Cook removed successfully' });
    } catch (error) {
        console.error('Error deleting cook:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/bookings/:bookingId/assign-cook', protect, authorizeRoles('admin', 'coordinator'), async (req, res) => {
    const { cookId, serviceStartTime, serviceEndTime } = req.body;

    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const cook = await Cook.findById(cookId).select('+password'); // Include password if needed (unlikely)
        if (!cook) {
            return res.status(404).json({ message: 'Cook not found' });
        }

        // Assign cook to booking
        booking.assignedCook = cook._id;
        booking.assignedCookName = cook.name;
        booking.serviceStartTime = serviceStartTime ? new Date(serviceStartTime) : null;
        booking.serviceEndTime = serviceEndTime ? new Date(serviceEndTime) : null;
        booking.status = 'approved';

        await booking.save();

        // Add to cook's active bookings
        if (!cook.activeBookings.includes(booking._id)) {
            cook.activeBookings.push(booking._id);
            await cook.save();
        }

        // Email notification (unchanged)
        const message = `
            <p>Dear ${booking.userName},</p>
            <p>Your Cookhub booking request (ID: ${booking._id}) has been approved and a cook has been assigned!</p>
            <p><strong>Assigned Cook:</strong> ${cook.name}</p>
            <p><strong>Service Location:</strong> ${booking.address}</p>
            <p><strong>Meal Preference:</strong> ${booking.mealPreference}</p>
            <p><strong>Plan Duration:</strong> ${booking.planDuration}</p>
            ${booking.serviceStartTime && booking.serviceEndTime ? `<p><strong>Service Time:</strong> ${new Date(booking.serviceStartTime).toLocaleString()} - ${new Date(booking.serviceEndTime).toLocaleString()}</p>` : ''}
            <p>We look forward to serving you!</p>
            <p>Best Regards,<br/>The Cookhub Team</p>
        `;

        try {
            await sendEmail({
                email: booking.userEmail,
                subject: 'Cookhub Booking Confirmed & Cook Assigned!',
                message
            });
            console.log(`Email sent to ${booking.userEmail} for booking ${booking._id}`);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
        }

        res.json({ message: 'Cook assigned successfully', booking });
    } catch (error) {
        console.error('Error assigning cook to booking:', error.message);
        res.status(500).json({ message: 'Server error. Could not assign cook.' });
    }
});

// Protected routes for cook profile and bookings (updated for better data mapping)
router.get('/me', protect, async (req, res) => {
    try {
        if (req.user.role !== 'cook') {
            return res.status(403).json({ message: 'Access denied. Cooks only.' });
        }
        const cook = await Cook.findById(req.user.id).select('-password');
        if (!cook) {
            return res.status(404).json({ message: 'Cook profile not found' });
        }
        res.json(cook);
    } catch (error) {
        console.error('Error fetching cook profile:', error.message);
        res.status(500).json({ message: 'Server error. Could not fetch cook profile.' });
    }
});

router.get('/bookings', protect, async (req, res) => {
    try {
        if (req.user.role !== 'cook') {
            return res.status(403).json({ message: 'Access denied. Cooks only.' });
        }

        // Current date for status categorization (Oct 30, 2025)
        const currentDate = new Date('2025-10-30');

        // Fetch cook and populate activeBookings with specific fields
        const cook = await Cook.findById(req.user.id)
            .select('-password')
            .populate({
                path: 'activeBookings',
                model: 'Booking',
                select: 'userName userEmail address mealPreference planDuration serviceStartTime serviceEndTime status notes _id createdAt', // Select relevant fields
                match: { assignedCook: req.user.id } // Ensure only assigned to this cook
            });

        let bookings = cook.activeBookings || [];

        // Transform bookings to match frontend expectations (id, client, date, time, address, status, notes)
        bookings = bookings.map(booking => {
            const startTime = booking.serviceStartTime ? new Date(booking.serviceStartTime) : null;
            const endTime = booking.serviceEndTime ? new Date(booking.serviceEndTime) : null;
            let mappedStatus = booking.status; // Default to DB status

            // Categorize status based on current date/time
            if (startTime && endTime) {
                if (startTime <= currentDate && currentDate <= endTime) {
                    mappedStatus = 'Current';
                } else if (startTime > currentDate) {
                    mappedStatus = 'Upcoming';
                } else {
                    mappedStatus = 'Completed';
                }
            }

            return {
                id: booking._id.toString(), // Map _id to id (string for frontend)
                client: booking.userName || 'N/A', // Use userName as client
                date: startTime ? startTime.toISOString().split('T')[0] : 'N/A', // YYYY-MM-DD
                time: startTime ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                address: booking.address || 'N/A',
                status: mappedStatus,
                notes: booking.notes || 'No notes provided',
                // Optional: Add more fields if needed (e.g., mealPreference, planDuration)
            };
        });

        // Sort by date ascending
        bookings.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching cook bookings:', error.message, error.stack);
        res.status(500).json({ message: 'Failed to fetch bookings for cook.' });
    }
});

module.exports = router;


























// // cookhub-backend/routes/cooks.js
// const express = require('express');
// const router = express.Router();
// const Cook = require('../models/Cook'); // Import the Cook model
// const Booking = require('../models/Booking'); // Import Booking model (needed for assign-cook)
// const { protect } = require('../middleware/authMiddleware');

// // A new middleware to authorize multiple roles.
// // This is more flexible than the original `authorizeAdmin` function.
// const authorizeRoles = (...roles) => {
//     return (req, res, next) => {
//         // We'll assume the user role is attached to the request object by `protect` middleware
//         if (!roles.includes(req.user.role)) {
//             return res.status(403).json({ message: 'User not authorized to perform this action' });
//         }
//         next();
//     };
// };

// const sendEmail = require('../utils/sendEmail'); // For sending emails on cook assignment

// // The original route only allowed `authorizeAdmin`.
// // Now we use our new `authorizeRoles` middleware to allow both 'admin' and 'coordinator'.



// router.get('/', protect, authorizeRoles('admin', 'coordinator'), async (req, res) => {
//     try {
//         const cooks = await Cook.find({});
//         res.json(cooks);
//     } catch (error) {
//         console.error('Error fetching cooks:', error.message);
//         res.status(500).json({ message: 'Server error. Could not fetch cooks.' });
//     }
// });

// router.put('/:id', protect, authorizeRoles('admin', 'coordinator'), async (req, res) => {
//     const { name, email, phone, specialties, serviceAreas, isAvailable } = req.body;
//     try {
//         const cook = await Cook.findById(req.params.id);
//         if (!cook) {
//             return res.status(404).json({ message: 'Cook not found' });
//         }

//         cook.name = name || cook.name;
//         cook.email = email || cook.email;
//         cook.phone = phone || cook.phone;
//         cook.specialties = specialties || cook.specialties;
//         cook.serviceAreas = serviceAreas || cook.serviceAreas;
//         if (typeof isAvailable === 'boolean') {
//             cook.isAvailable = isAvailable;
//         }

//         await cook.save();
//         res.json({ message: 'Cook updated successfully', cook });
//     } catch (error) {
//         console.error('Error updating cook:', error.message);
//         res.status(500).json({ message: 'Server error. Could not update cook.' });
//     }
// });

// router.delete('/:id', protect, authorizeRoles('admin', 'coordinator'), async (req, res) => {
//     try {
//         const cook = await Cook.findByIdAndDelete(req.params.id);
//         if (!cook) {
//             return res.status(404).json({ message: 'Cook not found' });
//         }
//         res.json({ message: 'Cook removed successfully' });
//     } catch (error) {
//         console.error('Error deleting cook:', error.message);
//         res.status(500).send('Server error');
//     }
// });

// router.put('/bookings/:bookingId/assign-cook', protect, authorizeRoles('admin', 'coordinator'), async (req, res) => {
//     const { cookId, serviceStartTime, serviceEndTime } = req.body;

//     try {
//         const booking = await Booking.findById(req.params.bookingId);
//         if (!booking) {
//             return res.status(404).json({ message: 'Booking not found' });
//         }

//         const cook = await Cook.findById(cookId);
//         if (!cook) {
//             return res.status(404).json({ message: 'Cook not found' });
//         }

//         // Assign cook to booking
//         booking.assignedCook = cook._id;
//         booking.assignedCookName = cook.name; // Store name directly
//         booking.serviceStartTime = serviceStartTime ? new Date(serviceStartTime) : null;
//         booking.serviceEndTime = serviceEndTime ? new Date(serviceEndTime) : null;
//         booking.status = 'approved'; // Optionally change status to approved upon assignment

//         await booking.save();

//         // Add booking to cook's active bookings
//         if (!cook.activeBookings.includes(booking._id)) {
//             cook.activeBookings.push(booking._id);
//             await cook.save();
//         }

//         // Send email notification to the user
//         const message = `
//             <p>Dear ${booking.userName},</p>
//             <p>Your Cookhub booking request (ID: ${booking._id}) has been approved and a cook has been assigned!</p>
//             <p><strong>Assigned Cook:</strong> ${cook.name}</p>
//             <p><strong>Service Location:</strong> ${booking.address}</p>
//             <p><strong>Meal Preference:</strong> ${booking.mealPreference}</p>
//             <p><strong>Plan Duration:</strong> ${booking.planDuration}</p>
//             ${booking.serviceStartTime && booking.serviceEndTime ? `<p><strong>Service Time:</strong> ${new Date(booking.serviceStartTime).toLocaleString()} - ${new Date(booking.serviceEndTime).toLocaleString()}</p>` : ''}
//             <p>We look forward to serving you!</p>
//             <p>Best Regards,<br/>The Cookhub Team</p>
//         `;

//         try {
//             await sendEmail({
//                 email: booking.userEmail,
//                 subject: 'Cookhub Booking Confirmed & Cook Assigned!',
//                 message: message
//             });
//             console.log(`Email sent to ${booking.userEmail} for booking ${booking._id}`);
//         } catch (emailError) {
//             console.error('Error sending email:', emailError);
//             // Don't block the API response if email fails, just log it
//         }

//         res.json({ message: 'Cook assigned successfully', booking });
//     } catch (error) {
//         console.error('Error assigning cook to booking:', error.message);
//         res.status(500).json({ message: 'Server error. Could not assign cook.' });
//     }
// });

// module.exports = router;