const { query } = require('../config/database');

const getAllStores = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'asc',
      name,
      address,
      search
    } = req.query;

    let whereClause = '';
    let queryParams = [];
    let paramCount = 0;

    // Build dynamic WHERE clause for filtering
    if (search) {
      // Search in both name and address
      paramCount++;
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      whereClause += `(s.name ILIKE $${paramCount} OR s.address ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    } else {
      if (name) {
        paramCount++;
        whereClause += whereClause ? ' AND ' : ' WHERE ';
        whereClause += `s.name ILIKE $${paramCount}`;
        queryParams.push(`%${name}%`);
      }

      if (address) {
        paramCount++;
        whereClause += whereClause ? ' AND ' : ' WHERE ';
        whereClause += `s.address ILIKE $${paramCount}`;
        queryParams.push(`%${address}%`);
      }
    }

    // Validate sort parameters
    const validSortFields = ['name', 'address', 'average_rating', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
    const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get stores with ratings - using the view we created
    const storesQuery = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereClause}
      GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at
      ORDER BY ${finalSortBy === 'average_rating' ? 'average_rating' : 's.' + finalSortBy} ${finalSortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    queryParams.push(parseInt(limit), offset);
    const storesResult = await query(storesQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as count
      FROM stores s
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams.slice(0, paramCount));
    const totalCount = parseInt(countResult.rows[0].count);

    // If user is authenticated, get their ratings for these stores
    const userId = req.user?.id;
    let storesWithUserRatings = storesResult.rows;

    if (userId) {
      storesWithUserRatings = await Promise.all(
        storesResult.rows.map(async (store) => {
          const userRatingQuery = `
            SELECT rating FROM ratings 
            WHERE user_id = $1 AND store_id = $2
          `;
          const userRatingResult = await query(userRatingQuery, [userId, store.id]);
          
          return {
            ...store,
            user_rating: userRatingResult.rows.length > 0 ? userRatingResult.rows[0].rating : null,
            average_rating: parseFloat(store.average_rating).toFixed(1)
          };
        })
      );
    } else {
      storesWithUserRatings = storesResult.rows.map(store => ({
        ...store,
        average_rating: parseFloat(store.average_rating).toFixed(1)
      }));
    }

    res.json({
      stores: storesWithUserRatings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check if store email already exists
    const existingStore = await query(
      'SELECT id FROM stores WHERE email = $1',
      [email]
    );

    if (existingStore.rows.length > 0) {
      return res.status(409).json({ error: 'Store with this email already exists' });
    }

    // Verify owner exists and is either store_owner or being created as one
    const ownerResult = await query(
      'SELECT id, role FROM users WHERE id = $1',
      [ownerId]
    );

    if (ownerResult.rows.length === 0) {
      return res.status(400).json({ error: 'Owner not found' });
    }

    const owner = ownerResult.rows[0];
    
    // If owner is not already a store_owner, update their role
    if (owner.role !== 'store_owner') {
      await query(
        'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['store_owner', ownerId]
      );
    }

    // Create store
    const result = await query(
      `INSERT INTO stores (name, email, address, owner_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, address, owner_id, created_at`,
      [name, email, address, ownerId]
    );

    res.status(201).json({
      message: 'Store created successfully',
      store: result.rows[0]
    });
  } catch (error) {
    console.error('Create store error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Store with this email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const storeQuery = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = $1
      GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at
    `;

    const storeResult = await query(storeQuery, [id]);

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const store = storeResult.rows[0];
    store.average_rating = parseFloat(store.average_rating).toFixed(1);

    // If user is authenticated, get their rating for this store
    const userId = req.user?.id;
    if (userId) {
      const userRatingQuery = `
        SELECT rating FROM ratings 
        WHERE user_id = $1 AND store_id = $2
      `;
      const userRatingResult = await query(userRatingQuery, [userId, id]);
      store.user_rating = userRatingResult.rows.length > 0 ? userRatingResult.rows[0].rating : null;
    }

    res.json({ store });
  } catch (error) {
    console.error('Get store by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address } = req.body;

    // Check if store exists
    const existingStore = await query(
      'SELECT id FROM stores WHERE id = $1',
      [id]
    );

    if (existingStore.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if email is already taken by another store
    const emailCheck = await query(
      'SELECT id FROM stores WHERE email = $1 AND id != $2',
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Email is already taken' });
    }

    // Update store
    const result = await query(
      `UPDATE stores 
       SET name = $1, email = $2, address = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, address, owner_id, created_at, updated_at`,
      [name, email, address, id]
    );

    res.json({
      message: 'Store updated successfully',
      store: result.rows[0]
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if store exists
    const existingStore = await query(
      'SELECT id FROM stores WHERE id = $1',
      [id]
    );

    if (existingStore.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Delete store (CASCADE will handle ratings)
    await query('DELETE FROM stores WHERE id = $1', [id]);

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get stores owned by current user (for store owners)
const getMyStores = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const storesQuery = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id, s.name, s.email, s.address, s.created_at
      ORDER BY s.name
    `;

    const result = await query(storesQuery, [ownerId]);
    
    const stores = result.rows.map(store => ({
      ...store,
      average_rating: parseFloat(store.average_rating).toFixed(1)
    }));

    res.json({ stores });
  } catch (error) {
    console.error('Get my stores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllStores,
  createStore,
  getStoreById,
  updateStore,
  deleteStore,
  getMyStores
};
