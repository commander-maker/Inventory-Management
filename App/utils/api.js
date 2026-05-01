import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // 15 second timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

console.log('[API] Configured with baseURL:', API_BASE_URL, 'and timeout: 15000ms');

// Add token to requests automatically
api.interceptors.request.use(
    async (config) => {
        try {
            console.log('[API] Making request to:', config.url, 'with method:', config.method);
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.error('Error reading token from AsyncStorage:', e);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => {
        console.log('[API] Response received from:', response.config.url, 'Status:', response.status);
        return response;
    },
    async (error) => {
        console.error('[API] Response error from:', error.config?.url);
        console.error('[API] Error status:', error.response?.status);
        console.error('[API] Error data:', error.response?.data);
        console.error('[API] Error message:', error.message);
        
        if (error.response?.status === 401) {
            // Token expired or invalid
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            // Navigation to login should be handled by a higher-level interceptor or auth context
            // This is a basic approach
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
    getIncome: (params) => api.get('/finance/income', { params }),
    createIncome: (data) => api.post('/finance/income', data),
    // Recent Transactions
    getRecentTransactions: (limit) => api.get('/finance/recent-transactions', { params: { limit } })
};

// Notification API
export const notificationAPI = {
    getAll: () => api.get('/notifications'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`)
};

export default api;
