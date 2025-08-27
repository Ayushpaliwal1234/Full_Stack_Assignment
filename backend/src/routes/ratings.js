const express = require('express');
const router = express.Router();
const { 
  submitRating,
  updateRating,
  getRatingsByStore,
  getMyRatings,
  deleteRating,
  getAllRatings
} = require('../controllers/ratingsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { ratingValidationRules, validate } = require('../utils/validation');

// All routes require authentication
router.use(authenticateToken);

// Submit a new rating
router.post('/', 
  ratingValidationRules(), 
  validate, 
  submitRating
);

// Update existing rating
router.put('/', 
  ratingValidationRules(), 
  validate, 
  updateRating
);

// Get my ratings
router.get('/my-ratings', getMyRatings);

// Get all ratings (admin only)
router.get('/all', 
  authorizeRoles('admin'), 
  getAllRatings
);

// Get ratings by store
router.get('/store/:storeId', getRatingsByStore);

// Delete rating
router.delete('/store/:storeId', deleteRating);

module.exports = router;
