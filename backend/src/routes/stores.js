const express = require('express');
const router = express.Router();
const { 
  getAllStores,
  createStore,
  getStoreById,
  updateStore,
  deleteStore,
  getMyStores
} = require('../controllers/storesController');
const { authenticateToken, authorizeRoles, authorizeStoreOwner } = require('../middleware/auth');
const { storeValidationRules, validate } = require('../utils/validation');

// All routes require authentication
router.use(authenticateToken);

// Get all stores (public for authenticated users)
router.get('/', getAllStores);

// Get my stores (for store owners)
router.get('/my-stores', 
  authorizeRoles('store_owner'), 
  getMyStores
);

// Create a new store (admin only)
router.post('/', 
  authorizeRoles('admin'), 
  storeValidationRules(), 
  validate, 
  createStore
);

// Get store by ID
router.get('/:id', getStoreById);

// Update store (admin or store owner)
router.put('/:id', 
  (req, res, next) => {
    // Allow admin to update any store, store owner to update their own
    if (req.user.role === 'admin') {
      return next();
    }
    // For store owners, check ownership in the authorizeStoreOwner middleware
    req.params.storeId = req.params.id;
    return authorizeStoreOwner(req, res, next);
  },
  storeValidationRules(), 
  validate, 
  updateStore
);

// Delete store (admin only)
router.delete('/:id', 
  authorizeRoles('admin'), 
  deleteStore
);

module.exports = router;
