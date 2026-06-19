// ============================================================
//  src/services/api.js
//  All HTTP calls to the backend in one place.
//  Every function returns the data directly or throws an error.
// ============================================================

import axios from 'axios';

// This base URL uses Vite's proxy in development.
// In production, change to your deployed backend URL:
// const API = axios.create({ baseURL: 'https://your-backend.railway.app' });
const API = axios.create({ 
  baseURL: 'https://fbr-backend-production.up.railway.app/api' 
});

// Automatically attach the login token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fbr_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token expires, redirect to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('fbr_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) =>
    API.post('/auth/login', { email, password }).then(r => r.data),

  verify: () =>
    API.get('/auth/verify').then(r => r.data),
};

// ── Customers ─────────────────────────────────────────────────
export const customersApi = {
  list: () =>
    API.get('/customers').then(r => r.data),

  get: (id) =>
    API.get(`/customers/${id}`).then(r => r.data),

  create: (data) =>
    API.post('/customers', data).then(r => r.data),

  update: (id, data) =>
    API.put(`/customers/${id}`, data).then(r => r.data),

  remove: (id) =>
    API.delete(`/customers/${id}`).then(r => r.data),
};

// ── Invoices ──────────────────────────────────────────────────
export const invoicesApi = {
  list: (params = {}) =>
    API.get('/invoices', { params }).then(r => r.data),

  stats: (customerId) =>
    API.get(`/invoices/stats/${customerId}`).then(r => r.data),

  // Upload an Excel file (multipart form data)
  upload: (customerId, file, onProgress) => {
    const form = new FormData();
    form.append('customerId', customerId);
    form.append('file', file);
    return API.post('/invoices/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    }).then(r => r.data);
  },

  remove: (id) =>
    API.delete(`/invoices/${id}`).then(r => r.data),
};

// ── FBR Sync ──────────────────────────────────────────────────
export const fbrApi = {
  syncAll: (customerId) =>
    API.post(`/fbr/sync/${customerId}`).then(r => r.data),

  submitOne: (invoiceId) =>
    API.post(`/fbr/submit/${invoiceId}`).then(r => r.data),

  checkStatus: (invoiceId) =>
    API.get(`/fbr/status/${invoiceId}`).then(r => r.data),
};

export default API;
