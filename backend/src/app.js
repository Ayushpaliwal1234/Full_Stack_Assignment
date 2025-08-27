const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import database connection
const { query } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const ratingRoutes = require('./routes/ratings');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await query('SELECT 1');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'Connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'Error', 
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Store Rating System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      stores: '/api/stores',
      ratings: '/api/ratings',
      dashboard: '/api/dashboard',
      health: '/health'
    },
    documentation: {
      auth: {
        'POST /api/auth/login': 'Login with email and password',
        'POST /api/auth/register': 'Register new user',
        'GET /api/auth/profile': 'Get user profile (authenticated)',
        'PUT /api/auth/change-password': 'Change password (authenticated)'
      },
      users: {
        'GET /api/users': 'Get all users (admin only)',
        'POST /api/users': 'Create user (admin only)',
        'GET /api/users/:id': 'Get user by ID (admin only)',
        'PUT /api/users/:id': 'Update user (admin only)',
        'DELETE /api/users/:id': 'Delete user (admin only)'
      },
      stores: {
        'GET /api/stores': 'Get all stores (authenticated)',
        'POST /api/stores': 'Create store (admin only)',
        'GET /api/stores/:id': 'Get store by ID (authenticated)',
        'PUT /api/stores/:id': 'Update store (admin/owner)',
        'DELETE /api/stores/:id': 'Delete store (admin only)',
        'GET /api/stores/my-stores': 'Get my stores (store owner)'
      },
      ratings: {
        'POST /api/ratings': 'Submit rating (authenticated)',
        'PUT /api/ratings': 'Update rating (authenticated)',
        'GET /api/ratings/my-ratings': 'Get my ratings (authenticated)',
        'GET /api/ratings/store/:storeId': 'Get store ratings',
        'DELETE /api/ratings/store/:storeId': 'Delete my rating',
        'GET /api/ratings/all': 'Get all ratings (admin only)'
      },
      dashboard: {
        'GET /api/dashboard/admin': 'Admin statistics (admin only)',
        'GET /api/dashboard/store-owner': 'Store owner stats (store owner)',
        'GET /api/dashboard/user': 'User statistics (user)',
        'GET /api/dashboard/store/:storeId': 'Store statistics (admin/owner)'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Database connection failed',
      message: 'Please check your database configuration'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Please login again'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Please login again'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          error: 'Duplicate entry',
          message: 'A record with this information already exists'
        });
      case '23503': // Foreign key violation
        return res.status(400).json({
          error: 'Invalid reference',
          message: 'Referenced record does not exist'
        });
      case '23502': // Not null violation
        return res.status(400).json({
          error: 'Missing required field',
          message: 'Please provide all required information'
        });
      default:
        console.error('Database error:', err);
    }
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : err.message || 'An error occurred',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 Store Rating System API Server Started');
  console.log('===============================================');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`API Documentation: http://localhost:${PORT}/`);
  console.log('===============================================');
});

module.exports = app;
