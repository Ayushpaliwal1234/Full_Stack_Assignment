const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'asc',
      name,
      email,
      address,
      role
    } = req.query;

    let whereClause = '';
    let queryParams = [];
    let paramCount = 0;

    // Build dynamic WHERE clause for filtering
    if (name) {
      paramCount++;
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      whereClause += `name ILIKE $${paramCount}`;
      queryParams.push(`%${name}%`);
    }

    if (email) {
      paramCount++;
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      whereClause += `email ILIKE $${paramCount}`;
      queryParams.push(`%${email}%`);
    }

    if (address) {
      paramCount++;
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      whereClause += `address ILIKE $${paramCount}`;
      queryParams.push(`%${address}%`);
    }

    if (role) {
      paramCount++;
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      whereClause += `role = $${paramCount}`;
      queryParams.push(role);
    }

    // Validate sort parameters
    const validSortFields = ['name', 'email', 'role', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
    const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM users${whereClause}`;
    const countResult = await query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get users with pagination and sorting
    const usersQuery = `
      SELECT 
        id, name, email, address, role, created_at, updated_at 
      FROM users 
      ${whereClause}
      ORDER BY ${finalSortBy} ${finalSortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    queryParams.push(parseInt(limit), offset);
    const usersResult = await query(usersQuery, queryParams);

    // For store owners, include their store rating
    const usersWithRatings = await Promise.all(
      usersResult.rows.map(async (user) => {
        if (user.role === 'store_owner') {
          const storeRatingQuery = `
            SELECT AVG(r.rating) as average_rating 
            FROM stores s 
            LEFT JOIN ratings r ON s.id = r.store_id 
            WHERE s.owner_id = $1
          `;
          const ratingResult = await query(storeRatingQuery, [user.id]);
          user.store_rating = ratingResult.rows[0].average_rating || 0;
        }
        return user;
      })
    );

    res.json({
      users: usersWithRatings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    // Validate role
    const validRoles = ['admin', 'user', 'store_owner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await query(
      `INSERT INTO users (name, email, password, address, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, address, role, created_at`,
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // If store owner, get their store rating
    if (user.role === 'store_owner') {
      const storeRatingQuery = `
        SELECT AVG(r.rating) as average_rating 
        FROM stores s 
        LEFT JOIN ratings r ON s.id = r.store_id 
        WHERE s.owner_id = $1
      `;
      const ratingResult = await query(storeRatingQuery, [id]);
      user.store_rating = ratingResult.rows[0].average_rating || 0;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, role } = req.body;

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already taken by another user
    const emailCheck = await query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Email is already taken' });
    }

    // Update user
    const result = await query(
      `UPDATE users 
       SET name = $1, email = $2, address = $3, role = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, name, email, address, role, created_at, updated_at`,
      [name, email, address, role, id]
    );

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await query(
      'SELECT id, role FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deletion of admin users (additional safety)
    const user = existingUser.rows[0];
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Delete user (CASCADE will handle related records)
    await query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
};
