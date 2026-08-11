const Rating = require('../models/Rating');
const Cook = require('../models/Cook');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// Create a rating for a cook
exports.createCookRating = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id; // auth middleware stores decoded payload
    const { cookId, bookingId, rating, comment } = req.body;

    if (!cookId || !rating) return res.status(400).json({ message: 'cookId and rating are required' });

    // Optionally verify booking belongs to user
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      if (String(booking.user) !== String(userId)) {
        return res.status(403).json({ message: 'You can only rate bookings you made' });
      }
    }

    // Save rating
    const newRating = new Rating({ cook: cookId, user: userId, booking: bookingId, rating, comment });
    await newRating.save();

    // Update cook aggregate: compute new average and count atomically
    const agg = await Rating.aggregate([
      { $match: { cook: new mongoose.Types.ObjectId(cookId) } },
      { $group: { _id: '$cook', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const { avg = 0, count = 0 } = agg[0] || {};
    await Cook.findByIdAndUpdate(cookId, { averageRating: avg, ratingCount: count });

    res.status(201).json({ message: 'Rating saved', rating: newRating, averageRating: avg, ratingCount: count });
  } catch (err) {
    console.error('createCookRating error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get aggregate ratings for a user/cook by user id
exports.getUserRatingsSummary = async (req, res) => {
  try {
    const userId = req.params.id;
    // Try to find cook first
    const cook = await Cook.findOne({ _id: userId });
    if (cook) {
      return res.json({ averageRating: cook.averageRating || 0, count: cook.ratingCount || 0 });
    }

    // If not a cook, return empty
    res.json({ averageRating: 0, count: 0 });
  } catch (err) {
    console.error('getUserRatingsSummary error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get ratings submitted by current user
exports.getMyRatings = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const arr = await Rating.find({ user: userId }).populate('cook', 'name email').sort({ createdAt: -1 });
    res.json(arr);
  } catch (err) {
    console.error('getMyRatings error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent rating documents for a specific cook
exports.getRatingsForCook = async (req, res) => {
  try {
    const cookId = req.params.cookId;
    if (!cookId) return res.status(400).json({ message: 'cookId required' });

    const arr = await Rating.find({ cook: cookId }).populate('user', 'name email').sort({ createdAt: -1 }).limit(50);
    res.json(arr);
  } catch (err) {
    console.error('getRatingsForCook error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
