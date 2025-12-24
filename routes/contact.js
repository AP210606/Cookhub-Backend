// cookhub-backend/routes/contact.js

// old code
// const express = require('express');
// const ContactMessage = require('../models/ContactMessage'); // Import the new model
// const { protect } = require('../middleware/authMiddleware'); // Import protect middleware
// const { authorizeAdmin } = require('../middleware/adminMiddleware'); // Import authorizeAdmin middleware
// const { sendCookhubEmail } = require('../utils/email'); // <-- NEW: Import the email utility

// const router = express.Router();

// // @route   POST /api/contact
// // @desc    Submit a new contact message and send an email notification
// // @access  Public
// router.post('/', async (req, res) => {
//     const { fullName, email, mobileNumber, messageType, message, pinCode, city, state, address } = req.body;

//     // Basic validation
//     if (!fullName || !email || !message) {
//         return res.status(400).json({ message: 'Please enter all required fields: Full Name, Email, and Message.' });
//     }

//     try {
//         // Save the new contact message to the database
//         const newContactMessage = new ContactMessage({
//             fullName,
//             email,
//             mobileNumber,
//             messageType,
//             message,
//             pinCode,
//             city,
//             state,
//             address
//         });

//         const savedMessage = await newContactMessage.save();

//         // --- NEW: Email Sending Logic ---
//         // You should change this to the administrator's email address
//         const adminEmail = 'anil.admin@cookhub.com';
//         const subject = `New Contact Form Submission from ${fullName}`;
        
//         // Create an HTML body for the email notification
//         const htmlBody = `
//             <h2>New Message from Cookhub Contact Form</h2>
//             <p><strong>Name:</strong> ${fullName}</p>
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Mobile:</strong> ${mobileNumber || 'N/A'}</p>
//             <p><strong>Message Type:</strong> ${messageType || 'N/A'}</p>
//             <hr>
//             <p><strong>Message:</strong></p>
//             <p>${message}</p>
//             <hr>
//             <p><strong>Address:</strong></p>
//             <p>${address || 'N/A'}</p>
//             <p><strong>City:</strong> ${city || 'N/A'}</p>
//             <p><strong>State:</strong> ${state || 'N/A'}</p>
//             <p><strong>Pin Code:</strong> ${pinCode || 'N/A'}</p>
//         `;

//         try {
//             // Attempt to send the email notification
//             await sendCookhubEmail(adminEmail, subject, htmlBody);
//         } catch (emailError) {
//             console.error('Failed to send email notification:', emailError.message);
//             // We still send a success response to the user because the message was saved.
//             // The email failure is a backend-only issue.
//         }

//         // Send a success response to the client
//         res.status(201).json({
//             message: 'Your message has been sent successfully! We will get back to you soon.',
//             data: savedMessage
//         });

//     } catch (error) {
//         console.error('Error saving contact message:', error.message);
//         res.status(500).json({ message: 'Server error. Could not send your message.' });
//     }
// });

// // @route   GET /api/contact/admin
// // @desc    Get all contact messages (Admin only)
// // @access  Private/Admin
// router.get('/admin', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
//         res.json(messages);
//     } catch (error) {
//         console.error('Error fetching contact messages for admin:', error.message);
//         res.status(500).send('Server error');
//     }
// });

// // Optional: Route to update message status (e.g., mark as reviewed)
// // @route   PUT /api/contact/admin/:id/review
// // @desc    Mark a contact message as reviewed (Admin only)
// // @access  Private/Admin
// router.put('/admin/:id/review', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const message = await ContactMessage.findById(req.params.id);
//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }
//         message.isReviewed = !message.isReviewed; // Toggle reviewed status
//         message.reviewedBy = req.user.id; // Assuming req.user.id is set by protect middleware
//         message.reviewedAt = Date.now();
//         await message.save();
//         res.json({ message: 'Message status updated', data: message });
//     } catch (error) {
//         console.error('Error updating message status:', error.message);
//         res.status(500).send('Server error');
//     }
// });

// // Optional: Route to delete a contact message
// // @route   DELETE /api/contact/admin/:id
// // @desc    Delete a contact message (Admin only)
// // @access  Private/Admin
// router.delete('/admin/:id', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const message = await ContactMessage.findByIdAndDelete(req.params.id);
//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }
//         res.json({ message: 'Message deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting message:', error.message);
//         res.status(500).send('Server error');
//     }
// });

// module.exports = router;










