// // D:\DNG\cookhub-app-anil\cookhub-backend\utils\email.js
// const nodemailer = require('nodemailer');
// const AppSetting = require('../models/AppSetting'); // <-- NEW: Import AppSetting model

// // IMPORTANT: This is for your Gmail App Password. It should still be stored securely here.
// const GMAIL_APP_PASSWORD = 'your-16-digit-app-password';

// const sendCookhubEmail = async (to, subject, htmlContent) => {
//     try {
//         // Find the notification email address from the database
//         const emailSetting = await AppSetting.findOne({ key: 'notification_email' });

//         // If the setting is not found, we can't send the email.
//         if (!emailSetting || !emailSetting.value) {
//             console.error('No notification email found in database. Email not sent.');
//             return { success: false, message: 'No sender email configured.' };
//         }

//         const GMAIL_EMAIL = emailSetting.value;

//         // Create a transporter object
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: GMAIL_EMAIL,
//                 pass: GMAIL_APP_PASSWORD
//             }
//         });

//         const mailOptions = {
//             from: `"Cookhub" <${GMAIL_EMAIL}>`,
//             to,
//             subject,
//             html: htmlContent
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`Email sent successfully to ${to}`);
//         return { success: true, message: 'Email sent' };
//     } catch (error) {
//         console.error(`Failed to send email to ${to}:`, error);
//         return { success: false, message: 'Failed to send email' };
//     }
// };

// module.exports = {
//     sendCookhubEmail
// };








// // D:\DNG\cookhub-app-anil\cookhub-backend\utils\email.js
// const nodemailer = require('nodemailer');

// // IMPORTANT: Replace these with your actual Gmail email address and the 16-digit App Password.
// // Do not use your regular account password.
// const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
// const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// // Create a transporter object using the default SMTP transport
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: GMAIL_EMAIL,
//         pass: GMAIL_APP_PASSWORD
//     }
// });

// // A reusable function to send an email
// const sendCookhubEmail = async (to, subject, htmlContent) => {
//     try {
//         const mailOptions = {
//             from: `"Cookhub" <${GMAIL_EMAIL}>`,
//             to,
//             subject,
//             html: htmlContent
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`Email sent successfully to ${to}`);
//         return { success: true, message: 'Email sent' };
//     } catch (error) {
//         console.error(`Failed to send email to ${to}:`, error);
//         // This log will give you the specific error from Nodemailer, which is key.
//         return { success: false, message: 'Failed to send email' };
//     }
// };

// module.exports = {
//     sendCookhubEmail
// };
// 20-8-2025




// D:\DNG\cookhub-app-anil\cookhub-backend\utils\email.js
const nodemailer = require('nodemailer');

// IMPORTANT: Replace these with your actual Gmail email address and the 16-digit App Password.
// Do not use your regular account password.
const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_EMAIL,
        pass: GMAIL_APP_PASSWORD
    }
});

// A reusable function to send an email
const sendCookhubEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"Cookhub" <${GMAIL_EMAIL}>`,
            to,
            subject,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}`);
        return { success: true, message: 'Email sent' };
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, {
            message: error.message,
            code: error.code,
            response: error.response,
            responseCode: error.responseCode
        });
        return { success: false, message: `Failed to send email: ${error.message}` };
    }
};

module.exports = {
    sendCookhubEmail
};







// // D:\DNG\cookhub-app-anil\cookhub-backend\utils\email.js
// const nodemailer = require('nodemailer');

// // IMPORTANT: Replace these with your actual Gmail email address and the 16-digit App Password.
// // Do not use your regular account password.
// const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
// const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// // Create a transporter object using the default SMTP transport
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: GMAIL_EMAIL,
//         pass: GMAIL_APP_PASSWORD
//     }
// });

// A reusable function to send an email
// fromEmail (optional) allows overriding the 'from' header with a dynamic sender (e.g., value from DB)
// const sendCookhubEmail = async (to, subject, htmlContent, fromEmail) => {
//     try {
//         const fromAddr = fromEmail || GMAIL_EMAIL;
//         const mailOptions = {
//             from: `"Cookhub" <${fromAddr}>`,
//             to,
//             subject,
//             html: htmlContent
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`Email sent successfully to ${to} (from: ${fromAddr})`);
//         return { success: true, message: 'Email sent' };
//     } catch (error) {
//         console.error(`Failed to send email to ${to}:`, {
//             message: error.message,
//             code: error.code,
//             response: error.response,
//             responseCode: error.responseCode
//         });
//         return { success: false, message: `Failed to send email: ${error.message}` };
//     }
// };

// module.exports = {
//     sendCookhubEmail
// };