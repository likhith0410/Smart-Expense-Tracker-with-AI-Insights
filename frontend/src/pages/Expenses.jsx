// frontend/src/pages/Expenses.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import { expenseService } from '../services/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import '../styles/Expenses.css';

const Expenses = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const data = await expenseService.getExpenses(params);
      setExpenses(data.results || data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await expenseService.getCategories();
      setCategories(data.results || data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(expenseId);
        toast.success('Expense deleted successfully');
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
      }
    }
  };

  const handleExpenseAdded = () => {
    fetchExpenses();
    setShowForm(false);
    setEditingExpense(null);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      start_date: '',
      end_date: '',
    });
  };

  return (
    <div className="expenses-page">
      <div className="expenses-header">
        <div>
          <h1>Expense Management</h1>
          <p>Track and manage your daily expenses</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddExpense}>
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      <div className="expenses-filters glass-card">
        <div className="filter-row">
          <div className="search-input">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          <div className="date-filters">
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="input-field"
              title="Start Date"
            />
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="input-field"
              title="End Date"
            />
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={clearFilters}
            title="Clear Filters"
          >
            <Filter size={18} />
            Clear
          </button>
        </div>
      </div>

      <div className="expenses-content">
        {loading ? (
          <div className="expenses-loading">
            <div className="loading-spinner"></div>
            <p>Loading expenses...</p>
          </div>
        ) : (
          <ExpenseList
            expenses={expenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
          />
        )}
      </div>

      <ExpenseForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingExpense(null);
        }}
        onExpenseAdded={handleExpenseAdded}
        editingExpense={editingExpense}
      />
    </div>
  );
};

export default Expenses;