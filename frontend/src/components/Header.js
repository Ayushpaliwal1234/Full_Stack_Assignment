import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Header = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/dashboard" className="nav-brand">
          Store Rating System
        </Link>
        
        <div className="nav-links">
          <Link to="/dashboard" className={isActive('/dashboard')}>
            Dashboard
          </Link>
          
          <Link to="/stores" className={isActive('/stores')}>
            Stores
          </Link>
          
          {hasRole('admin') && (
            <Link to="/users" className={isActive('/users')}>
              Users
            </Link>
          )}
          
          <Link to="/profile" className={isActive('/profile')}>
            Profile
          </Link>
          
          <div className="nav-user">
            <span style={{ marginRight: '1rem', color: '#666' }}>
              Welcome, {user?.name}
              <small style={{ display: 'block', fontSize: '0.8rem' }}>
                ({user?.role})
              </small>
            </span>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
