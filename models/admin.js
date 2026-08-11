// // 
// const mongoose = require('mongoose');

// const adminSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     lowercase: true,
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6,
//   },
//   role: {
//     type: String,
//     default: 'admin',
//     enum: ['admin'], // Restrict to 'admin' role for now
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Pre-save middleware to update the updatedAt field
// adminSchema.pre('save', function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

// module.exports = mongoose.model('Admin', adminSchema);
