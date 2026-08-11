// backend/utils/getNotificationEmail.js
const AdminSetting = require('../models/AdminSetting'); // Change path if your model name is different

const getNotificationEmail = async () => {
  try {
    const setting = await AdminSetting.findOne({ settingName: 'notificationEmail' });
    if (setting && setting.settingValue && setting.settingValue.includes('@')) {
      console.log('Using notification email from DB:', setting.settingValue);
      return setting.settingValue;
    }
  } catch (err) {
    console.error('Error reading notificationEmail from DB:', err.message);
  }

  // Fallback to .env if not set in database
  console.log('Falling back to .env email:', process.env.EMAIL_USER);
  return process.env.EMAIL_USER;
};

module.exports = getNotificationEmail;