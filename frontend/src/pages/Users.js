import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    address: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      address: ''
    });
    setShowModal(true);
    setError('');
    setMessage('');
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Don't populate password for editing
      role: user.role || 'user',
      address: user.address || ''
    });
    setShowModal(true);
    setError('');
    setMessage('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      address: ''
    });
    setError('');
    setMessage('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { name, email, password, role } = formData;
    
    if (!name || name.length < 20 || name.length > 60) {
      return 'Name must be between 20 and 60 characters';
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    
    if (modalMode === 'create' && (!password || password.length < 8 || password.length > 16)) {
      return 'Password must be between 8 and 16 characters';
    }
    
    if (modalMode === 'create' && password) {
      const hasUppercase = /[A-Z]/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      
      if (!hasUppercase || !hasSpecialChar) {
        return 'Password must contain at least one uppercase letter and one special character';
      }
    }
    
    if (!['admin', 'store_owner', 'user'].includes(role)) {
      return 'Invalid role selected';
    }
    
    if (formData.address && formData.address.length > 400) {
      return 'Address must not exceed 400 characters';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    
    try {
      if (modalMode === 'create') {
        await usersAPI.create(formData);
        setMessage('User created successfully!');
      } else {
        // For edit mode, don't send password if it's empty
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await usersAPI.update(selectedUser.id, updateData);
        setMessage('User updated successfully!');
      }
      
      await loadUsers();
      closeModal();
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.response?.data?.error || `Failed to ${modalMode} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await usersAPI.delete(userId);
      setMessage('User deleted successfully!');
      await loadUsers();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // Sort and handle table column clicks
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort users based on search term and role
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      
      if (sortField === 'created_at') {
        const comparison = new Date(aVal) - new Date(bVal);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'store_owner': return '#28a745';
      case 'user': return '#007bff';
      default: return '#6c757d';
    }
  };

  if (loading && users.length === 0) {
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
          <h1>User Management</h1>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + Add New User
          </button>
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
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: '1', minWidth: '250px' }}
          />
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="store_owner">Store Owner</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Users Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('name')}
                >
                  Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('email')}
                >
                  Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('role')}
                >
                  Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('address')}
                >
                  Address {sortField === 'address' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('created_at')}
                >
                  Created {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    {users.length === 0 ? 'No users found' : 'No users match your search criteria'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: '600' }}>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span style={{ 
                        color: getRoleColor(user.role),
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.address || '-'}
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => openEditModal(user)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(user.id, user.name)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1rem', color: '#666' }}>
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Modal */}
      {showModal && (
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
            <h2>{modalMode === 'create' ? 'Add New User' : 'Edit User'}</h2>
            
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Name *
                  <small style={{ color: '#666', fontWeight: 'normal' }}> (20-60 characters)</small>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  minLength={20}
                  maxLength={60}
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Password {modalMode === 'create' ? '*' : '(leave empty to keep current)'}
                  <small style={{ color: '#666', fontWeight: 'normal' }}> (8-16 chars, 1 uppercase, 1 special char)</small>
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={modalMode === 'create'}
                  minLength={8}
                  maxLength={16}
                  placeholder={modalMode === 'create' ? 'Enter password' : 'Leave empty to keep current password'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role *</label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="user">User</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Address
                  <small style={{ color: '#666', fontWeight: 'normal' }}> (max 400 characters)</small>
                </label>
                <textarea
                  name="address"
                  className="form-textarea"
                  value={formData.address}
                  onChange={handleInputChange}
                  maxLength={400}
                  rows={3}
                  placeholder="Enter address"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (modalMode === 'create' ? 'Create User' : 'Update User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
