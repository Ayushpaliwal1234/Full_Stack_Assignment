const express = require('express');
const router = express.Router();
const { 
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/usersController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { userValidationRules, validate } = require('../utils/validation');

// All user routes require admin authentication
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Get all users with filtering and pagination
router.get('/', getAllUsers);

// Create a new user
router.post('/', userValidationRules(), validate, createUser);

// Get user by ID
router.get('/:id', getUserById);

// Update user
router.put('/:id', 
  userValidationRules(), 
  validate, 
  updateUser
);

// Delete user
router.delete('/:id', deleteUser);

module.exports = router;
