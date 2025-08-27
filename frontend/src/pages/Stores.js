import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { storesAPI, ratingsAPI } from '../services/api';

const Stores = () => {
  const { user, hasRole } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  // Store creation/editing modal state
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeFormData, setStoreFormData] = useState({
    name: '',
    email: '',
    address: ''
  });
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingFormData, setRatingFormData] = useState({
    storeId: null,
    rating: 5,
    comment: ''
  });
  const [existingRating, setExistingRating] = useState(null);
  const [myRatings, setMyRatings] = useState([]);

  useEffect(() => {
    loadStores();
    loadMyRatings();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await storesAPI.getAll();
      setStores(response.data.stores || []);
    } catch (err) {
      console.error('Failed to load stores:', err);
      setError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const loadMyRatings = async () => {
    try {
      const response = await ratingsAPI.getMyRatings();
      setMyRatings(response.data.ratings || []);
    } catch (err) {
      console.error('Failed to load my ratings:', err);
    }
  };

  // Store CRUD operations
  const openCreateStoreModal = () => {
    setModalMode('create');
    setSelectedStore(null);
    setStoreFormData({ name: '', email: '', address: '' });
    setShowStoreModal(true);
    setError('');
    setMessage('');
  };

  const openEditStoreModal = (store) => {
    setModalMode('edit');
    setSelectedStore(store);
    setStoreFormData({
      name: store.name || '',
      email: store.email || '',
      address: store.address || ''
    });
    setShowStoreModal(true);
    setError('');
    setMessage('');
  };

  const closeStoreModal = () => {
    setShowStoreModal(false);
    setSelectedStore(null);
    setStoreFormData({ name: '', email: '', address: '' });
    setError('');
    setMessage('');
  };

  const handleStoreInputChange = (e) => {
    setStoreFormData({
      ...storeFormData,
      [e.target.name]: e.target.value
    });
  };

  const validateStoreForm = () => {
    const { name, email, address } = storeFormData;
    
    if (!name || name.length < 10 || name.length > 100) {
      return 'Store name must be between 10 and 100 characters';
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    
    if (!address || address.length < 10 || address.length > 400) {
      return 'Address must be between 10 and 400 characters';
    }
    
    return null;
  };

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const validationError = validateStoreForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    
    try {
      if (modalMode === 'create') {
        await storesAPI.create(storeFormData);
        setMessage('Store created successfully!');
      } else {
        await storesAPI.update(selectedStore.id, storeFormData);
        setMessage('Store updated successfully!');
      }
      
      await loadStores();
      closeStoreModal();
    } catch (err) {
      console.error('Store form submission error:', err);
      setError(err.response?.data?.error || `Failed to ${modalMode} store`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStore = async (storeId, storeName) => {
    if (!window.confirm(`Are you sure you want to delete store "${storeName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await storesAPI.delete(storeId);
      setMessage('Store deleted successfully!');
      await loadStores();
    } catch (err) {
      console.error('Delete store error:', err);
      setError(err.response?.data?.error || 'Failed to delete store');
    } finally {
      setLoading(false);
    }
  };

  // Rating operations
  const openRatingModal = (store) => {
    const myExistingRating = myRatings.find(r => r.store_id === store.id);
    
    setRatingFormData({
      storeId: store.id,
      rating: myExistingRating ? myExistingRating.rating : 5,
      comment: myExistingRating ? myExistingRating.comment || '' : ''
    });
    
    setExistingRating(myExistingRating || null);
    setSelectedStore(store);
    setShowRatingModal(true);
    setError('');
    setMessage('');
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedStore(null);
    setRatingFormData({ storeId: null, rating: 5, comment: '' });
    setExistingRating(null);
    setError('');
    setMessage('');
  };

  const handleRatingInputChange = (e) => {
    const { name, value } = e.target;
    setRatingFormData({
      ...ratingFormData,
      [name]: name === 'rating' ? parseInt(value) : value
    });
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!ratingFormData.comment || ratingFormData.comment.length < 10 || ratingFormData.comment.length > 500) {
      setError('Comment must be between 10 and 500 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const ratingData = {
        store_id: ratingFormData.storeId,
        rating: ratingFormData.rating,
        comment: ratingFormData.comment
      };
      
      if (existingRating) {
        await ratingsAPI.update(existingRating.id, ratingData);
        setMessage('Rating updated successfully!');
      } else {
        await ratingsAPI.submit(ratingData);
        setMessage('Rating submitted successfully!');
      }
      
      await loadStores();
      await loadMyRatings();
      closeRatingModal();
    } catch (err) {
      console.error('Rating submission error:', err);
      setError(err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort stores
  const filteredAndSortedStores = stores
    .filter(store => {
      const searchLower = searchTerm.toLowerCase();
      return store.name.toLowerCase().includes(searchLower) ||
             store.address.toLowerCase().includes(searchLower) ||
             store.email.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'created':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

  const renderStarRating = (rating) => {
    return (
      <div className="rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderInteractiveStarRating = (currentRating, onChange) => {
    return (
      <div className="rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= currentRating ? 'filled' : 'empty'}`}
            onClick={() => onChange(star)}
            style={{ cursor: 'pointer' }}
          >
            ★
          </span>
        ))}
        <span style={{ marginLeft: '0.5rem', color: '#666' }}>
          {currentRating} star{currentRating !== 1 ? 's' : ''}
        </span>
      </div>
    );
  };

  const getUserRatingForStore = (storeId) => {
    return myRatings.find(r => r.store_id === storeId);
  };

  const canManageStore = (store) => {
    return hasRole('admin') || (hasRole('store_owner') && store.owner_id === user.id);
  };

  if (loading && stores.length === 0) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Stores</h1>
          {(hasRole('admin') || hasRole('store_owner')) && (
            <button className="btn btn-primary" onClick={openCreateStoreModal}>
              + Add New Store
            </button>
          )}
        </div>

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Search and Filter Controls */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search stores by name, address, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: '1', minWidth: '250px' }}
          />
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
            <option value="created">Sort by Newest</option>
          </select>
        </div>

        {/* Stores Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
          {filteredAndSortedStores.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
              {stores.length === 0 ? 'No stores available' : 'No stores match your search criteria'}
            </div>
          ) : (
            filteredAndSortedStores.map((store) => {
              const userRating = getUserRatingForStore(store.id);
              const canManage = canManageStore(store);
              
              return (
                <div key={store.id} className="card" style={{ margin: '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0', flex: '1' }}>{store.name}</h3>
                    {canManage && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => openEditStoreModal(store)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteStore(store.id, store.name)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                    <strong>Email:</strong> {store.email}
                  </p>
                  
                  <p style={{ color: '#666', marginBottom: '1rem' }}>
                    <strong>Address:</strong> {store.address}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      {renderStarRating(store.average_rating || 0)}
                      <span style={{ color: '#666', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                        {store.average_rating ? parseFloat(store.average_rating).toFixed(1) : '0.0'} ({store.total_ratings || 0} rating{(store.total_ratings || 0) !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                  
                  {hasRole('user') && (
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                      {userRating ? (
                        <div>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>
                            Your rating:
                          </p>
                          {renderStarRating(userRating.rating)}
                          {userRating.comment && (
                            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', fontStyle: 'italic' }}>
                              "{userRating.comment}"
                            </p>
                          )}
                          <button
                            className="btn btn-outline"
                            onClick={() => openRatingModal(store)}
                            style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}
                          >
                            Update Rating
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => openRatingModal(store)}
                          style={{ fontSize: '0.875rem' }}
                        >
                          Rate This Store
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: '1rem', color: '#666' }}>
          Showing {filteredAndSortedStores.length} of {stores.length} stores
        </div>
      </div>

      {/* Store Modal */}
      {showStoreModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2>{modalMode === 'create' ? 'Add New Store' : 'Edit Store'}</h2>
            
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleStoreSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Store Name *
                  <small style={{ color: '#666', fontWeight: 'normal' }}> (10-100 characters)</small>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={storeFormData.name}
                  onChange={handleStoreInputChange}
                  required
                  minLength={10}
                  maxLength={100}
                  placeholder="Enter store name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={storeFormData.email}
                  onChange={handleStoreInputChange}
                  required
                  placeholder="Enter store email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Address *
                  <small style={{ color: '#666', fontWeight: 'normal' }}> (10-400 characters)</small>
                </label>
                <textarea
                  name="address"
                  className="form-textarea"
                  value={storeFormData.address}
                  onChange={handleStoreInputChange}
                  required
                  minLength={10}
                  maxLength={400}
                  rows={3}
                  placeholder="Enter store address"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeStoreModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (modalMode === 'create' ? 'Create Store' : 'Update Store')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h2>{existingRating ? 'Update Rating' : 'Rate Store'}: {selectedStore?.name}</h2>
            
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleRatingSubmit}>
              <div className="form-group">
                <label className="form-label">Your Rating *</label>
                {renderInteractiveStarRating(
                  ratingFormData.rating,
                  (rating) => setRatingFormData({ ...ratingFormData, rating })
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Comment *
                  <small style={{ color: '#666', fontWeight: 'normal' }}> (10-500 characters)</small>
                </label>
                <textarea
                  name="comment"
                  className="form-textarea"
                  value={ratingFormData.comment}
                  onChange={handleRatingInputChange}
                  required
                  minLength={10}
                  maxLength={500}
                  rows={4}
                  placeholder="Share your experience with this store..."
                />
                <small style={{ color: '#666' }}>
                  {ratingFormData.comment.length}/500 characters
                </small>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeRatingModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : (existingRating ? 'Update Rating' : 'Submit Rating')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stores;
