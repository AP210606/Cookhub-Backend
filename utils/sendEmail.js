// // cookhub-backend/utils/sendEmail.js
// const nodemailer = require('nodemailer');

// const sendEmail = async (options) => {
//     // Create a transporter using your email service details
//     // For development, you can use Mailtrap.io or a similar service.
//     // For production, use a service like SendGrid, Mailgun, AWS SES, etc.
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT, // Often 587 for TLS, 465 for SSL
//         secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD,
//         },
//         // Optional: For self-signed certs or local development without valid SSL
//         tls: {
//             rejectUnauthorized: false
//         }
//     });

//     const mailOptions = {
//         from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
//         to: options.email,
//         subject: options.subject,
//         html: options.message,
//     };

//     await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;