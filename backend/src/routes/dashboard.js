const express = require('express');
const router = express.Router();
const { 
  getAdminStats,
  getStoreOwnerStats,
  getStoreStats,
  getUserStats
} = require('../controllers/dashboardController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get admin statistics
router.get('/admin', 
  authorizeRoles('admin'), 
  getAdminStats
);

// Get store owner statistics
router.get('/store-owner', 
  authorizeRoles('store_owner'), 
  getStoreOwnerStats
);

// Get user statistics
router.get('/user', 
  authorizeRoles('user'), 
  getUserStats
);

// Get specific store statistics (admin or store owner)
router.get('/store/:storeId', 
  authorizeRoles('admin', 'store_owner'), 
  getStoreStats
);

module.exports = router;
