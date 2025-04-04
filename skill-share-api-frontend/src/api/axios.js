// src/api/axios.js
import axios from 'axios';

// Create an axios instance with default configs
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080', // Adjust port as needed
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor for auth headers if needed
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.token) {
            config.headers['Authorization'] = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for handling errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;