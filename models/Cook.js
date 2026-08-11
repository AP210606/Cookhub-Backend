// cookhub-backend/models/Cook.js
// This file remains the same as the schema is already configured correctly.
const mongoose = require('mongoose');

const CookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: { 
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
    },
    password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false, // Hide in queries by default
    },
    phone: {
        type: String,
        trim: true,
    },
    specialties: {
        type: [String],
        default: [],
    },
    serviceAreas: {
        type: [String],
        default: [],
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    // Aggregate rating fields - stored for quick read access
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    ratingCount: {
        type: Number,
        default: 0,
    },
    // Password reset fields
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    activeBookings: [ 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, 
    {
    timestamps: true,
    }
);



module.exports = mongoose.model('Cook', CookSchema , 'cooks');




// cookhub-backend/models/Cook.js
// // This file remains the same as the schema is already configured correctly.
// const mongoose = require("mongoose");

// const CookSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       unique: true,
//       sparse: true,
//       trim: true,
//     },
//     phone: {
//       type: String,
//       trim: true,
//     },
//     experience: { type: Number, required: true, min: 0 },
//     specialties: {
//       type: [String],
//       default: [],
//     },
//     serviceAreas: {
//       type: [String],
//       default: [],
//     },
//     isAvailable: {
//       type: Boolean,
//       default: true,
//     },
//     activeBookings: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Booking",
//       },
//     ],
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     rating: { type: Number, min: 1, max: 5, default: 5 },
//   location: { type: String, required: true },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Cook", CookSchema);












// const mongoose = require('mongoose');

// const CookSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref: 'User',
//     },
//     email: { // Optional: if cooks have logins
//         type: String,
//         unique: true,
//         sparse: true, // Allows null values to not violate unique constraint
//         trim: true,
//     },
//     phone: {
//         type: String,
//         trim: true,
//     },
//     specialties: { // e.g., ['North Indian', 'Jain', 'South Indian']
//         type: [String],
//         default: [],
//     },
//     // Location where the cook primarily operates
//     serviceAreas: {
//         type: [String], // e.g., ['South Delhi', 'West Mumbai']
//         default: [],
//     },
//     // A simple availability status (can be expanded to time slots)
//     isAvailable: {
//         type: Boolean,
//         default: true,
//     },
//     // Booked slots can be complex, for simplicity, we'll track active bookings
//     activeBookings: [ // Array of booking IDs this cook is currently assigned to
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Booking'
//         }
//     ],
// }, 
//     {
//     timestamps: true, // Adds createdAt and updatedAt
//     }
// );

// // This line correctly checks if the 'Cook' model has already been compiled.
// // If it exists, it uses the existing one. If not, it creates a new one.
// const Cook = mongoose.models.Cook || mongoose.model('Cook', CookSchema);


// // The fix is here: export the 'Cook' constant you just defined,
// // not a new, separate model.
// module.exports = Cook;















// // cookhub-backend/models/Cook.js
// const mongoose = require('mongoose');

// const CookSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     email: { // Optional: if cooks have logins
//         type: String,unique: true,sparse: true, // Allows null values to not violate unique constrainttrim: true,
//     },
//     phone: {
//         type: String,trim: true,
//     },
//     specialties: { // e.g., ['North Indian', 'Jain', 'South Indian']
//         type: [String],default: [],
//     },
//     // Location where the cook primarily operates
//     serviceAreas: {
//         type: [String], // e.g., ['South Delhi', 'West Mumbai']default: [],
//     },
//     // A simple availability status (can be expanded to time slots)
//     isAvailable: {
//         type: Boolean,default: true,
//     },
//     // Booked slots can be complex, for simplicity, we'll track active bookings
//     activeBookings: [ // Array of booking IDs this cook is currently assigned to
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Booking'
//         }
//     ],
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
//     location: { type: String, required: true },
//     name: { type: String, required: true },
//     experience: { type: Number, required: true },
//     specialty: { type: String, required: true },
//     contact: { type: String, required: true },
//     contactInfo: {
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//   },
//     availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
//     rating: { type: Number, min: 1, max: 5, default: 5 },
//     joinDate: { type: Date, default: Date.now },
// }, 
//     {
//     timestamps: true, // Adds updatedAt
//     }
// );

// module.exports = mongoose.model('Cook', CookSchema);












// const mongoose = require('mongoose');

// const CookSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref: 'User',
//     },
//     email: { // Optional: if cooks have logins
//         type: String,
//         unique: true,
//         sparse: true, // Allows null values to not violate unique constraint
//         trim: true,
//     },
//     phone: {
//         type: String,
//         trim: true,
//     },
//     specialties: { // e.g., ['North Indian', 'Jain', 'South Indian']
//         type: [String],
//         default: [],
//     },
//     // Location where the cook primarily operates
//     serviceAreas: {
//         type: [String], // e.g., ['South Delhi', 'West Mumbai']
//         default: [],
//     },
//     // A simple availability status (can be expanded to time slots)
//     isAvailable: {
//         type: Boolean,
//         default: true,
//     },
//     // Booked slots can be complex, for simplicity, we'll track active bookings
//     activeBookings: [ // Array of booking IDs this cook is currently assigned to
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Booking'
//         }
//     ],
// }, 
//     {
//     timestamps: true, // Adds createdAt and updatedAt
//     }
// );

// // This line correctly checks if the 'Cook' model has already been compiled.
// // If it exists, it uses the existing one. If not, it creates a new one.
// const Cook = mongoose.models.Cook || mongoose.model('Cook', CookSchema);


// // The fix is here: export the 'Cook' constant you just defined,
// // not a new, separate model.
// module.exports = Cook;
