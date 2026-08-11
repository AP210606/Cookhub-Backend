const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const nodemailer = require('nodemailer');

// Configure Nodemailer transporter (update with your email service credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or another email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Middleware to verify admin token (assuming JWT)
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication token missing' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Create a new booking and send confirmation email
router.post('/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    const booking = new Booking({
      ...bookingData,
      status: 'pending', // Default status
      paymentStatus: bookingData.paymentStatus || 'pending',
      paymentReceipt: bookingData.paymentReceipt || null,
    });
    await booking.save();

    // Send confirmation email upon booking creation
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.userEmail,
      subject: 'CookHub Booking Confirmation',
      html: `
        <h2>Booking Confirmation</h2>
        <p>Dear ${booking.userName},</p>
        <p>Thank you for booking with CookHub! Your cooking service has been scheduled. Below are the details:</p>
        <ul>
          <li><strong>Booking ID:</strong> ${booking._id}</li>
          <li><strong>Name:</strong> ${booking.userName}</li>
          <li><strong>Email:</strong> ${booking.userEmail}</li>
          <li><strong>Phone:</strong> ${booking.phone}</li>
          <li><strong>Plan Duration:</strong> ${booking.planDuration}</li>
          <li><strong>Total Amount:</strong> ₹${booking.totalAmount?.toLocaleString('en-IN') || 'N/A'}</li>
          <li><strong>Service Start Time:</strong> ${booking.serviceStartTime || 'Not set'}</li>
          <li><strong>Service End Time:</strong> ${booking.serviceEndTime || 'Not set'}</li>
          <li><strong>Assigned Cook:</strong> ${booking.assignedCook?.name || 'Not assigned'}</li>
          <li><strong>Payment Status:</strong> ${booking.paymentStatus || 'Pending'}</li>
          ${booking.paymentStatus === 'paid' && booking.paymentReceipt ? `
            <li><strong>Payment Receipt:</strong> ${booking.paymentReceipt.transactionId || 'N/A'}</li>
            <li><strong>Payment Date:</strong> ${booking.paymentReceipt.paymentDate || 'N/A'}</li>
            <li><strong>Payment Method:</strong> ${booking.paymentReceipt.paymentMethod || 'N/A'}</li>
          ` : '<li><strong>Payment:</strong> Pending</li>'}
        </ul>
        <p>We will notify you once your booking is approved and a cook is assigned.</p>
        <p>Best regards,<br/>The CookHub Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json(booking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: 'Failed to create booking or send email', error: err.message });
  }
});

// Admin route to send confirmation email
router.post('/admin/bookings/:id/send-confirmation-email', verifyAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('assignedCook');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const { userEmail, userName, bookingDetails } = req.body;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'CookHub Booking Approval Confirmation',
      html: `
        <h2>Booking Approved</h2>
        <p>Dear ${userName},</p>
        <p>Your booking with CookHub has been approved! Below are the details:</p>
        <ul>
          <li><strong>Booking ID:</strong> ${bookingDetails.bookingId}</li>
          <li><strong>Name:</strong> ${userName}</li>
          <li><strong>Email:</strong> ${userEmail}</li>
          <li><strong>Phone:</strong> ${booking.phone}</li>
          <li><strong>Plan Duration:</strong> ${bookingDetails.planDuration}</li>
          <li><strong>Total Amount:</strong> ₹${bookingDetails.totalAmount?.toLocaleString('en-IN') || 'N/A'}</li>
          <li><strong>Service Start Time:</strong> ${bookingDetails.serviceStartTime}</li>
          <li><strong>Service End Time:</strong> ${bookingDetails.serviceEndTime}</li>
          <li><strong>Assigned Cook:</strong> ${bookingDetails.assignedCook}</li>
          <li><strong>Payment Status:</strong> ${bookingDetails.paymentStatus}</li>
          ${bookingDetails.paymentStatus === 'paid' && bookingDetails.paymentReceipt ? `
            <li><strong>Payment Receipt:</strong> ${bookingDetails.paymentReceipt.transactionId || 'N/A'}</li>
            <li><strong>Payment Date:</strong> ${bookingDetails.paymentReceipt.paymentDate || 'N/A'}</li>
            <li><strong>Payment Method:</strong> ${bookingDetails.paymentReceipt.paymentMethod || 'N/A'}</li>
          ` : '<li><strong>Payment:</strong> Pending</li>'}
        </ul>
        <p>We look forward to serving you!</p>
        <p>Best regards,<br/>The CookHub Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Confirmation email sent successfully' });
  } catch (err) {
    console.error('Error sending confirmation email:', err);
    res.status(500).json({ message: 'Failed to send confirmation email', error: err.message });
  }
});

module.exports = router;