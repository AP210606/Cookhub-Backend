// cookhub-backend/controllers/adminController.js

const User = require('../models/User');
const Booking = require('../models/Booking'); // Make sure you import the Booking model

// ... (existing functions like getAllUsers, getAllBookings, updateBookingStatus) ...

// NEW FUNCTION: Get aggregated booking summary
exports.getBookingSummary = async (req, res) => {
  try {
    const summaryz = await Booking.aggregate([
      {
        $group: {
          _id: {
            address: "$address",
            planDuration: "$planDuration"
          },
          numberOfBookings: { $sum: 1 } // Count the number of bookings for each group
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          location: "$_id.address",
          duration: "$_id.planDuration",
          bookingsCount: "$numberOfBookings"
        }
      },
      {
        $sort: { location: 1, duration: 1 } // Optional: sort the results
      }
    ]);

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching booking summary:', error);
    res.status(500).json({ message: 'Server error while fetching booking summary.' });
  }
};