// cookhub-backend/routes/contact.js
// // new code
// const express = require('express');
// const ContactMessage = require('../models/ContactMessage'); // Import the new model
// const { protect } = require('../middleware/authMiddleware'); // Import protect middleware
// const { authorizeAdmin } = require('../middleware/adminMiddleware'); // Import authorizeAdmin middleware
// const { sendCookhubEmail } = require('../utils/email'); // <-- NEW: Import the email utility

// const router = express.Router();

// // @route   POST /api/contact
// // @desc    Submit a new contact message and send an email notification
// // @access  Public
// router.post('/', async (req, res) => {
//     const { fullName, email, mobileNumber, messageType, message, pinCode, city, state, address } = req.body;

//     // Basic validation
//     if (!fullName || !email || !message) {
//         return res.status(400).json({ message: 'Please enter all required fields: Full Name, Email, and Message.' });
//     }

//     try {
//         // Save the new contact message to the database
//         const newContactMessage = new ContactMessage({
//             fullName,
//             email,
//             mobileNumber,
//             messageType,
//             message,
//             pinCode,
//             city,
//             state,
//             address
//         });

//         const savedMessage = await newContactMessage.save();

//         // --- Email confirmation for user ---
//         const subjectUser = `Thank you for contacting Cookhub, ${fullName}!`;
//         const htmlBodyUser = `
//             <h2>Hi ${fullName},</h2>
//             <p>Thank you for reaching out to Cookhub! We have received your message and our team will get back to you soon.</p>
//             <p><strong>Your message:</strong></p>
//             <blockquote>${message}</blockquote>
//             <p>Best regards,<br>Cookhub Team</p>
//         `;

//         try {
//             await sendCookhubEmail(email, subjectUser, htmlBodyUser);
//         } catch (emailError) {
//             console.error('Failed to send confirmation email to user:', emailError.message);
//             // Email failure won't stop saving the form
//         }

//         // Send success response
//         res.status(201).json({
//             message: 'Your message has been sent successfully! We will get back to you soon.',
//             data: savedMessage
//         });

//     } catch (error) {
//         console.error('Error saving contact message:', error.message);
//         res.status(500).json({ message: 'Server error. Could not send your message.' });
//     }
// });


// // @route   GET /api/contact/admin
// // @desc    Get all contact messages (Admin only)
// // @access  Private/Admin
// router.get('/admin', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
//         res.json(messages);
//     } catch (error) {
//         console.error('Error fetching contact messages for admin:', error.message);
//         res.status(500).send('Server error');
//     }
// });

// // Optional: Route to update message status (e.g., mark as reviewed)
// // @route   PUT /api/contact/admin/:id/review
// // @desc    Mark a contact message as reviewed (Admin only)
// // @access  Private/Admin
// router.put('/admin/:id/review', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const message = await ContactMessage.findById(req.params.id);
//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }
//         message.isReviewed = !message.isReviewed; // Toggle reviewed status
//         message.reviewedBy = req.user.id; // Assuming req.user.id is set by protect middleware
//         message.reviewedAt = Date.now();
//         await message.save();
//         res.json({ message: 'Message status updated', data: message });
//     } catch (error) {
//         console.error('Error updating message status:', error.message);
//         res.status(500).send('Server error');
//     }
// });

// // Optional: Route to delete a contact message
// // @route   DELETE /api/contact/admin/:id
// // @desc    Delete a contact message (Admin only)
// // @access  Private/Admin
// router.delete('/admin/:id', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const message = await ContactMessage.findByIdAndDelete(req.params.id);
//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }
//         res.json({ message: 'Message deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting message:', error.message);
//         res.status(500).send('Server error');
//     }
// });

// module.exports = router;







// cookhub-backend/routes/contact.js

// old code
// const express = require('express');
// const ContactMessage = require('../models/ContactMessage'); // Import the new model
// const { protect } = require('../middleware/authMiddleware'); // Import protect middleware
// const { authorizeAdmin } = require('../middleware/adminMiddleware'); // Import authorizeAdmin middleware
// const { sendCookhubEmail } = require('../utils/email'); // <-- NEW: Import the email utility

// const router = express.Router();

// // @route   POST /api/contact
// // @desc    Submit a new contact message and send an email notification
// // @access  Public
// router.post('/', async (req, res) => {
//     const { fullName, email, mobileNumber, messageType, message, pinCode, city, state, address } = req.body;

//     // Basic validation
//     if (!fullName || !email || !message) {
//         return res.status(400).json({ message: 'Please enter all required fields: Full Name, Email, and Message.' });
//     }

//     try {
//         // Save the new contact message to the database
//         const newContactMessage = new ContactMessage({
//             fullName,
//             email,
//             mobileNumber,
//             messageType,
//             message,
//             pinCode,
//             city,
//             state,
//             address
//         });

