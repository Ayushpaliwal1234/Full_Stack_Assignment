import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Users API (Admin only)
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Stores API
export const storesAPI = {
  getAll: (params) => api.get('/stores', { params }),
  getById: (id) => api.get(`/stores/${id}`),
  create: (storeData) => api.post('/stores', storeData),
  update: (id, storeData) => api.put(`/stores/${id}`, storeData),
  delete: (id) => api.delete(`/stores/${id}`),
  getMyStores: () => api.get('/stores/my-stores'),
};

// Ratings API
export const ratingsAPI = {
  submit: (ratingData) => api.post('/ratings', ratingData),
  update: (id, ratingData) => api.put(`/ratings/${id}`, ratingData),
  getByStore: (storeId) => api.get(`/ratings/store/${storeId}`),
  getMyRatings: () => api.get('/ratings/my-ratings'),
};

// Dashboard API
export const dashboardAPI = {
  getAdminStats: () => api.get('/dashboard/admin'),
  getStoreOwnerStats: () => api.get('/dashboard/store-owner'),
  getUserStats: () => api.get('/dashboard/user'),
  getStoreStats: (storeId) => api.get(`/dashboard/store/${storeId}`),
};

export default api;
