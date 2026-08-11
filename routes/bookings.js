// cookhub-backend/routes/bookings.js
const express = require('express');
const Booking = require('../models/Booking');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Ensure authorizeRoles is imported
const { sendCookhubEmail } = require('../utils/email');

const router = express.Router();
const Counter = require('../models/Counter');

// @route   POST /api/bookings
// @desc    Create a new booking request and send confirmation email
// @access  Private (requires authentication)
router.post('/', protect, async (req, res) => {
    console.log('Backend: Received booking request body:', req.body);
    const { phone, address, dietaryPreference, mealPreference, planDuration, numPeople, message, totalAmount, paymentStatus, paymentReceipt } = req.body;

    // Validate required fields. Allow totalAmount === 0 for free/demo bookings.
    if (!phone || !address || !planDuration || !numPeople || (totalAmount === undefined || totalAmount === null)) {
        console.error('Backend: Missing required fields in req.body');
        return res.status(400).json({ message: 'Required fields are missing: phone, address, planDuration, numPeople, and totalAmount.' });
    }

    try {
        const newBooking = new Booking({
            user: req.user.id,
            userName: req.user.name, // Store user's name directly
            userEmail: req.user.email, // Store user's email directly
            phone,
            address,
            dietaryPreference,
            mealPreference,
            planDuration,
            message,
            numPeople,
            totalAmount: parseFloat(totalAmount), // Ensure it's a number
            paymentStatus: paymentStatus || 'pending', // Default to 'pending' if not provided
            paymentReceipt: paymentReceipt || null, // Store payment receipt if provided
            status: 'pending', // Default status
        });

        // Assign a human-friendly incremental displayId atomically
        try {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'booking' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            newBooking.displayId = counter.seq;
        } catch (ctrErr) {
            console.warn('Failed to assign booking displayId, proceeding without it:', ctrErr.message);
        }

        const booking = await newBooking.save();
        console.log('Backend: Booking saved successfully:', booking);

        // Prepare email content
        const userSubject = 'Cookhub Booking Confirmation';
        const userHtmlBody = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; }
                    .header { background-color: #f8f8f8; text-align: center; padding: 10px; }
                    .section { margin: 20px 0; }
                    .section h3 { color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                    .details table { width: 100%; border-collapse: collapse; }
                    .details td { padding: 8px; border-bottom: 1px solid #eee; }
                    .details td:first-child { font-weight: bold; width: 30%; }
                    .footer { text-align: center; font-size: 12px; color: #7f8c8d; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header"><h2>Booking Confirmation</h2></div>
                    <div class="section"><p>Dear ${req.user.name},</p><p>Thank you for booking with Cookhub! Your booking details are below. Please retain this email for your records.</p></div>
                    <div class="section"><h3>Booking Details</h3><div class="details"><table>
                        <tr><td>Booking ID:</td><td>${booking.displayId || booking._id}</td></tr>
                        <tr><td>Name:</td><td>${req.user.name}</td></tr>
                        <tr><td>Email:</td><td>${req.user.email}</td></tr>
                        <tr><td>Phone:</td><td>${phone}</td></tr>
                        <tr><td>Address:</td><td>${address}</td></tr>
                        <tr><td>Dietary Preference:</td><td>${dietaryPreference || 'Not specified'}</td></tr>
                        <tr><td>Meal Preference:</td><td>${mealPreference || 'Not specified'}</td></tr>
                        <tr><td>Plan Duration:</td><td>${planDuration}</td></tr>
                        <tr><td>Number of People:</td><td>${numPeople}</td></tr>
                        <tr><td>Total Amount:</td><td>₹${parseFloat(totalAmount).toLocaleString('en-IN')}</td></tr>
                    </table></div></div>
                    <div class="section"><h3>Payment Information</h3><div class="details"><table>
                        <tr><td>Payment Status:</td><td>${paymentStatus || 'Pending'}</td></tr>
                        ${paymentStatus === 'paid' && paymentReceipt ? `
                            <tr><td>Transaction ID:</td><td>${paymentReceipt.transactionId || 'N/A'}</td></tr>
                            <tr><td>Payment Date:</td><td>${new Date(paymentReceipt.paymentDate || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td></tr>
                            <tr><td>Payment Method:</td><td>${paymentReceipt.paymentMethod || 'N/A'}</td></tr>
                        ` : '<tr><td>Payment:</td><td>Pending</td></tr>'}
                    </table><p style="color: #e74c3c; font-size: 12px;">* This is a confirmation of your booking. Contact us if there are any discrepancies.</p></div></div>
                    <div class="footer"><p>Best regards,<br>The Cookhub Team</p><p>&copy; ${new Date().getFullYear()} Cookhub. All rights reserved.</p></div>
                </div>
            </body>
            </html>
        `;

        // Send confirmation email
        let userEmailStatus;
        try {
            userEmailStatus = await sendCookhubEmail(req.user.email, userSubject, userHtmlBody);
            if (!userEmailStatus.success) {
                console.warn('Email sent with warnings:', userEmailStatus.message);
            }
        } catch (emailError) {
            console.error('Failed to send booking confirmation email:', emailError.message);
            userEmailStatus = { success: false, message: emailError.message };
        }

        res.status(201).json({
            message: 'Booking request submitted successfully! A confirmation email has been sent.',
            booking,
            emailStatus: userEmailStatus,
        });
    } catch (error) {
        console.error('Error creating booking:', error.message);
        if (error.name === 'ValidationError') {
            console.error('Backend: Mongoose Validation Error Details:', error.errors);
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: `Validation failed: ${errors.join(', ')}` });
        }
        res.status(500).json({ message: 'Server error. Could not create booking.' });
    }
});

// @route   GET /api/bookings/my
// @desc    Get bookings for the logged-in user
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update the status of a specific booking
// @access  Private (admin only)
router.put('/:id/status', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updated) return res.status(404).json({ message: 'Booking not found' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;











// cookhub-backend/routes/bookings.js
// const express = require('express');
// const Booking = require('../models/Booking');
// const { protect } = require('../middleware/authMiddleware');
// const { sendCookhubEmail } = require('../utils/email');

// const router = express.Router();

// // @route   POST /api/bookings
// // @desc    Create a new booking and send confirmation email
// // @access  Private
// router.post('/', protect, async (req, res) => {
//     const { cookingService, bookingDate, bookingTime, paymentAmount, transactionId, mobileNumber } = req.body;
//     const userId = req.user.id;
//     const userEmail = req.user.email;
//     const userName = req.user.name || 'Customer';

//     if (!cookingService || !bookingDate || !bookingTime || !paymentAmount || !transactionId || !mobileNumber) {
//         return res.status(400).json({ message: 'All fields are required: cookingService, bookingDate, bookingTime, paymentAmount, transactionId, and mobileNumber.' });
//     }

//     try {
//         const newBooking = new Booking({
//             userId,
//             cookingService,
//             bookingDate,
//             bookingTime,
//             paymentAmount,
//             transactionId,
//             mobileNumber
//         });

//         const savedBooking = await newBooking.save();

//         const userSubject = 'Cookhub Booking Confirmation';
//         const userHtmlBody = `
//             <!DOCTYPE html>
//             <html lang="en">
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <style>
//                     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                     .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; }
//                     .header { background-color: #f8f8f8; text-align: center; padding: 10px; }
//                     .section { margin: 20px 0; }
//                     .section h3 { color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
//                     .details table { width: 100%; border-collapse: collapse; }
//                     .details td { padding: 8px; border-bottom: 1px solid #eee; }
//                     .details td:first-child { font-weight: bold; width: 30%; }
//                     .footer { text-align: center; font-size: 12px; color: #7f8c8d; margin-top: 20px; }
//                 </style>
//             </head>
//             <body>
//                 <div class="container">
//                     <div class="header"><h2>Booking Confirmation</h2></div>
//                     <div class="section"><p>Dear ${userName},</p><p>Thank you for booking with Cookhub! Your booking details are below. Please retain this email for your records.</p></div>
//                     <div class="section"><h3>Booking Details</h3><div class="details"><table><tr><td>Cooking Service:</td><td>${cookingService}</td></tr><tr><td>Booking Date:</td><td>${new Date(bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td></tr><tr><td>Booking Time:</td><td>${bookingTime}</td></tr></table></div></div>
//                     <div class="section"><h3>Payment Receipt</h3><div class="details"><table><tr><td>Amount:</td><td>$${paymentAmount}</td></tr><tr><td>Transaction ID:</td><td>${transactionId}</td></tr><tr><td>Payment Date:</td><td>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td></tr></table><p style="color: #e74c3c; font-size: 12px;">* This is a confirmation of your payment. Contact us if there are any discrepancies.</p></div></div>
//                     <div class="section"><h3>Contact Information</h3><div class="details"><table><tr><td>Mobile Number:</td><td>${mobileNumber}</td></tr><tr><td>Email:</td><td><a href="mailto:${userEmail}">${userEmail}</a></td></tr></table></div></div>
//                     <div class="footer"><p>Best regards,<br>The Cookhub Team</p><p>&copy; ${new Date().getFullYear()} Cookhub. All rights reserved.</p></div>
//                 </div>
//             </body>
//             </html>
//         `;

//         let userEmailStatus;
//         try {
//             userEmailStatus = await sendCookhubEmail(userEmail, userSubject, userHtmlBody);
//         } catch (emailError) {
//             console.error('Failed to send booking confirmation email:', emailError.message);
//             userEmailStatus = { success: false, message: emailError.message };
//         }

//         res.status(201).json({
//             message: 'Booking created successfully! A confirmation email has been sent.',
//             data: savedBooking,
//             emailStatus: userEmailStatus
//         });
//     } catch (error) {
//         console.error('Error creating booking:', error.message);
//         res.status(500).json({ message: 'Server error. Could not create booking.' });
//     }
// });

// // @route   GET /api/bookings/:id
// // @desc    Get details of a specific booking
// // @access  Private
// router.get('/:id', protect, async (req, res) => {
//     try {
//         const booking = await Booking.findById(req.params.id).populate('userId', 'name email');
//         if (!booking) {
//             return res.status(404).json({ message: 'Booking not found' });
//         }
//         res.json(booking);
//     } catch (error) {
//         console.error('Error fetching booking details:', error.message);
//         res.status(500).json({ message: 'Server error. Could not fetch booking details.' });
//     }
// });

// module.exports = router;