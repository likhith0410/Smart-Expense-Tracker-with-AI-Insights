// frontend/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Target,
  AlertTriangle,
  Lightbulb,
  Calendar
} from 'lucide-react';
import ExpenseChart from './ExpenseChart';
import { expenseService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import '../styles/Dashboard.css';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, recentData, alertsData, insightsData] = await Promise.all([
        expenseService.getStats(),
        expenseService.getRecentExpenses(),
        expenseService.getBudgetAlerts(),
        expenseService.getAIInsights()
      ]);

      setStats(statsData);
      setRecentExpenses(recentData);
      setBudgetAlerts(alertsData);
      setInsights(insightsData.insights || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your financial insights...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Welcome back, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Here's your financial overview for {formatDate(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <div className="dashboard-date">
          <Calendar size={20} />
          <span>{formatDate(new Date(), 'EEEE, MMMM d, yyyy')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total-expenses">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Expenses</h3>
            <p className="stat-value">{formatCurrency(stats?.total_expenses || 0)}</p>
            <span className="stat-change positive">
              <TrendingUp size={16} />
              This month
            </span>
          </div>
        </div>

        <div className="stat-card total-transactions">
          <div className="stat-icon">
            <CreditCard size={24} />
          </div>
          <div className="stat-content">
            <h3>Transactions</h3>
            <p className="stat-value">{stats?.total_transactions || 0}</p>
            <span className="stat-change">
              Total recorded
            </span>
          </div>
        </div>

        <div className="stat-card avg-transaction">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h3>Avg Transaction</h3>
            <p className="stat-value">{formatCurrency(stats?.avg_transaction || 0)}</p>
            <span className="stat-change">
              Per expense
            </span>
          </div>
        </div>

        <div className="stat-card top-category">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Top Category</h3>
            <p className="stat-value">{stats?.top_category || 'None'}</p>
            <span className="stat-change">
              Most spent
            </span>
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="alert-section">
          <h2 className="section-title">
            <AlertTriangle size={20} />
            Budget Alerts
          </h2>
          <div className="alerts-grid">
            {budgetAlerts.map((alert) => (
              <div key={alert.id} className={`alert-card ${alert.type}`}>
                <div className="alert-header">
                  <AlertTriangle size={18} />
                  <span className="alert-category">{alert.category}</span>
                </div>
                <p className="alert-message">{alert.message}</p>
                <div className="alert-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${Math.min(alert.spent / alert.budget * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {formatCurrency(alert.spent)} / {formatCurrency(alert.budget)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {/* Expense Chart */}
        <div className="chart-section">
          <div className="glass-card">
            <div className="card-header">
              <h2 className="section-title">Spending Trends</h2>
            </div>
            <ExpenseChart data={stats?.monthly_trend || []} />
          </div>
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="insights-section">
            <div className="glass-card">
              <div className="card-header">
                <h2 className="section-title">
                  <Lightbulb size={20} />
                  AI Insights
                </h2>
              </div>
              <div className="insights-list">
                {insights.map((insight, index) => (
                  <div key={index} className={`insight-card ${insight.type}`}>
                    <div className="insight-icon">
                      {insight.type === 'warning' && <AlertTriangle size={18} />}
                      {insight.type === 'success' && <TrendingUp size={18} />}
                      {insight.type === 'info' && <Lightbulb size={18} />}
                      {insight.type === 'tip' && <Target size={18} />}
                    </div>
                    <div className="insight-content">
                      <h4>{insight.title}</h4>
                      <p>{insight.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="recent-section">
          <div className="glass-card">
            <div className="card-header">
              <h2 className="section-title">Recent Transactions</h2>
            </div>
            <div className="recent-list">
              {recentExpenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="recent-item">
                  <div className="recent-icon" style={{ color: expense.category_color }}>
                    {expense.category_icon}
                  </div>
                  <div className="recent-content">
                    <h4>{expense.title}</h4>
                    <p>{expense.category_name}</p>
                  </div>
                  <div className="recent-amount">
                    <span className="amount">{formatCurrency(expense.amount)}</span>
                    <span className="date">{formatDate(expense.date, 'MMM d')}</span>
                  </div>
                </div>
              ))}
              {recentExpenses.length === 0 && (
                <div className="empty-state">
                  <p>No recent transactions found. Start tracking your expenses!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;