//         const savedMessage = await newContactMessage.save();

//         // --- NEW: Email Sending Logic ---
//         // You should change this to the administrator's email address
//         const adminEmail = 'anil.admin@cookhub.com';
//         const subject = `New Contact Form Submission from ${fullName}`;
        
//         // Create an HTML body for the email notification
//         const htmlBody = `
//             <h2>New Message from Cookhub Contact Form</h2>
//             <p><strong>Name:</strong> ${fullName}</p>
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Mobile:</strong> ${mobileNumber || 'N/A'}</p>
//             <p><strong>Message Type:</strong> ${messageType || 'N/A'}</p>
//             <hr>
//             <p><strong>Message:</strong></p>
//             <p>${message}</p>
//             <hr>
//             <p><strong>Address:</strong></p>
//             <p>${address || 'N/A'}</p>
//             <p><strong>City:</strong> ${city || 'N/A'}</p>
//             <p><strong>State:</strong> ${state || 'N/A'}</p>
//             <p><strong>Pin Code:</strong> ${pinCode || 'N/A'}</p>
//         `;

//         try {
//             // Attempt to send the email notification
//             await sendCookhubEmail(adminEmail, subject, htmlBody);
//         } catch (emailError) {
//             console.error('Failed to send email notification:', emailError.message);
//             // We still send a success response to the user because the message was saved.
//             // The email failure is a backend-only issue.
//         }

//         // Send a success response to the client
//         res.status(201).json({
//             message: 'Your message has been sent successfully! We will get back to you soon.',
//             data: savedMessage
//         });

//     } catch (error) {
//         console.error('Error saving contact message:', error.message);
//         res.status(500).json({ message: 'Server error. Could not send your message.' });
//     }
// });

// // @route   GET /api/contact/admin
// // @desc    Get all contact messages (Admin only)
// // @access  Private/Admin
// router.get('/admin', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
//         res.json(messages);
//     } catch (error) {
//         console.error('Error fetching contact messages for admin:', error.message);
//         res.status(500).send('Server error');
//     }
// });

// // Optional: Route to update message status (e.g., mark as reviewed)
// // @route   PUT /api/contact/admin/:id/review
// // @desc    Mark a contact message as reviewed (Admin only)
// // @access  Private/Admin
// router.put('/admin/:id/review', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const message = await ContactMessage.findById(req.params.id);
//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }
//         message.isReviewed = !message.isReviewed; // Toggle reviewed status
//         message.reviewedBy = req.user.id; // Assuming req.user.id is set by protect middleware
//         message.reviewedAt = Date.now();
//         await message.save();
//         res.json({ message: 'Message status updated', data: message });
//     } catch (error) {
//         console.error('Error updating message status:', error.message);
//         res.status(500).send('Server error');
//     }
// });

// // Optional: Route to delete a contact message
// // @route   DELETE /api/contact/admin/:id
// // @desc    Delete a contact message (Admin only)
// // @access  Private/Admin
// router.delete('/admin/:id', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const message = await ContactMessage.findByIdAndDelete(req.params.id);
//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }
//         res.json({ message: 'Message deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting message:', error.message);
//         res.status(500).send('Server error');
//     }
// });

// module.exports = router;










// cookhub-backend/routes/contact.js
// new code
// const express = require('express');
// const ContactMessage = require('../models/ContactMessage'); // Import the new model
// const { protect } = require('../middleware/authMiddleware'); // Import protect middleware
// const { authorizeAdmin } = require('../middleware/adminMiddleware'); // Import authorizeAdmin middleware
// const { sendCookhubEmail } = require('../utils/email'); // <-- NEW: Import the email utility

// const router = express.Router();

// // @route   POST /api/contact
// // @desc    Submit a new contact message and send an email notification
// // @access  Public
// router.post('/', async (req, res) => {
//     const { fullName, email, mobileNumber, messageType, message, pinCode, city, state, address } = req.body;

//     // Basic validation
//     if (!fullName || !email || !message) {
//         return res.status(400).json({ message: 'Please enter all required fields: Full Name, Email, and Message.' });
//     }

//     try {
//         // Save the new contact message to the database
//         const newContactMessage = new ContactMessage({
//             fullName,
//             email,
//             mobileNumber,
//             messageType,
//             message,
//             pinCode,
//             city,
//             state,
//             address
//         });

//         const savedMessage = await newContactMessage.save();

