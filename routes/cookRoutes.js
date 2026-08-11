// cookhub-backend/routes/cookRoutes.js
const express = require('express');
const router = express.Router();
const { getCooks, updateCook, deleteCook } = require('../controllers/cookController');
const Cook = require('../models/Cook');
const auth = require('../middleware/auth');
const cookController = require('../controllers/cookController');


router.post('/', auth, async (req, res) => {
  try {
    const { name, experience, specialty, contactInfo, availability, rating, location } = req.body;
    const cook = new Cook({
      name,
      experience,
      specialty,
      contactInfo: {
        email: contactInfo.email,
        phone: contactInfo.phone,
      },
      availability,
      rating,
      location,
    });
    const savedCook = await cook.save();
    res.status(201).json(savedCook);
  } catch (err) {
    console.error('Cook Creation Error:', err);
    res.status(400).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { location } = req.query;
    const cooks = await Cook.find(location ? { location } : {});
    res.json(cooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', updateCook);
router.delete('/:id', cookController.deleteCook);

module.exports = router;


