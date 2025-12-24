// cookhub-backend/routes/admin.js
const express = require('express');
const { ObjectId } = require('mongoose').Types;
const User = require('../models/User');
const Coordinator = require('../models/Coordinator');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

// GET /api/admin/users
router.get('/users', protect, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// GET /api/admin/bookings
router.get('/bookings', protect, authorizeAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('assignedCook', 'name').sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
});

// PUT /api/admin/bookings/:id/status
router.put('/bookings/:id/status', protect, authorizeAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    booking.status = status;
    await booking.save();
    res.status(200).json({ message: 'Booking status updated', booking });
  } catch (error) {
    console.error('Error updating booking status:', error.message);
    res.status(500).json({ message: 'Server error while updating booking status' });
  }
});

// GET /api/admin/booking-summary
router.get('/booking-summary', protect, authorizeAdmin, async (req, res) => {
  try {
    const summary = await Booking.aggregate([
      {
        $group: {
          _id: {
            address: '$address',
            planDuration: '$planDuration',
          },
          numberOfBookings: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          location: '$_id.address',
          duration: '$_id.planDuration',
          bookingsCount: '$numberOfBookings',
        },
      },
      {
        $sort: { location: 1, duration: 1 },
      },
    ]);
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching booking summary:', error.message);
    res.status(500).json({ message: 'Server error while fetching booking summary' });
  }
});

// GET /api/admin/coordinators
router.get('/coordinators', protect, authorizeAdmin, async (req, res) => {
  try {
    const coordinators = await Coordinator.find({}).populate('userId', 'name email role phone');
    res.status(200).json(coordinators);
  } catch (error) {
    console.error('Error fetching coordinators:', error.message);
    res.status(500).json({ message: 'Server error while fetching coordinators' });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', protect, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Validate request body
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    // Validate role value
    const validRoles = ['user', 'coordinator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    // Find and update user
    console.log(`Attempting to update user with ID: ${id} to role: ${role}`);
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role, updatedAt: Date.now() } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      console.log(`User with ID: ${id} not found`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle coordinators collection
    if (role === 'coordinator') {
      const existingCoordinator = await Coordinator.findOne({ userId: id });
      if (!existingCoordinator) {
        try {
          await Coordinator.create({
            userId: id,
            name: user.name,
            email: user.email,
            phone: user.phone || '', // Ensure phone is not null
          });
          console.log(`Added user ID: ${id} to coordinators collection`);
        } catch (createError) {
          console.error('Error adding to coordinators collection:', createError.message);
          // Continue to return success since user role was updated
        }
      }
    } else {
      await Coordinator.deleteOne({ userId: id });
      console.log(`Removed user ID: ${id} from coordinators collection`);
    }

    // Verify the update in the database
    const updatedUser = await User.findById(id).select('role');
    console.log(`Database verification - User ID: ${id}, Role: ${updatedUser.role}`);

    // Return success response
    res.status(200).json({
      message: 'Role updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error updating user role:', error.message);
    res.status(500).json({ message: `Server error while updating user role: ${error.message}` });
  }
});

module.exports = router;





// cookhub-backend/routes/admin.js
// const express = require('express');
// const User = require('../models/User');
// const Booking = require('../models/Booking');
// const Cook = require('../models/Cook');
// const { protect } = require('../middleware/authMiddleware');
// const { authorizeAdmin } = require('../middleware/adminMiddleware');

// const router = express.Router();

// // @route   GET /api/admin/users
// // @desc    Get all users (Admin only)
// // @access  Private/Admin
// router.get('/users', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const users = await User.find({}).select('-password');
//         res.json(users);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server error');
//     }
// });

// // ✅ UPDATED: Add revenue and cook stats
// // @route   GET /api/admin/bookings
// // @desc    Get all booking requests + totals (Admin only)
// // @access  Private/Admin
// router.get('/bookings', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const bookings = await Booking.find({})
//             .populate('cook', 'name') // Include cook name
//             .sort({ createdAt: -1 });

//         const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
//         const totalBookings = bookings.length;

//         // Cook stats
//         const cookStats = {};
//         bookings.forEach(booking => {
//             const cook = booking.cook;
//             if (!cook || !cook._id) return; // skip if cook is not assigned

//             const cookId = cook._id.toString();
//             if (!cookStats[cookId]) {
//                 cookStats[cookId] = {
//                     cookId,
//                     cookName: cook.name || 'Unnamed',
//                     totalBookings: 0,
//                     totalHours: 0
//                 };
//             }

//             cookStats[cookId].totalBookings++;
//             if (booking.startTime && booking.endTime) {
//                 const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
//                 cookStats[cookId].totalHours += hours;
//             }
//         });

//         res.json({
//             bookings,
//             totalRevenue,
//             totalBookings,
//             cookStats: Object.values(cookStats)
//         });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server error');
//     }
// });

// // @route   PUT /api/admin/bookings/:id/status
// // @desc    Update booking status (Admin only)
// // @access  Private/Admin
// router.put('/bookings/:id/status', protect, authorizeAdmin, async (req, res) => {
//     const { status } = req.body;
//     try {
//         const booking = await Booking.findById(req.params.id);
//         if (!booking) return res.status(404).json({ message: 'Booking not found' });

//         booking.status = status;
//         await booking.save();
//         res.json({ message: 'Booking status updated', booking });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server error');
//     }
// });

// // @route   GET /api/admin/booking-summary
// // @desc    Get aggregated booking summary by location and plan duration (Admin only)
// // @access  Private/Admin
// router.get('/booking-summary', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const summary = await Booking.aggregate([
//             {
//                 $group: {
//                     _id: {
//                         address: "$address",
//                         planDuration: "$planDuration"
//                     },
//                     numberOfBookings: { $sum: 1 }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     location: "$_id.address",
//                     duration: "$_id.planDuration",
//                     bookingsCount: "$numberOfBookings"
//                 }
//             },
//             {
//                 $sort: { location: 1, duration: 1 }
//             }
//         ]);
//         res.status(200).json(summary);
//     } catch (error) {
//         console.error('Error fetching booking summary:', error);
//         res.status(500).json({ message: 'Server error while fetching booking summary.' });
//     }
// });

// module.exports = router;
