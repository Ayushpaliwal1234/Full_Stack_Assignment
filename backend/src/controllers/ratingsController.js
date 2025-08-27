const { query } = require('../config/database');

const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const storeCheck = await query(
      'SELECT id FROM stores WHERE id = $1',
      [storeId]
    );

    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if user has already rated this store
    const existingRating = await query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existingRating.rows.length > 0) {
      return res.status(409).json({ 
        error: 'You have already rated this store. Use update rating instead.' 
      });
    }

    // Insert new rating
    const result = await query(
      `INSERT INTO ratings (user_id, store_id, rating) 
       VALUES ($1, $2, $3) 
       RETURNING id, rating, created_at`,
      [userId, storeId, rating]
    );

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: result.rows[0]
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    // Check if rating exists
    const existingRating = await query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existingRating.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Rating not found. Submit a new rating instead.' 
      });
    }

    // Update rating
    const result = await query(
      `UPDATE ratings 
       SET rating = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $2 AND store_id = $3 
       RETURNING id, rating, updated_at`,
      [rating, userId, storeId]
    );

    res.json({
      message: 'Rating updated successfully',
      rating: result.rows[0]
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRatingsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { 
      page = 1, 
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Validate sort parameters
    const validSortFields = ['rating', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM ratings WHERE store_id = $1',
      [storeId]
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Get ratings with user names
    const ratingsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.name as user_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.${finalSortBy} ${finalSortOrder}
      LIMIT $2 OFFSET $3
    `;

    const ratingsResult = await query(ratingsQuery, [storeId, parseInt(limit), offset]);

    res.json({
      ratings: ratingsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get ratings by store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyRatings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Validate sort parameters
    const validSortFields = ['rating', 'created_at', 'store_name'];
    const validSortOrders = ['asc', 'desc'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM ratings WHERE user_id = $1',
      [userId]
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Get user's ratings with store information
    const ratingsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        s.id as store_id,
        s.name as store_name,
        s.address as store_address
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = $1
      ORDER BY ${finalSortBy === 'store_name' ? 's.name' : 'r.' + finalSortBy} ${finalSortOrder}
      LIMIT $2 OFFSET $3
    `;

    const ratingsResult = await query(ratingsQuery, [userId, parseInt(limit), offset]);

    res.json({
      ratings: ratingsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // Check if rating exists
    const existingRating = await query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existingRating.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    // Delete rating
    await query(
      'DELETE FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin function to get all ratings with filtering
const getAllRatings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      storeId,
      userId,
      rating
    } = req.query;

    let whereClause = '';
    let queryParams = [];
    let paramCount = 0;

    // Build dynamic WHERE clause
    if (storeId) {
      paramCount++;
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      whereClause += `r.store_id = $${paramCount}`;
      queryParams.push(storeId);
    }

    if (userId) {
      paramCount++;
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      whereClause += `r.user_id = $${paramCount}`;
      queryParams.push(userId);
    }

    if (rating) {
      paramCount++;
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      whereClause += `r.rating = $${paramCount}`;
      queryParams.push(parseInt(rating));
    }

    // Validate sort parameters
    const validSortFields = ['rating', 'created_at', 'user_name', 'store_name'];
    const validSortOrders = ['asc', 'desc'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM ratings r ${whereClause}`;
    const countResult = await query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get all ratings with user and store information
    const sortField = finalSortBy === 'user_name' ? 'u.name' : 
                     finalSortBy === 'store_name' ? 's.name' : 
                     `r.${finalSortBy}`;

    const ratingsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.name as user_name,
        s.id as store_id,
        s.name as store_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      ${whereClause}
      ORDER BY ${sortField} ${finalSortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);
    const ratingsResult = await query(ratingsQuery, queryParams);

    res.json({
      ratings: ratingsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all ratings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  submitRating,
  updateRating,
  getRatingsByStore,
  getMyRatings,
  deleteRating,
  getAllRatings
};
