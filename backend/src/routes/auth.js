const express = require('express');
const router = express.Router();
const { 
  login, 
  register, 
  changePassword, 
  getProfile 
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { 
  loginValidationRules, 
  userValidationRules, 
  passwordChangeValidationRules, 
  validate 
} = require('../utils/validation');

// Public routes
router.post('/login', loginValidationRules(), validate, login);
router.post('/register', userValidationRules(), validate, register);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/change-password', 
  authenticateToken, 
  passwordChangeValidationRules(), 
  validate, 
  changePassword
);

module.exports = router;
