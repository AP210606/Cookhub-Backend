const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ratingsController = require('../controllers/ratingsController');

// POST /api/ratings/cooks -> create a rating (authenticated users)
router.post('/cooks', auth, ratingsController.createCookRating);

// GET /api/users/:id/ratings -> summary for a user (cook)
router.get('/users/:id/ratings', ratingsController.getUserRatingsSummary);

// GET /api/ratings/my -> current user's submitted ratings
router.get('/my', auth, ratingsController.getMyRatings);

// GET /api/ratings/cook/:cookId -> recent rating documents for a cook
router.get('/cook/:cookId', ratingsController.getRatingsForCook);

module.exports = router;
