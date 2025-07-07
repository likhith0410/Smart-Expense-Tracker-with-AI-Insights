// frontend/src/services/currencyService.js
import React, { createContext, useContext, useState, useEffect } from 'react';

export const currencyService = {
  currencies: {
    INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
    USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
    EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
    GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
    JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
    AUD: { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
    CNY: { symbol: '¥', name: 'Chinese Yuan', code: 'CNY' },
    SGD: { symbol: 'S$', name: 'Singapore Dollar', code: 'SGD' },
    AED: { symbol: 'د.إ', name: 'UAE Dirham', code: 'AED' }
  },

  // Get current currency from localStorage
  getCurrentCurrency: () => {
    return localStorage.getItem('selectedCurrency') || 'INR';
  },

  // Set currency in localStorage
  setCurrency: (currencyCode) => {
    localStorage.setItem('selectedCurrency', currencyCode);
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currencyCode }));
  },

  // Format amount with current currency
  formatAmount: (amount, currencyCode = null) => {
    const currency = currencyCode || currencyService.getCurrentCurrency();
    const currencyInfo = currencyService.currencies[currency];
    
    if (!currencyInfo) return `${amount}`;
    
    // Format number based on currency
    let formattedAmount;
    if (currency === 'INR') {
      // Indian numbering system (lakhs, crores)
      formattedAmount = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } else {
      // International numbering system
      formattedAmount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    }
    
    return `${currencyInfo.symbol}${formattedAmount}`;
  },

  // Get all available currencies
  getAllCurrencies: () => {
    return Object.entries(currencyService.currencies).map(([code, info]) => ({
      code,
      ...info
    }));
  }
};

// Currency Context for React
const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(currencyService.getCurrentCurrency());

  useEffect(() => {
    const handleCurrencyChange = (event) => {
      setCurrency(event.detail);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  const changeCurrency = (newCurrency) => {
    currencyService.setCurrency(newCurrency);
    setCurrency(newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};