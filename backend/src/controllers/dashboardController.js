const { query } = require('../config/database');

const getAdminStats = async (req, res) => {
  try {
    // Get total counts for different entities
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM stores) as total_stores,
        (SELECT COUNT(*) FROM ratings) as total_ratings,
        (SELECT COALESCE(AVG(rating), 0) FROM ratings) as average_rating,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_normal_users,
        (SELECT COUNT(*) FROM users WHERE role = 'store_owner') as total_store_owners
    `;

    const statsResult = await query(statsQuery);
    const stats = statsResult.rows[0];

    // Get top rated stores
    const topStoresQuery = `
      SELECT 
        s.id,
        s.name,
        s.address,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, s.name, s.address
      ORDER BY average_rating DESC, total_ratings DESC
      LIMIT 5
    `;

    const topStoresResult = await query(topStoresQuery);

    // Get recent ratings
    const recentRatingsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        u.name as user_name,
        s.name as store_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `;

    const recentRatingsResult = await query(recentRatingsQuery);

    // Get rating distribution
    const ratingDistributionQuery = `
      SELECT 
        rating,
        COUNT(*) as count
      FROM ratings
      GROUP BY rating
      ORDER BY rating
    `;

    const ratingDistributionResult = await query(ratingDistributionQuery);

    res.json({
      totalUsers: parseInt(stats.total_users),
      totalStores: parseInt(stats.total_stores),
      totalRatings: parseInt(stats.total_ratings),
      averageRating: parseFloat(stats.average_rating).toFixed(2),
      userBreakdown: {
        admins: parseInt(stats.total_admins),
        normalUsers: parseInt(stats.total_normal_users),
        storeOwners: parseInt(stats.total_store_owners)
      },
      topStores: topStoresResult.rows.map(store => ({
        ...store,
        average_rating: parseFloat(store.average_rating).toFixed(1)
      })),
      recentRatings: recentRatingsResult.rows,
      ratingDistribution: ratingDistributionResult.rows
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStoreOwnerStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Get store owner's stores with statistics
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

    const storesResult = await query(storesQuery, [ownerId]);

    if (storesResult.rows.length === 0) {
      return res.json({
        stores: [],
        totalStores: 0,
        totalRatings: 0,
        overallAverageRating: 0,
        recentRatings: []
      });
    }

    const stores = storesResult.rows.map(store => ({
      ...store,
      average_rating: parseFloat(store.average_rating).toFixed(1)
    }));

    // Get overall statistics for this owner's stores
    const overallStatsQuery = `
      SELECT 
        COUNT(DISTINCT s.id) as total_stores,
        COUNT(r.id) as total_ratings,
        COALESCE(AVG(r.rating), 0) as overall_average_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
    `;

    const overallStatsResult = await query(overallStatsQuery, [ownerId]);
    const overallStats = overallStatsResult.rows[0];

    // Get recent ratings for owner's stores
    const recentRatingsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        u.name as user_name,
        s.name as store_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = $1
      ORDER BY r.created_at DESC
      LIMIT 20
    `;

    const recentRatingsResult = await query(recentRatingsQuery, [ownerId]);

    // Get rating distribution for owner's stores
    const ratingDistributionQuery = `
      SELECT 
        r.rating,
        COUNT(*) as count,
        s.name as store_name
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = $1
      GROUP BY r.rating, s.name
      ORDER BY s.name, r.rating
    `;

    const ratingDistributionResult = await query(ratingDistributionQuery, [ownerId]);

    res.json({
      stores,
      totalStores: parseInt(overallStats.total_stores),
      totalRatings: parseInt(overallStats.total_ratings),
      overallAverageRating: parseFloat(overallStats.overall_average_rating).toFixed(2),
      recentRatings: recentRatingsResult.rows,
      ratingDistribution: ratingDistributionResult.rows
    });
  } catch (error) {
    console.error('Get store owner stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStoreStats = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this store (store owner or admin)
    if (req.user.role !== 'admin') {
      const storeOwnerCheck = await query(
        'SELECT id FROM stores WHERE id = $1 AND owner_id = $2',
        [storeId, userId]
      );

      if (storeOwnerCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this store' });
      }
    }

    // Get store information with ratings
    const storeQuery = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        u.name as owner_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = $1
      GROUP BY s.id, s.name, s.email, s.address, s.created_at, u.name
    `;

    const storeResult = await query(storeQuery, [storeId]);

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const store = storeResult.rows[0];

    // Get ratings for this store with user information
    const ratingsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
    `;

    const ratingsResult = await query(ratingsQuery, [storeId]);

    // Get rating distribution
    const ratingDistributionQuery = `
      SELECT 
        rating,
        COUNT(*) as count
      FROM ratings
      WHERE store_id = $1
      GROUP BY rating
      ORDER BY rating
    `;

    const ratingDistributionResult = await query(ratingDistributionQuery, [storeId]);

    // Get monthly rating trends (last 12 months)
    const monthlyTrendsQuery = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as rating_count,
        AVG(rating) as average_rating
      FROM ratings
      WHERE store_id = $1 
        AND created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;

    const monthlyTrendsResult = await query(monthlyTrendsQuery, [storeId]);

    res.json({
      store: {
        ...store,
        average_rating: parseFloat(store.average_rating).toFixed(1)
      },
      ratings: ratingsResult.rows,
      ratingDistribution: ratingDistributionResult.rows,
      monthlyTrends: monthlyTrendsResult.rows.map(trend => ({
        month: trend.month,
        ratingCount: parseInt(trend.rating_count),
        averageRating: parseFloat(trend.average_rating).toFixed(2)
      }))
    });
  } catch (error) {
    console.error('Get store stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's rating statistics
    const userStatsQuery = `
      SELECT 
        COUNT(r.id) as total_ratings,
        COALESCE(AVG(r.rating), 0) as average_rating_given,
        MIN(r.rating) as lowest_rating_given,
        MAX(r.rating) as highest_rating_given
      FROM ratings r
      WHERE r.user_id = $1
    `;

    const userStatsResult = await query(userStatsQuery, [userId]);
    const userStats = userStatsResult.rows[0];

    // Get user's recent ratings
    const recentRatingsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        s.name as store_name,
        s.address as store_address
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `;

    const recentRatingsResult = await query(recentRatingsQuery, [userId]);

    // Get rating distribution
    const ratingDistributionQuery = `
      SELECT 
        rating,
        COUNT(*) as count
      FROM ratings
      WHERE user_id = $1
      GROUP BY rating
      ORDER BY rating
    `;

    const ratingDistributionResult = await query(ratingDistributionQuery, [userId]);

    res.json({
      totalRatings: parseInt(userStats.total_ratings),
      averageRatingGiven: parseFloat(userStats.average_rating_given).toFixed(2),
      lowestRatingGiven: userStats.lowest_rating_given,
      highestRatingGiven: userStats.highest_rating_given,
      recentRatings: recentRatingsResult.rows,
      ratingDistribution: ratingDistributionResult.rows
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAdminStats,
  getStoreOwnerStats,
  getStoreStats,
  getUserStats
};
