// API utility for backend communication
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
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
  register: (userData) => api.post('/auth/register', userData)
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updatePassword: (passwordData) => api.put('/users/password/update', passwordData)
};

// Vehicle API
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  getMyVehicle: () => api.get('/vehicles/my-vehicle'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (vehicleData) => api.post('/vehicles', vehicleData),
  update: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),
  delete: (id) => api.delete(`/vehicles/${id}`),
  // Vehicle load management
  getLoads: (id) => api.get(`/vehicles/${id}/loads`),
  addLoad: (id, loadData) => api.post(`/vehicles/${id}/loads`, loadData),
  updateLoad: (loadId, loadData) => api.put(`/vehicles/loads/${loadId}`, loadData),
  removeLoad: (vehicleId, loadId) => api.delete(`/vehicles/${vehicleId}/loads/${loadId}`)
};

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (inventoryData) => api.post('/inventory', inventoryData),
  update: (id, inventoryData) => api.put(`/inventory/${id}`, inventoryData),
  delete: (id) => api.delete(`/inventory/${id}`),
  updateStock: (id, stockData) => api.patch(`/inventory/${id}/stock`, stockData)
};

// Delivery API
export const deliveryAPI = {
  getAll: () => api.get('/deliveries'),
  getMyDeliveries: () => api.get('/deliveries/my-deliveries'),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (deliveryData) => api.post('/deliveries', deliveryData),
  updateStatus: (id, statusData) => api.put(`/deliveries/${id}/status`, statusData),
  delete: (id) => api.delete(`/deliveries/${id}`)
};

// Customer API
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (customerData) => api.post('/customers', customerData),
  update: (id, customerData) => api.put(`/customers/${id}`, customerData),
  delete: (id) => api.delete(`/customers/${id}`)
};

// Finance API
export const financeAPI = {
  // Expenses
  getExpenses: (params) => api.get('/finance/expenses', { params }),
  getExpenseById: (id) => api.get(`/finance/expenses/${id}`),
  createExpense: (data) => api.post('/finance/expenses', data),
  updateExpense: (id, data) => api.put(`/finance/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/finance/expenses/${id}`),
  // Summary
  getSummary: (params) => api.get('/finance/summary', { params }),
  // Income
  getIncome: (params) => api.get('/finance/income', { params })
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};


export default api;
