import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { usersAPI, ratingsAPI } from '../services/api';

const Profile = () => {
  const { user, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Profile edit state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    address: ''
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Rating history state
  const [myRatings, setMyRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'ratings') {
      loadMyRatings();
    }
  }, [activeTab]);

  const loadMyRatings = async () => {
    try {
      setRatingsLoading(true);
      const response = await ratingsAPI.getMyRatings();
      setMyRatings(response.data.ratings || []);
    } catch (err) {
      console.error('Failed to load ratings:', err);
      setError('Failed to load your ratings');
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await usersAPI.update(user.id, profileData);
      setMessage('Profile updated successfully!');
      
      // Update user data in localStorage
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload(); // Refresh to update auth context
    } catch (err) {
      setError('Failed to update profile: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return 'All password fields are required';
    }
    
    if (newPassword.length < 8 || newPassword.length > 16) {
      return 'New password must be between 8 and 16 characters';
    }
    
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
    
    if (!hasUppercase || !hasSpecialChar) {
      return 'New password must contain at least one uppercase letter and one special character';
    }
    
    if (newPassword !== confirmPassword) {
      return 'New passwords do not match';
    }
    
    return null;
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });

    if (result.success) {
      setMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const renderProfileTab = () => (
    <div>
      <h3>Profile Information</h3>
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
      
      <form onSubmit={handleProfileUpdate}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            className="form-input"
            value={profileData.name}
            onChange={handleProfileChange}
            minLength={20}
            maxLength={60}
            required
          />
          <small style={{ color: '#666' }}>20-60 characters required</small>
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={profileData.email}
            onChange={handleProfileChange}
            required
            disabled
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
          />
          <small style={{ color: '#666' }}>Email cannot be changed</small>
        </div>
        
        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea
            name="address"
            className="form-textarea"
            value={profileData.address}
            onChange={handleProfileChange}
            maxLength={400}
            rows={3}
            placeholder="Enter your address"
          />
          <small style={{ color: '#666' }}>Maximum 400 characters</small>
        </div>
        
        <div className="form-group">
          <label className="form-label">Role</label>
          <input
            type="text"
            className="form-input"
            value={user?.role || ''}
            disabled
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', textTransform: 'capitalize' }}
          />
          <small style={{ color: '#666' }}>Role cannot be changed</small>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );

  const renderPasswordTab = () => (
    <div>
      <h3>Change Password</h3>
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
      
      <form onSubmit={handlePasswordUpdate}>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            className="form-input"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
            placeholder="Enter your current password"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input
            type="password"
            name="newPassword"
            className="form-input"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
            minLength={8}
            maxLength={16}
            placeholder="Enter new password"
          />
          <small style={{ color: '#666' }}>8-16 characters, 1 uppercase, 1 special character required</small>
        </div>
        
        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-input"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
            placeholder="Confirm new password"
          />
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );

  const renderRatingsTab = () => (
    <div>
      <h3>My Ratings</h3>
      
      {ratingsLoading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : myRatings.length === 0 ? (
        <div className="card">
          <p>You haven't submitted any ratings yet.</p>
          <a href="/stores" className="btn btn-primary">Browse Stores</a>
        </div>
      ) : (
        <div>
          {myRatings.map((rating) => (
            <div key={rating.id} className="card" style={{ marginBottom: '1rem' }}>
              <h4>{rating.store_name}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`star ${star <= rating.rating ? 'filled' : 'empty'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span style={{ color: '#666' }}>
                  {new Date(rating.created_at).toLocaleDateString()}
                </span>
              </div>
              {rating.comment && (
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  "{rating.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container">
      <div className="card">
        <h1>My Profile</h1>
        
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem', 
          borderBottom: '1px solid #eee',
          paddingBottom: '1rem'
        }}>
          <button
            className={activeTab === 'profile' ? 'btn btn-primary' : 'btn btn-outline'}
            onClick={() => {
              setActiveTab('profile');
              setMessage('');
              setError('');
            }}
          >
            Profile Info
          </button>
          <button
            className={activeTab === 'password' ? 'btn btn-primary' : 'btn btn-outline'}
            onClick={() => {
              setActiveTab('password');
              setMessage('');
              setError('');
            }}
          >
            Change Password
          </button>
          <button
            className={activeTab === 'ratings' ? 'btn btn-primary' : 'btn btn-outline'}
            onClick={() => {
              setActiveTab('ratings');
              setMessage('');
              setError('');
            }}
          >
            My Ratings
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'password' && renderPasswordTab()}
        {activeTab === 'ratings' && renderRatingsTab()}
      </div>
    </div>
  );
};

export default Profile;
