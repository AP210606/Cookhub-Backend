// cookhub-backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  dietPreference: String,
  numPeople: Number,
  mealType: String,
  planDuration: String,
  serviceArea: String,
  
  role: { type: String, default: 'user', enum: ['user', 'coordinator', 'admin'] }, // Added 'coordinator'
  registeredAt: { type: Date, default: Date.now },
  lastLogin: Date,
  totalBookings: { type: Number, default: 0 },
  activeBookings: { type: Number, default: 0 },
  // Password reset fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema, 'users');
















// // cookhub-backend/models/User.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const UserSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     passwordHash: { type: String, required: true },
//     phone: String,
//     role: { type: String, default: 'user', enum: ['user', 'admin', 'coordinator'] },
//     registeredAt: { type: Date, default: Date.now },
//     lastLogin: Date,
//     totalBookings: { type: Number, default: 0 },
//     activeBookings: { type: Number, default: 0 },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now },
//     assignedLocations: [{ type: String, required: true }],
// },
// { timestamps: true });



// // // Schema 1: Coordinator/Admin Users
// // const CoordinatorSchema = new mongoose.Schema({
// //   username: { type: String, required: true, unique: true },
// //   email:    { type: String, required: true, unique: true },
// //   passwordHash: { type: String, required: true },
// //   role: { type: String, enum: ['coordinator', 'admin'], default: 'coordinator' },
// //   assignedLocations: [{ type: String, required: true }]
// // }, { timestamps: true });

// // const Coordinator = mongoose.model('Coordinator', CoordinatorSchema);

// // // Schema 2: Normal Users
// // const UserSchema = new mongoose.Schema({
// //   name:   { type: String, required: true },
// //   email:  { type: String, required: true, unique: true },
// //   password: { type: String, required: true },
// //   phone: String,
// //   role: { type: String, default: 'user', enum: ['user', 'admin'] },
// //   registeredAt: { type: Date, default: Date.now },
// //   lastLogin: Date,
// //   totalBookings: { type: Number, default: 0 },
// //   activeBookings: { type: Number, default: 0 }
// // }, { timestamps: true });

// // const User = mongoose.model('User', UserSchema);

// // Hash password before saving the user
// UserSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) {
//         next();
//     }
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });

// // Method to compare entered password with hashed password
// UserSchema.methods.matchPassword = async function(enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model('User', UserSchema);