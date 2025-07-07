// frontend/src/components/ExpenseForm.jsx - UPDATED WITH CURRENCY SUPPORT
import React, { useState, useEffect } from 'react';
import { X, Camera, Sparkles, Save } from 'lucide-react';
import { expenseService } from '../services/api';
import { currencyService } from '../services/currencyService';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import '../styles/ExpenseForm.css';

const ExpenseForm = ({ isOpen, onClose, onExpenseAdded, editingExpense = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    payment_method: 'cash',
    date: formatDate(new Date(), 'yyyy-MM-dd'),
    receipt_image: null,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanningReceipt, setScanningReceipt] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [currentCurrency, setCurrentCurrency] = useState('INR');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      // Get current currency
      setCurrentCurrency(currencyService.getCurrentCurrency());
      
      if (editingExpense) {
        setFormData({
          title: editingExpense.title,
          description: editingExpense.description || '',
          amount: editingExpense.amount.toString(),
          category: editingExpense.category.toString(),
          payment_method: editingExpense.payment_method,
          date: formatDate(editingExpense.date, 'yyyy-MM-dd'),
          receipt_image: null,
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingExpense]);

  // Listen for currency changes
  useEffect(() => {
    const handleCurrencyChange = (event) => {
      setCurrentCurrency(event.detail);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await expenseService.getCategories();
      setCategories(data.results || data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      amount: '',
      category: '',
      payment_method: 'cash',
      date: formatDate(new Date(), 'yyyy-MM-dd'),
      receipt_image: null,
    });
    setAiSuggestion(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'receipt_image') {
      setFormData(prev => ({ ...prev, [name]: files[0] || null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-suggest category when title changes
      if (name === 'title' && value.length > 2 && !editingExpense) {
        getSuggestion(value);
      }
    }
  };

  const getSuggestion = async (title) => {
    try {
      const suggestion = await expenseService.categorizeExpense({ 
        title, 
        description: formData.description 
      });
      setAiSuggestion(suggestion.suggested_category);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
    }
  };

  const applySuggestion = () => {
    if (aiSuggestion) {
      setFormData(prev => ({ ...prev, category: aiSuggestion.id.toString() }));
      setAiSuggestion(null);
      toast.success('AI suggestion applied!');
    }
  };

  const handleReceiptScan = async (file) => {
    setScanningReceipt(true);
    const formDataForScan = new FormData();
    formDataForScan.append('receipt_image', file);

    try {
      const result = await expenseService.scanReceipt(formDataForScan);
      
      setFormData(prev => ({
        ...prev,
        title: result.merchant || prev.title,
        amount: result.amount ? result.amount.toString() : prev.amount,
        category: result.suggested_category?.id?.toString() || prev.category,
      }));
      
      toast.success('Receipt scanned successfully! 📄✨');
    } catch (error) {
      console.error('Error scanning receipt:', error);
      toast.error('Failed to scan receipt. Please try again.');
    } finally {
      setScanningReceipt(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, submitData);
        toast.success('Expense updated successfully! ✅');
      } else {
        await expenseService.createExpense(submitData);
        toast.success('Expense added successfully! 🎉');
      }

      onExpenseAdded();
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get current currency symbol
  const getCurrencySymbol = () => {
    return currencyService.currencies[currentCurrency]?.symbol || '₹';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="expense-form-modal glass-card">
        <div className="modal-header">
          <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="title" className="input-label">
                Expense Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Lunch at restaurant"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="amount" className="input-label">
                Amount ({getCurrencySymbol()}) *
              </label>
              <div className="amount-input">
                <span className="currency-symbol-input">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input-field amount-field"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="category" className="input-label">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              
              {aiSuggestion && (
                <div className="ai-suggestion">
                  <button
                    type="button"
                    className="suggestion-btn"
                    onClick={applySuggestion}
                  >
                    <Sparkles size={16} />
                    AI suggests: {aiSuggestion.icon} {aiSuggestion.name}
                  </button>
                </div>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="payment_method" className="input-label">
                Payment Method
              </label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="input-field"
              >
                <option value="cash">💵 Cash</option>
                <option value="card">💳 Card</option>
                <option value="upi">📱 UPI</option>
                <option value="bank_transfer">🏦 Bank Transfer</option>
                <option value="other">🔄 Other</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="description" className="input-label">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field textarea"
              placeholder="Additional details about the expense..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="date" className="input-label">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="receipt_image" className="input-label">
                Receipt Image
              </label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="receipt_image"
                  name="receipt_image"
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.files[0]) {
                      handleReceiptScan(e.target.files[0]);
                    }
                  }}
                  className="file-input"
                  accept="image/*"
                />
                <label htmlFor="receipt_image" className="file-label">
                  <Camera size={20} />
                  {scanningReceipt ? 'Scanning...' : 'Upload Receipt'}
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <Save size={18} />
                  {editingExpense ? 'Update' : 'Add'} Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;