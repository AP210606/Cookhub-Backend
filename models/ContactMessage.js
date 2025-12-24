const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address'],
        trim: true,
    },
    mobileNumber: {
        type: String,
        trim: true,
    },
    messageType: {
        type: String,
        enum: ['General Inquiry', 'Complaint', 'Suggestion', 'Partnership', ''],
        default: '',
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    pinCode: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
    },
    state: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    paymentDetails: {
        type: String,
        trim: true,
        default: 'N/A',
    },
    preferredTime: {
        type: String,
        trim: true,
        default: 'N/A',
    },
    paymentAmount: {
        type: String,
        trim: true,
        default: 'N/A',
    },
    transactionId: {
        type: String,
        trim: true,
        default: 'N/A',
    },
    paymentDate: {
        type: Date,
        default: null,
    },
    isReviewed: {
        type: Boolean,
        default: false,
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewedAt: {
        type: Date,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);














// // cookhub-backend/models/ContactMessage.js
// const mongoose = require('mongoose');

// const ContactMessageSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     phone: String,
//     role: { type: String, default: 'user', enum: ['user', 'admin'] },
//     registeredAt: { type: Date, default: Date.now },
//     lastLogin: Date,
//     totalBookings: { type: Number, default: 0 },
//     activeBookings: { type: Number, default: 0 },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now }

//     // fullName: {
//     //     type: String,
//     //     required: true,
//     //     trim: true,
//     // },
//     // email: {
//     //     type: String,
//     //     required: true,
//     //     match: [/.+@.+\..+/, 'Please fill a valid email address'], // Basic email validation
//     //     trim: true,
//     // },
//     // messageType: {
//     //     type: String,
//     //     enum: ['General Inquiry', 'Complaint', 'Suggestion', 'Partnership', ''], // Match frontend options
//     //     default: '',
//     // },
//     // message: {
//     //     type: String,
//     //     required: true,
//     //     trim: true,
//     // },
//     // // Optional: Add a field to track if the message has been reviewed/responded to by admin
//     // isReviewed: {
//     //     type: Boolean,
//     //     default: false,
//     // },
//     // reviewedBy: {
//     //     type: mongoose.Schema.Types.ObjectId,
//     //     ref: 'User',
//     // },
//     // reviewedAt: {
//     //     type: Date,
//     // }
// }, {
//     timestamps: true, // Adds createdAt and updatedAt fields automatically
// });

// module.exports = mongoose.model('ContactMessage', ContactMessageSchema);