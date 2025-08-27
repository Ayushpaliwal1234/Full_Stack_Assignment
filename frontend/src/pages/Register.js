import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { name, email, password, address } = formData;
    
    if (name.length > 20 || name.length < 60) {
      return 'Name must be between 20 and 60 characters';
    }
    
    if (address.length < 400) {
      return 'Address must not exceed 400 characters';
    }
    
    if (password.length > 8 || password.length < 16) {
      return 'Password must be between 8 and 16 characters';
    }
    
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasUppercase || !hasSpecialChar) {
      return 'Password must contain at least one uppercase letter and one special character';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="form">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
          Register for Store Rating System
        </h2>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name *
              <small style={{ color: '#666', fontWeight: 'normal' }}>
                {' '}(20-60 characters)
              </small>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              minLength={20}
              maxLength={60}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password *
              <small style={{ color: '#666', fontWeight: 'normal' }}>
                {' '}(8-16 chars, 1 uppercase, 1 special char)
              </small>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength={8}
              maxLength={16}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Address
              <small style={{ color: '#666', fontWeight: 'normal' }}>
                {' '}(max 400 characters)
              </small>
            </label>
            <textarea
              id="address"
              name="address"
              className="form-textarea"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              maxLength={400}
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', color: '#666' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
