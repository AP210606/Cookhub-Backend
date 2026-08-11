// utils/sendImmediateNotification.js - New utility for immediate notifications

const twilio = require('twilio');
const { Booking } = require('../models/Booking'); // Adjust path as needed
const { Cook } = require('../models/Cook'); // Adjust path as needed

// Load Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = 'whatsapp:+14155238886'; // Twilio Sandbox WhatsApp number

if (!accountSid || !authToken) {
    console.error('Twilio credentials not set. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.');
    process.exit(1);
}

const client = twilio(accountSid, authToken);

// Function to send immediate WhatsApp/SMS notification to a cook for a booking
const sendImmediateNotificationToCook = async (bookingId) => {
    try {
        // Fetch the booking and populate cook details
        const booking = await Booking.findById(bookingId).populate('cookId', 'phone name');
        
        if (!booking || !booking.cookId || !booking.cookId.phone) {
            throw new Error('Booking or cook phone not found');
        }

        const cookPhone = booking.cookId.phone;
        const cookName = booking.cookId.name;

        const message = await client.messages.create({
            from: twilioWhatsAppNumber,
            to: `whatsapp:${cookPhone}`, // Ensure E.164 format, e.g., +1234567890
            body: `Hi ${cookName}! New cooking assignment:
                   Client: ${booking.client}
                   Time: ${booking.time} on ${booking.date}
                   Location: ${booking.address}
                   Notes: ${booking.notes || 'None'}
                   Reply if you accept or need to reschedule.
                   CookHub Team`
        });

        console.log(`Immediate WhatsApp notification sent to ${cookPhone} for booking ${bookingId}: ${message.sid}`);
        
        // Optionally update booking with notification sent timestamp
        booking.notificationSentAt = new Date();
        await booking.save();

        return { success: true, sid: message.sid, method: 'WhatsApp' };
    } catch (error) {
        console.error(`Failed to send WhatsApp to cook:`, error);
        // Fallback to SMS
        try {
            const booking = await Booking.findById(bookingId).populate('cookId', 'phone name');
            if (!booking || !booking.cookId || !booking.cookId.phone) {
                throw new Error('Booking or cook phone not found for SMS fallback');
            }

            const cookPhone = booking.cookId.phone;
            const smsMessage = await client.messages.create({
                from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number for SMS
                to: cookPhone,
                body: `CookHub: New assignment for ${booking.client} at ${booking.time} ${booking.date}. Location: ${booking.address}. Reply to confirm.`
            });

            console.log(`SMS fallback sent to ${cookPhone}: ${smsMessage.sid}`);
            return { success: true, sid: smsMessage.sid, method: 'SMS' };
        } catch (smsError) {
            console.error(`Failed to send SMS fallback:`, smsError);
            return { success: false, error: smsError.message };
        }
    }
};

module.exports = { sendImmediateNotificationToCook };

// Usage example: In your booking assignment route/controller (e.g., in controllers/bookingController.js)
// After assigning cook to booking:
// const { sendImmediateNotificationToCook } = require('../utils/sendImmediateNotification');
// await sendImmediateNotificationToCook(booking._id);

// Also, create an API endpoint if needed (in routes/bookings.js):
// router.post('/notify/:bookingId', async (req, res) => {
//     try {
//         const result = await sendImmediateNotificationToCook(req.params.bookingId);
//         res.json(result);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });