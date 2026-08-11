const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  location: { type: String, required: true }, // e.g., "New York"
  applicantName: { type: String, required: true },
  position: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);



// const mongoose = require('mongoose');

// const applicationSchema = new mongoose.Schema({
//   location: { type: String, required: true }, // e.g., "New York"
//   applicantName: { type: String, required: true },
//   position: { type: String, required: true },
//   email: { type: String, required: true },
//   phone: { type: String, required: true },
//   experience: { type: Number, required: true },
//   specialty: { type: String, required: true },
//   status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
// }, { timestamps: true });

// module.exports = mongoose.model('Application', applicationSchema);