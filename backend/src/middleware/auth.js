const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);
    
    // Verify user still exists
    const userResult = await query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

const authorizeStoreOwner = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.body.storeId;
    
    if (req.user.role === 'admin') {
      return next(); // Admins can access any store
    }

    if (req.user.role !== 'store_owner') {
      return res.status(403).json({ error: 'Store owner access required' });
    }

    // Verify the store belongs to the authenticated user
    const storeResult = await query(
      'SELECT id FROM stores WHERE id = $1 AND owner_id = $2',
      [storeId, req.user.id]
    );

    if (storeResult.rows.length === 0) {
      return res.status(403).json({ 
        error: 'Access denied. You can only access your own store.' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeStoreOwner
};