//         // --- Email confirmation for user ---
//         const subjectUser = `Thank you for contacting Cookhub, ${fullName}!`;
//         const htmlBodyUser = `
//             <h2>Hi ${fullName},</h2>
//             <p>Thank you for reaching out to Cookhub! We have received your message and our team will get back to you soon.</p>
//             <p><strong>Your message:</strong></p>
//             <blockquote>${message}</blockquote>
//             <p>Best regards,<br>Cookhub Team</p>
//         `;

//         try {
//             await sendCookhubEmail(email, subjectUser, htmlBodyUser);
//         } catch (emailError) {
//             console.error('Failed to send confirmation email to user:', emailError.message);
//             // Email failure won't stop saving the form
//         }

//         // Send success response
//         res.status(201).json({
//             message: 'Your message has been sent successfully! We will get back to you soon.',
//             data: savedMessage
//         });

//     } catch (error) {
//         console.error('Error saving contact message:', error.message);
//         res.status(500).json({ message: 'Server error. Could not send your message.' });
//     }
// });


// // @route   GET /api/contact/admin
// // @desc    Get all contact messages (Admin only)
// // @access  Private/Admin
// router.get('/admin', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
//         res.json(messages);
//     } catch (error) {
//         console.error('Error fetching contact messages for admin:', error.message);
//         res.status(500).send('Server error');
//     }
// });

// // Optional: Route to update message status (e.g., mark as reviewed)
// // @route   PUT /api/contact/admin/:id/review
// // @desc    Mark a contact message as reviewed (Admin only)
// // @access  Private/Admin
// router.put('/admin/:id/review', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const message = await ContactMessage.findById(req.params.id);
//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }
//         message.isReviewed = !message.isReviewed; // Toggle reviewed status
//         message.reviewedBy = req.user.id; // Assuming req.user.id is set by protect middleware
//         message.reviewedAt = Date.now();
//         await message.save();
//         res.json({ message: 'Message status updated', data: message });
//     } catch (error) {
//         console.error('Error updating message status:', error.message);
//         res.status(500).send('Server error');
//     }
// });

// // Optional: Route to delete a contact message
// // @route   DELETE /api/contact/admin/:id
// // @desc    Delete a contact message (Admin only)
// // @access  Private/Admin
// router.delete('/admin/:id', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const message = await ContactMessage.findByIdAndDelete(req.params.id);
//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }
//         res.json({ message: 'Message deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting message:', error.message);
//         res.status(500).send('Server error');
//     }
// });

// module.exports = router;

















