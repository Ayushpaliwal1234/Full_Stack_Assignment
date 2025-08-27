const { body, validationResult } = require('express-validator');

// Validation rules based on requirements
const userValidationRules = () => {
  return [
    body('name')
      .isLength({ min: 20, max: 60 })
      .withMessage('Name must be between 20 and 60 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8, max: 16 })
      .withMessage('Password must be between 8 and 16 characters')
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
      .withMessage('Password must contain at least one uppercase letter and one special character'),
    body('address')
      .isLength({ max: 400 })
      .withMessage('Address must not exceed 400 characters'),
  ];
};

const storeValidationRules = () => {
  return [
    body('name')
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage('Store name is required and must not exceed 100 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('address')
      .notEmpty()
      .isLength({ max: 400 })
      .withMessage('Address is required and must not exceed 400 characters'),
  ];
};

const ratingValidationRules = () => {
  return [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be an integer between 1 and 5'),
    body('storeId')
      .isUUID()
      .withMessage('Valid store ID is required'),
  ];
};

const loginValidationRules = () => {
  return [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ];
};

const passwordChangeValidationRules = () => {
  return [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8, max: 16 })
      .withMessage('New password must be between 8 and 16 characters')
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
      .withMessage('New password must contain at least one uppercase letter and one special character'),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  userValidationRules,
  storeValidationRules,
  ratingValidationRules,
  loginValidationRules,
  passwordChangeValidationRules,
  validate
};
