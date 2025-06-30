// frontend/src/utils/helpers.js - COMPLETE VERSION
import { format, parseISO, isValid } from 'date-fns';
import { currencyService } from '../services/currencyService';

// Format currency using current selected currency
export const formatCurrency = (amount, currencyCode = null) => {
  return currencyService.formatAmount(amount, currencyCode);
};

// Format date
export const formatDate = (date, formatString = 'MMM d, yyyy') => {
  try {
    let dateObj;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'Invalid Date';
    }
    
    if (!isValid(dateObj)) {
      return 'Invalid Date';
    }
    
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

// Get currency symbol for current currency
export const getCurrencySymbol = () => {
  const currentCurrency = currencyService.getCurrentCurrency();
  return currencyService.currencies[currentCurrency]?.symbol || '₹';
};

// Convert amount between currencies (simplified - in real app use exchange rate API)
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  // This is a simplified conversion - in a real app, you'd use live exchange rates
  const exchangeRates = {
    'INR': { 'USD': 0.012, 'EUR': 0.011, 'GBP': 0.0095 },
    'USD': { 'INR': 83.0, 'EUR': 0.92, 'GBP': 0.79 },
    'EUR': { 'INR': 90.0, 'USD': 1.09, 'GBP': 0.86 },
    'GBP': { 'INR': 105.0, 'USD': 1.27, 'EUR': 1.16 }
  };
  
  if (fromCurrency === toCurrency) return amount;
  
  const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
  return amount * rate;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Generate random color
export const generateRandomColor = () => {
  const colors = [
    '#6366f1', '#8b5cf6', '#10b981', '#f59e0b',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316',
    '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get month name
export const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex] || '';
};

// Get time ago
export const getTimeAgo = (date) => {
  const now = new Date();
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(dateObj, 'MMM d, yyyy');
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Sort array by key
export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
};

// Format number with commas
export const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};

// Get expense category color
export const getCategoryColor = (categoryName) => {
  const colors = {
    'Food & Dining': '#ef4444',
    'Transportation': '#3b82f6',
    'Shopping': '#8b5cf6',
    'Entertainment': '#f59e0b',
    'Healthcare': '#10b981',
    'Utilities': '#06b6d4',
    'Education': '#84cc16',
    'Other': '#64748b'
  };
  return colors[categoryName] || colors['Other'];
};