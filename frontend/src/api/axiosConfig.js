import axios from 'axios';

// In production (Vercel), REACT_APP_API_URL is set to your Railway backend URL.
// In development (local), it falls back to http://localhost:8080/api
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('leavetrack_user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatically redirect to login on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('leavetrack_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
