// frontend/src/services/api.js - COMPLETE FIXED VERSION
import axios from 'axios';

//const API_BASE_URL = 'http://localhost:8000/api';
const API_BASE_URL = "https://smart-expense-backend-25rb.onrender.com/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
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
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Expense Service
export const expenseService = {
  // Get all expenses
  getExpenses: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/expenses/expenses/?${queryString}`).then(res => res.data);
  },

  // Get expense by ID
  getExpense: (id) => {
    return api.get(`/expenses/expenses/${id}/`).then(res => res.data);
  },

  // Create new expense
  createExpense: (data) => {
    return api.post('/expenses/expenses/', data).then(res => res.data);
  },

  // Update expense
  updateExpense: (id, data) => {
    return api.put(`/expenses/expenses/${id}/`, data).then(res => res.data);
  },

  // Delete expense
  deleteExpense: (id) => {
    return api.delete(`/expenses/expenses/${id}/`);
  },

  // Get expense statistics
  getStats: () => {
    return api.get('/expenses/expenses/stats/').then(res => res.data);
  },

  // Get recent expenses
  getRecentExpenses: () => {
    return api.get('/expenses/expenses/recent/').then(res => res.data);
  },

  // Get categories
  getCategories: () => {
    return api.get('/expenses/categories/').then(res => res.data);
  },

  // Create category
  createCategory: (data) => {
    return api.post('/expenses/categories/', data).then(res => res.data);
  },

  // Update category
  updateCategory: (id, data) => {
    return api.put(`/expenses/categories/${id}/`, data).then(res => res.data);
  },

  // Delete category
  deleteCategory: (id) => {
    return api.delete(`/expenses/categories/${id}/`);
  },

  // Budget Management - CONSOLIDATED (NO DUPLICATES)
  getBudgets: () => {
    return api.get('/expenses/budgets/').then(res => res.data);
  },

  createBudget: (data) => {
    return api.post('/expenses/budgets/', data).then(res => res.data);
  },

  updateBudget: (id, data) => {
    return api.put(`/expenses/budgets/${id}/`, data).then(res => res.data);
  },

  deleteBudget: (id) => {
    return api.delete(`/expenses/budgets/${id}/`);
  },

  getBudgetAlerts: () => {
    return api.get('/expenses/budgets/alerts/').then(res => res.data);
  },

  getBudgetAnalytics: () => {
    return api.get('/expenses/budgets/analytics/').then(res => res.data);
  },

  // AI Services
  getAIInsights: () => {
    return api.get('/ai/insights/').then(res => res.data);
  },

  getBudgetRecommendations: () => {
    return api.get('/ai/recommendations/').then(res => res.data);
  },

  categorizeExpense: (data) => {
    return api.post('/ai/categorize/', data).then(res => res.data);
  },

  scanReceipt: (formData) => {
    return api.post('/ai/scan-receipt/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
};

export default api;
