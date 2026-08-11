// backend/notifier.js - New file for handling scheduled notifications

const cron = require('node-cron');
const twilio = require('twilio');
const { Booking } = require('./models/Booking'); // Assume Mongoose models for Booking and Cook
const { Cook } = require('./models/Cook');

// Load Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = 'whatsapp:+14155238886'; // Twilio Sandbox WhatsApp number

if (!accountSid || !authToken) {
    console.error('Twilio credentials not set. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.');
    process.exit(1);
}

const client = twilio(accountSid, authToken);

// Function to send WhatsApp notification to cook
const sendWhatsAppNotification = async (cookPhone, booking) => {
    try {
        const message = await client.messages.create({
            from: twilioWhatsAppNumber,
            to: `whatsapp:${cookPhone}`, // Ensure E.164 format, e.g., +1234567890
            body: `Reminder: Your cooking schedule with ${booking.client} is in 30 minutes! 
                   Time: ${booking.time} on ${booking.date}
                   Location: ${booking.address}
                   Notes: ${booking.notes || 'None'}
                   CookHub Team`
        });

        console.log(`WhatsApp notification sent to ${cookPhone} for booking ${booking._id}: ${message.sid}`);
        return message.sid;
    } catch (error) {
        console.error(`Failed to send WhatsApp to ${cookPhone}:`, error);
        // Fallback to SMS if WhatsApp fails
        try {
            const smsMessage = await client.messages.create({
                from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number for SMS
                to: cookPhone,
                body: `CookHub Reminder: Cooking with ${booking.client} in 30 min. Time: ${booking.time} ${booking.date}, Location: ${booking.address}`
            });
            console.log(`SMS fallback sent to ${cookPhone}: ${smsMessage.sid}`);
        } catch (smsError) {
            console.error(`Failed to send SMS fallback to ${cookPhone}:`, smsError);
        }
    }
};

// Cron job to check for bookings starting in 30 minutes and send notifications
const startNotificationScheduler = () => {
    // Run every minute: * * * * *
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes ahead

            // Query for bookings starting exactly at thirtyMinutesFromNow
            // Adjust query based on your date/time storage (assuming date and time fields combined)
            const upcomingBookings = await Booking.find({
                startTime: { // Assume you have a startTime field as Date
                    $eq: thirtyMinutesFromNow
                },
                status: 'Upcoming' // Only for upcoming bookings
            }).populate('cookId', 'phone'); // Populate cook's phone

            for (const booking of upcomingBookings) {
                if (booking.cookId && booking.cookId.phone) {
                    await sendWhatsAppNotification(booking.cookId.phone, booking);
                }
            }

            if (upcomingBookings.length > 0) {
                console.log(`${upcomingBookings.length} notifications sent for bookings at ${thirtyMinutesFromNow.toLocaleString()}`);
            }
        } catch (error) {
            console.error('Error in notification scheduler:', error);
        }
    });

    console.log('Notification scheduler started: Checking every minute for 30-min reminders.');
};

// Export to start in main app
module.exports = { startNotificationScheduler };

// In your main server file (e.g., app.js or server.js), add:
// const { startNotificationScheduler } = require('./backend/notifier');
// startNotificationScheduler();

// Also install dependencies:
// npm install node-cron twilio
// Set env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER (for SMS fallback)