import axios from 'axios';

// ✅ LOAD API URL FROM ENV (Yahan se link uthayega)
// Exporting it so Socket.io can use the exact same URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log("🔗 Connecting to Backend at:", API_URL); // Debugging ke liye

// Create Axios instance
const api = axios.create({
  baseURL: API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attaches Token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles Token Expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid/expired, logout user
      console.warn("⚠️ Session Expired. Logging out...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;