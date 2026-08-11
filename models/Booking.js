// cookhub-backend/models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links this booking to a User document
        required: true
    },
    userName: { // Store user name for easier display in admin dashboard
        type: String,
        required: true
    },
    userEmail: { // Store user email for easier display in admin dashboard
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    dietaryPreference: {
        type: String,
        required: true
    },
    mealPreference: {
        type: String,
        required: true
    },
    planDuration: {
        type: String,
        required: true
    },
    numPeople: { // Added from frontend booking form
        type: Number,
        required: true
    },
    totalAmount: { // NEW: Store the calculated total amount for the booking
        type: Number,
        required: true
    },
    message: {
        type: String
    },
    // use this for the all bookings list in admin dashboard
    status: { // e.g., 'pending', 'approved', 'rejected', 'demo_scheduled'
        type: String,
        enum: ['pending', 'approved', 'rejected', 'demo_scheduled'],
        lowercase: true,
        required: true,
        default: 'pending'
    },
    assignedCook: { // NEW: Reference to the assigned cook (optional, can be null initially)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cook', // Will link to a new 'Cook' model
        default: null
    },
    assignedCookName: { // NEW: Store cook name for easier display without populating
        type: String,
        default: null
    },
    serviceStartTime: { // NEW: When the cook's service for this booking starts (e.g., for a demo)
        type: Date,
        default: null
    },
    serviceEndTime: { // NEW: When the cook's service for this booking ends
        type: Date,
        default: null
    },
    // Human-friendly incremental booking id for display e.g. 1,2,3...
    displayId: {
        type: Number,
        index: true,
        unique: true,
        sparse: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    preferredStartDate: { type: Date },
    preferredMealTime: { type: String }, // e.g., "13:00-14:30,19:00-20:30"
    cookVisitDurationNote: { type: String, default: "Cook stays only 1.5 hours per visit" }
},
{ timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);












// // cookhub-backend/models/Booking.js
// const mongoose = require('mongoose');

// const BookingSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User', // Links this booking to a User document
//         required: true
//     },
//     userName: { // Store user name for easier display in admin dashboard
//         type: String,
//         required: true
//     },
//     userEmail: { // Store user email for easier display in admin dashboard
//         type: String,
//         required: true
//     },
//     phone: {
//         type: String,
//         required: true
//     },
//     address: {
//         type: String,
//         required: true
//     },
//     dietaryPreference: {
//         type: String,
//         required: true
//     },
//     mealPreference: {
//         type: String,
//         required: true
//     },
//     planDuration: {
//         type: String,
//         required: true
//     },
//     numPeople: { // Added from frontend booking form
//         type: Number,
//         required: true
//     },
//     totalAmount: { // NEW: Store the calculated total amount for the booking
//         type: Number,
//         required: true
//     },
//     message: {
//         type: String
//     },
//     // use this for the all bookings list in admin dashboard
//     status: { // e.g., 'pending', 'approved', 'rejected', 'demo_scheduled'
//         type: String,
//         enum: ['pending', 'approved', 'rejected', 'demo_scheduled'],
//         lowercase: true,
//         required: true,
//         default: 'pending'
//     },
//     assignedCook: { // NEW: Reference to the assigned cook (optional, can be null initially)
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Cook', // Will link to a new 'Cook' model
//         default: null
//     },
//     assignedCookName: { // NEW: Store cook name for easier display without populating
//         type: String,
//         default: null
//     },
//     serviceStartTime: { // NEW: When the cook's service for this booking starts (e.g., for a demo)
//         type: Date,
//         default: null
//     },
//     serviceEndTime: { // NEW: When the cook's service for this booking ends
//         type: Date,
//         default: null
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// },
// { timestamps: true });

// module.exports = mongoose.model('Booking', BookingSchema);