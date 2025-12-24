// // controllers/contactController.js
// const { sendCookhubEmail } = require('../utils/email');

// const submitContactForm = async (req, res) => {
//     try {
//         const { fullName, email, messageType, message } = req.body;

//         // Save form data to DB (optional)
//         // await ContactMessage.create({ fullName, email, messageType, message });

//         // Send confirmation to the user
//         await sendCookhubEmail(
//             email, // <-- use the email from the form, not admin's email
//             "Thank you for contacting Cookhub!",
//             `<p>Hi ${fullName},</p>
//              <p>Thank you for reaching out. We have received your message:</p>
//              <blockquote>${message}</blockquote>
//              <p>We’ll get back to you soon!</p>`
//         );

//         // (Optional) Also send a copy to the admin
//         await sendCookhubEmail(
//             process.env.GMAIL_EMAIL, // Admin email from env
//             `New Contact Form Submission from ${fullName}`,
//             `<p><strong>Name:</strong> ${fullName}</p>
//              <p><strong>Email:</strong> ${email}</p>
//              <p><strong>Message Type:</strong> ${messageType}</p>
//              <p><strong>Message:</strong> ${message}</p>`
//         );

//         res.status(200).json({ success: true, message: "Form submitted successfully" });
//     } catch (error) {
//         console.error("Error submitting form:", error);
//         res.status(500).json({ success: false, message: "Failed to submit form" });
//     }
// };

// module.exports = { submitContactForm };
