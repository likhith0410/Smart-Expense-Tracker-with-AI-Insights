// frontend/src/services/api.js - SIMPLIFIED FOR HARDCODED CATEGORIES
import axios from 'axios';

// Production API URL configuration
const getApiBaseUrl = () => {
  if (window.location.hostname.includes('vercel.app')) {
    return 'https://expense-tracker-backend2-1bv3.onrender.com/api';
  }
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('🌐 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    const { response, config } = error;
    
    if (response) {
      console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url} - ${response.status}:`, response.data);
      
      if (response.status === 401) {
        console.log('🔐 Unauthorized - clearing token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else {
      console.error('❌ Network Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Simplified expense service - NO CATEGORY API CALLS
export const expenseService = {
  // Get all expenses
  getExpenses: async (params = {}) => {
    try {
      console.log('💰 Fetching expenses with params:', params);
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/expenses/expenses/?${queryString}`);
      console.log(`✅ Expenses fetched: ${(response.data.results || response.data).length} items`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching expenses:', error);
      throw error;
    }
  },

  // Get expense by ID
  getExpense: async (id) => {
    try {
      const response = await api.get(`/expenses/expenses/${id}/`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching expense:', error);
      throw error;
    }
  },

  // Create new expense
  createExpense: async (data) => {
    try {
      console.log('💰 Creating expense:', data instanceof FormData ? 'FormData' : data);
      const response = await api.post('/expenses/expenses/', data);
      console.log('✅ Expense created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error creating expense:', error);
      throw error;
    }
  },

  // Update expense
  updateExpense: async (id, data) => {
    try {
      console.log(`💰 Updating expense ${id}`);
      const response = await api.put(`/expenses/expenses/${id}/`, data);
      console.log('✅ Expense updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error updating expense:', error);
      throw error;
    }
  },

  // Delete expense
  deleteExpense: async (id) => {
    try {
      console.log(`🗑️ Deleting expense ${id}`);
      await api.delete(`/expenses/expenses/${id}/`);
      console.log('✅ Expense deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting expense:', error);
      throw error;
    }
  },

  // Get expense statistics
  getStats: async () => {
    try {
      console.log('📊 Fetching expense stats...');
      const response = await api.get('/expenses/expenses/stats/');
      console.log('✅ Stats fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      return {
        total_expenses: 0,
        total_transactions: 0,
        avg_transaction: 0,
        top_category: 'None',
        monthly_trend: [],
        category_breakdown: []
      };
    }
  },

  // Get recent expenses
  getRecentExpenses: async () => {
    try {
      const response = await api.get('/expenses/expenses/recent/');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching recent expenses:', error);
      return [];
    }
  },

  // REMOVED: All category API methods - categories are now hardcoded
  // getCategories, createCategory, updateCategory, deleteCategory

  // Budget Management
  getBudgets: async () => {
    try {
      const response = await api.get('/expenses/budgets/');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching budgets:', error);
      return { results: [] };
    }
  },

  createBudget: async (data) => {
    try {
      const response = await api.post('/expenses/budgets/', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating budget:', error);
      throw error;
    }
  },

  updateBudget: async (id, data) => {
    try {
      const response = await api.put(`/expenses/budgets/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating budget:', error);
      throw error;
    }
  },

  deleteBudget: async (id) => {
    try {
      await api.delete(`/expenses/budgets/${id}/`);
    } catch (error) {
      console.error('❌ Error deleting budget:', error);
      throw error;
    }
  },

  getBudgetAlerts: async () => {
    try {
      const response = await api.get('/expenses/budgets/alerts/');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching budget alerts:', error);
      return [];
    }
  },

  // AI Services
  getAIInsights: async () => {
    try {
      const response = await api.get('/ai/insights/');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching AI insights:', error);
      return { insights: [] };
    }
  },

  getBudgetRecommendations: async () => {
    try {
      const response = await api.get('/ai/recommendations/');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching budget recommendations:', error);
      return { recommendations: [] };
    }
  },

  categorizeExpense: async (data) => {
    try {
      const response = await api.post('/ai/categorize/', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error categorizing expense:', error);
      return {
        suggested_category: {
          name: 'other'
        }
      };
    }
  },

  scanReceipt: async (formData) => {
    try {
      const response = await api.post('/ai/scan-receipt/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error scanning receipt:', error);
      throw error;
    }
  },
};

export default api;