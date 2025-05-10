// resources/js/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://localhost:8000/api' 
    : 'http://localhost:8000/api',
  withCredentials: true,
});

export default api;