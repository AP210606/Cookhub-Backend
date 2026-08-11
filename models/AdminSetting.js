// cookhub-backend/models/AdminSetting.js
const mongoose = require('mongoose');

const AdminSettingSchema = new mongoose.Schema({
    settingName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    settingValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    description: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('AdminSetting', AdminSettingSchema);