const express = require("express");
const ContactMessage = require("../models/ContactMessage");
const { protect } = require("../middleware/authMiddleware");
const { authorizeAdmin } = require("../middleware/adminMiddleware");
const { sendCookhubEmail } = require("../utils/email");

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit a new contact message and send email notifications
// @access  Public
router.post("/", async (req, res) => {
  const {
    fullName,
    email,
    mobileNumber,
    messageType,
    message,
    pinCode,
    city,
    state,
    address,
    paymentDetails,
    preferredTime,
    paymentAmount,
    transactionId,
    paymentDate,
  } = req.body;

  // Basic validation
  if (!fullName || !email || !message) {
    return res
      .status(400)
      .json({
        message:
          "Please enter all required fields: Full Name, Email, and Message.",
      });
  }

  try {
    const newContactMessage = new ContactMessage({
      fullName,
      email,
      mobileNumber,
      messageType,
      message,
      pinCode,
      city,
      state,
      address,
      paymentDetails,
      preferredTime,
      paymentAmount,
      transactionId,
      paymentDate,
    });

    const savedMessage = await newContactMessage.save();

    const adminEmail = "admin@cookhub.com";
    const adminSubject = `New Contact Form Submission from ${fullName}`;
    const adminHtmlBody = `
            <h2>New Message from Cookhub Contact Form</h2>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mobile:</strong> ${mobileNumber || "N/A"}</p>
            <p><strong>Message Type:</strong> ${messageType || "N/A"}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <hr>
            <p><strong>Address:</strong></p>
            <p>${address || "N/A"}</p>
            <p><strong>City:</strong> ${city || "N/A"}</p>
            <p><strong>State:</strong> ${state || "N/A"}</p>
            <p><strong>Pin Code:</strong> ${pinCode || "N/A"}</p>
            <hr>
            <p><strong>Payment Details:</strong> ${paymentDetails || "N/A"}</p>
            <p><strong>Preferred Time:</strong> ${preferredTime || "N/A"}</p>
            <p><strong>Payment Amount:</strong> ${paymentAmount || "N/A"}</p>
            <p><strong>Transaction ID:</strong> ${transactionId || "N/A"}</p>
            <p><strong>Payment Date:</strong> ${
              paymentDate ? new Date(paymentDate).toLocaleDateString() : "N/A"
            }</p>
        `;

    let adminEmailStatus;
    try {
      adminEmailStatus = await sendCookhubEmail(
        adminEmail,
        adminSubject,
        adminHtmlBody
      );
    } catch (emailError) {
      console.error(
        "Failed to send admin email notification:",
        emailError.message
      );
      adminEmailStatus = { success: false, message: emailError.message };
    }

    const userSubject = "Thank You for Contacting Cookhub!";
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
                    <div class="header"><h2>Thank You, ${fullName}!</h2></div>
                    <div class="section"><p>We have received your contact form submission and will get back to you soon. Below is a summary of your submission:</p></div>
                    <div class="section"><h3>Your Details</h3><div class="details"><table><tr><td>Name:</td><td>${fullName}</td></tr><tr><td>Email:</td><td><a href="mailto:${email}">${email}</a></td></tr><tr><td>Mobile Number:</td><td>${
      mobileNumber || "N/A"
    }</td></tr><tr><td>Message Type:</td><td>${
      messageType || "N/A"
    }</td></tr><tr><td>Message:</td><td>${message}</td></tr></table></div></div>
                    <div class="section"><h3>Address Details</h3><div class="details"><table><tr><td>Address:</td><td>${
                      address || "N/A"
                    }</td></tr><tr><td>City:</td><td>${
      city || "N/A"
    }</td></tr><tr><td>State:</td><td>${
      state || "N/A"
    }</td></tr><tr><td>Pin Code:</td><td>${
      pinCode || "N/A"
    }</td></tr></table></div></div>
                    <div class="section"><h3>Additional Information</h3><div class="details"><table><tr><td>Payment Details:</td><td>${
                      paymentDetails || "To be confirmed"
                    }</td></tr><tr><td>Preferred Contact Time:</td><td>${
      preferredTime || "Not specified"
    }</td></tr></table></div></div>
                    <div class="section"><h3>Payment Receipt</h3><div class="details"><table><tr><td>Amount:</td><td>${
                      paymentAmount || "N/A"
                    }</td></tr><tr><td>Transaction ID:</td><td>${
      transactionId || "N/A"
    }</td></tr><tr><td>Payment Date:</td><td>${
      paymentDate
        ? new Date(paymentDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "N/A"
    }</td></tr></table><p style="color: #e74c3c; font-size: 12px;">* This is a confirmation of your submission. Please retain this email for your records.</p></div></div>
                    <div class="footer"><p>Best regards,<br>The Cookhub Team</p><p>&copy; ${new Date().getFullYear()} Cookhub. All rights reserved.</p></div>
                </div>
            </body>
            </html>
        `;

    let userEmailStatus;
    try {
      userEmailStatus = await sendCookhubEmail(
        email,
        userSubject,
        userHtmlBody
      );
    } catch (emailError) {
      console.error(
        "Failed to send user confirmation email:",
        emailError.message
      );
      userEmailStatus = { success: false, message: emailError.message };
    }

    res.status(201).json({
      message:
        "Your message has been sent successfully! We will get back to you soon.",
      data: savedMessage,
      emailStatus: { adminEmail: adminEmailStatus, userEmail: userEmailStatus },
    });
  } catch (error) {
    console.error("Error saving contact message:", error.message);
    res
      .status(500)
      .json({ message: "Server error. Could not send your message." });
  }
});

// @route   GET /api/contact/admin
// @desc    Get all contact messages (Admin only)
// @access  Private/Admin
router.get("/admin", protect, authorizeAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching contact messages for admin:", error.message);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/contact/:id
// @desc    Get details of a specific contact message
// @access  Private/Admin
router.get("/:id", protect, authorizeAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json(message);
  } catch (error) {
    console.error("Error fetching contact message details:", error.message);
    res
      .status(500)
      .json({ message: "Server error. Could not fetch message details." });
  }
});

// @route   PUT /api/contact/admin/:id/review
// @desc    Mark a contact message as reviewed (Admin only)
// @access  Private/Admin
router.put("/admin/:id/review", protect, authorizeAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    message.isReviewed = !message.isReviewed;
    message.reviewedBy = req.user.id;
    message.reviewedAt = Date.now();
    await message.save();
    res.json({ message: "Message status updated", data: message });
  } catch (error) {
    console.error("Error updating message status:", error.message);
    res.status(500).send("Server error");
  }
});

// @route   DELETE /api/contact/admin/:id
// @desc    Delete a contact message (Admin only)
// @access  Private/Admin
router.delete("/admin/:id", protect, authorizeAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
