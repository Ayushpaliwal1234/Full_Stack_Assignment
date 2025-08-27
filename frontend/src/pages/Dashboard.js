import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { dashboardAPI, storesAPI, ratingsAPI } from '../services/api';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [myStores, setMyStores] = useState([]);
  const [storeRatings, setStoreRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      if (hasRole('admin')) {
        // Load admin dashboard stats
        const response = await dashboardAPI.getAdminStats();
        setStats(response.data);
      } else if (hasRole('store_owner')) {
        // Load store owner dashboard data
        const response = await dashboardAPI.getStoreOwnerStats();
        setMyStores(response.data.stores || []);
        setStats(response.data);

        // Load ratings for each store using the ratings API
        if (response.data.stores && response.data.stores.length > 0) {
          const ratingsPromises = response.data.stores.map(store =>
            ratingsAPI.getByStore(store.id)
          );
          const ratingsResponses = await Promise.all(ratingsPromises);
          
          const storeRatingsData = response.data.stores.map((store, index) => ({
            ...store,
            ratings: ratingsResponses[index].data.ratings || []
          }));
          
          setStoreRatings(storeRatingsData);
        }
      } else if (hasRole('user')) {
        // Load user dashboard data
        const response = await dashboardAPI.getUserStats();
        setStats(response.data);
      }
    } catch (err) {
      console.error('Dashboard data loading error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  const renderAdminDashboard = () => (
    <div>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3>Total Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
            {stats?.totalUsers || 0}
          </p>
        </div>
        <div className="card">
          <h3>Total Stores</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {stats?.totalStores || 0}
          </p>
        </div>
        <div className="card">
          <h3>Total Ratings</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
            {stats?.totalRatings || 0}
          </p>
        </div>
        <div className="card">
          <h3>Average Rating</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}>
            {stats?.averageRating ? parseFloat(stats.averageRating).toFixed(1) : '0.0'}
          </p>
        </div>
      </div>
      
      <div className="card">
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <a href="/users" className="btn btn-primary">Manage Users</a>
          <a href="/stores" className="btn btn-success">Manage Stores</a>
        </div>
      </div>
    </div>
  );

  const renderStoreOwnerDashboard = () => (
    <div>
      <h1>Store Owner Dashboard</h1>
      
      {myStores.length === 0 ? (
        <div className="card">
          <h3>No Stores Found</h3>
          <p>You don't have any stores assigned to your account. Please contact the administrator.</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {myStores.map(store => (
              <div key={store.id} className="card">
                <h3>{store.name}</h3>
                <p><strong>Email:</strong> {store.email}</p>
                <p><strong>Address:</strong> {store.address}</p>
                <p><strong>Average Rating:</strong> 
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffc107' }}>
                    {' '}{store.average_rating}/5
                  </span>
                </p>
                <p><strong>Total Ratings:</strong> {store.total_ratings}</p>
              </div>
            ))}
          </div>

          {storeRatings.length > 0 && (
            <div className="card">
              <h3>Recent Ratings</h3>
              {storeRatings.map(store => (
                <div key={store.id} style={{ marginBottom: '1.5rem' }}>
                  <h4>{store.name}</h4>
                  {store.ratings.length === 0 ? (
                    <p style={{ color: '#666' }}>No ratings yet</p>
                  ) : (
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {store.ratings.slice(0, 5).map(rating => (
                        <div key={rating.id} style={{ 
                          padding: '0.5rem', 
                          borderBottom: '1px solid #eee',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>{rating.user_name}</span>
                          <span style={{ fontWeight: 'bold' }}>{rating.rating}/5</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderUserDashboard = () => (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <div className="card">
        <h3>Store Rating System</h3>
        <p>Welcome to the Store Rating System. Here you can:</p>
        <ul style={{ marginLeft: '1rem', marginTop: '1rem' }}>
          <li>Browse and search for stores</li>
          <li>Submit ratings and reviews for stores</li>
          <li>Update your existing ratings</li>
          <li>Manage your profile</li>
        </ul>
        
        <div style={{ marginTop: '2rem' }}>
          <a href="/stores" className="btn btn-primary">
            Browse Stores
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      {hasRole('admin') && renderAdminDashboard()}
      {hasRole('store_owner') && renderStoreOwnerDashboard()}
      {hasRole('user') && renderUserDashboard()}
    </div>
  );
};

export default Dashboard;
