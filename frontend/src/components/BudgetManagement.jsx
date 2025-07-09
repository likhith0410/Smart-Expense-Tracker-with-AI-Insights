// frontend/src/components/BudgetManagement.jsx - HARDCODED CATEGORIES VERSION
import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  X
} from 'lucide-react';
import { expenseService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import '../styles/BudgetManagement.css';

const BudgetManagement = ({ user, isOpen, onClose }) => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    start_date: formatDate(new Date(), 'yyyy-MM-dd'),
    end_date: getDefaultEndDate('monthly')
  });

  // Hardcoded categories - same as ExpenseForm
  const categories = [
    { value: 'food_dining', name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B' },
    { value: 'transportation', name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
    { value: 'shopping', name: 'Shopping', icon: '🛍️', color: '#45B7D1' },
    { value: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#96CEB4' },
    { value: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#FFEAA7' },
    { value: 'utilities', name: 'Utilities', icon: '⚡', color: '#DDA0DD' },
    { value: 'education', name: 'Education', icon: '📚', color: '#98D8C8' },
    { value: 'groceries', name: 'Groceries', icon: '🛒', color: '#F7DC6F' },
    { value: 'fitness', name: 'Fitness', icon: '💪', color: '#BB8FCE' },
    { value: 'travel', name: 'Travel', icon: '✈️', color: '#85C1E9' },
    { value: 'bills_subscriptions', name: 'Bills & Subscriptions', icon: '📄', color: '#F8C471' },
    { value: 'clothing', name: 'Clothing', icon: '👕', color: '#82E0AA' },
    { value: 'electronics', name: 'Electronics', icon: '📱', color: '#AED6F1' },
    { value: 'home_garden', name: 'Home & Garden', icon: '🏠', color: '#A9DFBF' },
    { value: 'gifts_donations', name: 'Gifts & Donations', icon: '🎁', color: '#F1948A' },
    { value: 'other', name: 'Other', icon: '💰', color: '#D5DBDB' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [budgetsData, expensesData] = await Promise.all([
        expenseService.getBudgets(),
        expenseService.getExpenses({ limit: 1000 })
      ]);

      setBudgets(budgetsData.results || budgetsData);
      setExpenses(expensesData.results || expensesData);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  function getDefaultEndDate(period) {
    const now = new Date();
    switch (period) {
      case 'weekly':
        return formatDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      case 'monthly':
        return formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd');
      case 'yearly':
        return formatDate(new Date(now.getFullYear(), 11, 31), 'yyyy-MM-dd');
      default:
        return formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd');
    }
  }

  const calculateBudgetProgress = (budget) => {
    const budgetStart = new Date(budget.start_date);
    const budgetEnd = new Date(budget.end_date);
    
    // Find expenses for this category within the budget period
    const categoryExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expense.category === budget.category &&
             expenseDate >= budgetStart &&
             expenseDate <= budgetEnd;
    });

    const totalSpent = categoryExpenses.reduce((sum, expense) => 
      sum + parseFloat(expense.amount), 0
    );

    const percentage = Math.min((totalSpent / budget.amount) * 100, 100);
    const remaining = Math.max(budget.amount - totalSpent, 0);
    const isOverBudget = totalSpent > budget.amount;
    const status = getStatus(percentage, isOverBudget);

    return {
      totalSpent,
      remaining,
      percentage,
      isOverBudget,
      status,
      transactionCount: categoryExpenses.length,
      categoryExpenses
    };
  };

  const getStatus = (percentage, isOverBudget) => {
    if (isOverBudget) return 'over-budget';
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    if (percentage >= 50) return 'good';
    return 'excellent';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'over-budget':
        return <AlertTriangle size={20} className="status-icon over-budget" />;
      case 'critical':
        return <TrendingUp size={20} className="status-icon critical" />;
      case 'warning':
        return <AlertTriangle size={20} className="status-icon warning" />;
      case 'good':
        return <TrendingUp size={20} className="status-icon good" />;
      case 'excellent':
        return <CheckCircle size={20} className="status-icon excellent" />;
      default:
        return <Target size={20} className="status-icon" />;
    }
  };

  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories.find(cat => cat.value === 'other');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBudget) {
        await expenseService.updateBudget(editingBudget.id, formData);
        toast.success('Budget updated successfully! 🎯');
      } else {
        await expenseService.createBudget(formData);
        toast.success('Budget created successfully! 💰');
      }
      
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('Failed to save budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
      start_date: budget.start_date,
      end_date: budget.end_date
    });
    setShowForm(true);
  };

  const handleDelete = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await expenseService.deleteBudget(budgetId);
        toast.success('Budget deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Error deleting budget:', error);
        toast.error('Failed to delete budget');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      period: 'monthly',
      start_date: formatDate(new Date(), 'yyyy-MM-dd'),
      end_date: getDefaultEndDate('monthly')
    });
    setEditingBudget(null);
    setShowForm(false);
  };

  const handlePeriodChange = (period) => {
    setFormData(prev => ({
      ...prev,
      period,
      end_date: getDefaultEndDate(period)
    }));
  };

  const getOverallBudgetHealth = () => {
    if (budgets.length === 0) return { status: 'no-budgets', message: 'No budgets set' };
    
    const budgetProgresses = budgets.map(calculateBudgetProgress);
    const overBudgetCount = budgetProgresses.filter(p => p.isOverBudget).length;
    const criticalCount = budgetProgresses.filter(p => p.status === 'critical').length;
    
    if (overBudgetCount > 0) {
      return { 
        status: 'critical', 
        message: `${overBudgetCount} budget${overBudgetCount > 1 ? 's' : ''} exceeded`,
        color: '#ef4444'
      };
    }
    
    if (criticalCount > 0) {
      return { 
        status: 'warning', 
        message: `${criticalCount} budget${criticalCount > 1 ? 's' : ''} near limit`,
        color: '#f59e0b'
      };
    }
    
    return { 
      status: 'good', 
      message: 'All budgets on track',
      color: '#10b981'
    };
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="budget-loading">
        <div className="loading-spinner"></div>
        <p>Loading budget data...</p>
      </div>
    );
  }

  const overallHealth = getOverallBudgetHealth();

  return (
    <div className="modal-overlay">
      <div className="budget-management-modal glass-card">
        <div className="modal-header">
          <h2>
            <Target size={24} />
            Budget Management
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Overall Budget Health */}
        <div className="budget-overview">
          <div className="health-indicator" style={{ borderColor: overallHealth.color }}>
            <div className="health-icon" style={{ color: overallHealth.color }}>
              {overallHealth.status === 'critical' ? <AlertTriangle size={24} /> :
               overallHealth.status === 'warning' ? <TrendingUp size={24} /> :
               overallHealth.status === 'good' ? <CheckCircle size={24} /> :
               <Target size={24} />}
            </div>
            <div className="health-content">
              <h3>Budget Health</h3>
              <p style={{ color: overallHealth.color }}>{overallHealth.message}</p>
              <span className="budget-count">{budgets.length} active budget{budgets.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            Add Budget
          </button>
        </div>

        {/* Budget List */}
        <div className="budget-list">
          {budgets.length === 0 ? (
            <div className="empty-budgets">
              <Target size={48} />
              <h3>No budgets set</h3>
              <p>Create your first budget to start tracking your spending goals</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={18} />
                Create Budget
              </button>
            </div>
          ) : (
            budgets.map((budget) => {
              const progress = calculateBudgetProgress(budget);
              const categoryInfo = getCategoryInfo(budget.category);
              
              return (
                <div key={budget.id} className={`budget-card ${progress.status}`}>
                  <div className="budget-header">
                    <div className="budget-category">
                      <span className="category-icon" style={{ color: categoryInfo.color }}>
                        {categoryInfo.icon}
                      </span>
                      <div className="budget-info">
                        <h4>{categoryInfo.name}</h4>
                        <span className="budget-period">{budget.period} budget</span>
                      </div>
                    </div>
                    
                    <div className="budget-actions">
                      {getStatusIcon(progress.status)}
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="budget-progress">
                    <div className="progress-info">
                      <span className="spent">
                        Spent: {formatCurrency(progress.totalSpent)}
                      </span>
                      <span className="budget-total">
                        of {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${progress.status}`}
                        style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="progress-details">
                      <span className="percentage">
                        {progress.percentage.toFixed(1)}% used
                      </span>
                      <span className="remaining">
                        {progress.isOverBudget ? 
                          `${formatCurrency(progress.totalSpent - budget.amount)} over budget` :
                          `${formatCurrency(progress.remaining)} remaining`
                        }
                      </span>
                    </div>
                  </div>

                  <div className="budget-footer">
                    <div className="budget-stats">
                      <span>
                        <Calendar size={14} />
                        {formatDate(budget.start_date, 'MMM d')} - {formatDate(budget.end_date, 'MMM d')}
                      </span>
                      <span>
                        <DollarSign size={14} />
                        {progress.transactionCount} transactions
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Budget Form */}
        {showForm && (
          <div className="budget-form-overlay">
            <div className="budget-form glass-card">
              <div className="form-header">
                <h3>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</h3>
                <button className="close-btn" onClick={resetForm}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="input-field"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Budget Amount *</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="input-field"
                      placeholder="Enter amount"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">Period</label>
                    <select
                      value={formData.period}
                      onChange={(e) => handlePeriodChange(e.target.value)}
                      className="input-field"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="input-field"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Target size={16} />
                    {editingBudget ? 'Update' : 'Create'} Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetManagement;