// frontend/src/components/ExpenseList.jsx
import React from 'react';
import { Edit2, Trash2, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';
import '../styles/ExpenseList.css';

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="expense-list glass-card">
        <div className="empty-state">
          <div className="empty-icon">💸</div>
          <h3>No expenses found</h3>
          <p>Start tracking your expenses by adding your first transaction!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-list">
      <div className="expense-list-header">
        <h2>Recent Expenses</h2>
        <span className="expense-count">{expenses.length} expenses</span>
      </div>

      <div className="expense-grid">
        {expenses.map((expense) => (
          <div key={expense.id} className="expense-item glass-card">
            <div className="expense-header">
              <div className="expense-category">
                <span 
                  className="category-icon" 
                  style={{ color: expense.category_color }}
                >
                  {expense.category_icon}
                </span>
                <div className="expense-info">
                  <h4 className="expense-title">{expense.title}</h4>
                  <span className="expense-category-name">
                    {expense.category_name}
                  </span>
                </div>
              </div>
              
              <div className="expense-actions">
                <button 
                  className="action-btn edit-btn"
                  onClick={() => onEdit(expense)}
                  title="Edit expense"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => onDelete(expense.id)}
                  title="Delete expense"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="expense-details">
              <div className="expense-amount">
                {formatCurrency(expense.amount)}
              </div>
              
              <div className="expense-meta">
                <div className="expense-date">
                  <Calendar size={14} />
                  {formatDate(expense.date, 'MMM d, yyyy')}
                </div>
                
                <div className="expense-payment">
                  {getPaymentMethodIcon(expense.payment_method)}
                  {formatPaymentMethod(expense.payment_method)}
                </div>
              </div>

              {expense.description && (
                <div className="expense-description">
                  {expense.description}
                </div>
              )}

              {expense.is_ai_categorized && (
                <div className="ai-badge">
                  🤖 AI Categorized
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getPaymentMethodIcon = (method) => {
  const icons = {
    cash: '💵',
    card: '💳',
    upi: '📱',
    bank_transfer: '🏦',
    other: '🔄'
  };
  return icons[method] || '💰';
};

const formatPaymentMethod = (method) => {
  const methods = {
    cash: 'Cash',
    card: 'Card',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    other: 'Other'
  };
  return methods[method] || method;
};

export default ExpenseList;