const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  cook: { type: mongoose.Schema.Types.ObjectId, ref: 'Cook', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Rating', RatingSchema);
