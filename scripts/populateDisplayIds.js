/**
 * Migration script: populate displayId for existing bookings that don't have one.
 * Usage (run from project root):
 *   node ./cookhub-backend/scripts/populateDisplayIds.js
 * Requires MONGODB_URI in environment or default in connection code.
 */

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Counter = require('../models/Counter');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/cookhub';

async function main() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  // Ensure counter exists and starts from the current max displayId
  const maxBooking = await Booking.findOne({ displayId: { $exists: true } }).sort({ displayId: -1 }).lean();
  const start = maxBooking && maxBooking.displayId ? maxBooking.displayId : 0;

  const counter = await Counter.findByIdAndUpdate(
    { _id: 'booking' },
    { $setOnInsert: { seq: start } },
    { upsert: true, new: true }
  );
  console.log('Starting counter at', counter.seq);

  // Find bookings without displayId and assign sequential numbers
  const cursor = Booking.find({ $or: [{ displayId: { $exists: false } }, { displayId: null }] }).cursor();
  let processed = 0;

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    const updatedCounter = await Counter.findByIdAndUpdate({ _id: 'booking' }, { $inc: { seq: 1 } }, { new: true });
    doc.displayId = updatedCounter.seq;
    await doc.save();
    processed++;
    if (processed % 50 === 0) console.log(`Processed ${processed} bookings...`);
  }

  console.log('Migration complete. Total updated:', processed);
  process.exit(0);
}

main().catch(err => {
  console.error('Migration error', err);
  process.exit(1);
});
