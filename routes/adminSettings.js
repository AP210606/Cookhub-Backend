// cookhub-backend/routes/adminSettings.js
const express = require('express');
const AdminSetting = require('../models/AdminSetting'); // <-- Check this path carefully
const { protect } = require('../middleware/authMiddleware'); // <-- Check this path carefully
const { authorizeAdmin } = require('../middleware/adminMiddleware'); // Ensure path is correct

const router = express.Router();

router.post('/', protect, authorizeAdmin, async (req, res) => {
    const { settingName, settingValue, description } = req.body;
    try {
        const newSetting = new AdminSetting({
            settingName,
            settingValue,
            description
        });
        const setting = await newSetting.save();
        res.status(201).json(setting);
    } catch (error) {
        console.error(error.message);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Setting name already exists' });
        }
        res.status(500).send('Server error');
    }
});

router.get('/', protect, authorizeAdmin, async (req, res) => { // <-- This is the route being hit
    try {
        const settings = await AdminSetting.find({});
        res.json(settings);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


router.get('/:id', protect, authorizeAdmin, async (req, res) => {
    try {
        const setting = await AdminSetting.findById(req.params.id);
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        res.json(setting);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

router.put('/:id', protect, authorizeAdmin, async (req, res) => {
    const { settingName, settingValue, description } = req.body;
    try {
        const updatedSetting = await AdminSetting.findByIdAndUpdate(
            req.params.id,
            { settingName, settingValue, description },
            { new: true, runValidators: true }
        );
        if (!updatedSetting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        res.json(updatedSetting);
    } catch (error) {
        console.error(error.message);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Setting name already exists' });
        }
        res.status(500).send('Server error');
    }
});

router.delete('/:id', protect, authorizeAdmin, async (req, res) => {
    try {
        const setting = await AdminSetting.findByIdAndDelete(req.params.id);
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        res.json({ message: 'Setting removed' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;







// // cookhub-backend/routes/adminSettings.js
// const express = require('express');
// const AdminSetting = require('../models/AdminSetting'); // <-- Check this path carefully
// const { protect } = require('../middleware/authMiddleware'); // <-- Check this path carefully
// const { authorizeAdmin } = require('../middleware/adminMiddleware'); // Ensure path is correct

// const router = express.Router();

// router.post('/', protect, authorizeAdmin, async (req, res) => {
//     const { settingName, settingValue, description } = req.body;
//     try {
//         const newSetting = new AdminSetting({
//             settingName,
//             settingValue,
//             description
//         });
//         const setting = await newSetting.save();
//         res.status(201).json(setting);
//     } catch (error) {
//         console.error(error.message);
//         if (error.code === 11000) {
//             return res.status(400).json({ message: 'Setting name already exists' });
//         }
//         res.status(500).send('Server error');
//     }
// });

// router.get('/', protect, authorizeAdmin, async (req, res) => { // <-- This is the route being hit
//     try {
//         const settings = await AdminSetting.find({});
//         res.json(settings);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server error');
//     }
// });

// router.get('/:id', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const setting = await AdminSetting.findById(req.params.id);
//         if (!setting) {
//             return res.status(404).json({ message: 'Setting not found' });
//         }
//         res.json(setting);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server error');
//     }
// });

// router.put('/:id', protect, authorizeAdmin, async (req, res) => {
//     const { settingName, settingValue, description } = req.body;
//     try {
//         const updatedSetting = await AdminSetting.findByIdAndUpdate(
//             req.params.id,
//             { settingName, settingValue, description },
//             { new: true, runValidators: true }
//         );
//         if (!updatedSetting) {
//             return res.status(404).json({ message: 'Setting not found' });
//         }
//         res.json(updatedSetting);
//     } catch (error) {
//         console.error(error.message);
//         if (error.code === 11000) {
//             return res.status(400).json({ message: 'Setting name already exists' });
//         }
//         res.status(500).send('Server error');
//     }
// });

// router.delete('/:id', protect, authorizeAdmin, async (req, res) => {
//     try {
//         const setting = await AdminSetting.findByIdAndDelete(req.params.id);
//         if (!setting) {
//             return res.status(404).json({ message: 'Setting not found' });
//         }
//         res.json({ message: 'Setting removed' });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server error');
//     }
// });

// module.exports = router;