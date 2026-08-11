// // D:\DNG\cookhub-app-anil\cookhub-backend\models\AppSetting.js
// const mongoose = require('mongoose');

// // The AppSetting schema will store a key-value pair for application settings.
// const AppSettingSchema = mongoose.Schema({
//     // The key, e.g., 'notification_email'
//     key: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true
//     },
//     // The value associated with the key
//     value: {
//         type: String,
//         required: true,
//     }
// }, {
//     timestamps: true,
// });

// // Using the same pattern to prevent OverwriteModelError
// const AppSetting = mongoose.models.AppSetting || mongoose.model('AppSetting', AppSettingSchema);

// module.exports = AppSetting;
