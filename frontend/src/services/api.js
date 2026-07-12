import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('iw_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    
    // Auto-logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('iw_token');
      localStorage.removeItem('iw_user');
      // Don't redirect here — let AuthContext handle it
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      errors: error.response?.data?.errors || [],
    });
  }
);

export default api;
