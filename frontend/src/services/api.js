import axios from 'axios';

// ✅ DIRECT RENDER LINK (No Env Variables needed anymore)
export const API_URL = "https://taskflow-api-67gl.onrender.com";

console.log("🔗 Connecting to Backend at:", API_URL); 

const api = axios.create({
  baseURL: API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Token Attach karne ke liye
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

// Response Interceptor: Token Expire handle karne ke liye
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Session Expired. Logging out...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;