// frontend/src/pages/Reports.jsx - UPDATED with Budget Management
import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, FileText, Calendar, Settings, Target } from 'lucide-react';
import Analytics from '../components/Analytics';
import ExpenseChart from '../components/ExpenseChart';
import CurrencySelector from '../components/CurrencySelector';
import BudgetManagement from '../components/BudgetManagement';
import { expenseService } from '../services/api';
import { exportService } from '../services/exportService';
import { currencyService } from '../services/currencyService';
import toast from 'react-hot-toast';

const Reports = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showBudgetManagement, setShowBudgetManagement] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, expensesData, insightsData] = await Promise.all([
        expenseService.getStats(),
        expenseService.getExpenses({ limit: 100 }),
        expenseService.getAIInsights()
      ]);

      setStats(statsData);
      setExpenses(expensesData.results || expensesData);
      setInsights(insightsData.insights || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    setShowExportMenu(false);
    
    switch (format) {
      case 'csv':
        exportService.exportToCSV(expenses, 'expense_report');
        toast.success('CSV report downloaded! 📄');
        break;
      case 'excel':
        exportService.exportToExcel(expenses, stats, 'expense_report');
        toast.success('Excel report downloaded! 📊');
        break;
      case 'pdf':
        exportService.generatePDFReport(expenses, stats, insights);
        toast.success('PDF report generated! 📋');
        break;
      case 'chart':
        exportService.exportChartAsPNG(chartRef, 'expense_chart');
        toast.success('Chart exported! 📈');
        break;
      default:
        toast.error('Export format not supported');
    }
  };

  const handleViewBreakdown = () => {
    // Navigate to detailed monthly breakdown
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Filter expenses for current month
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });

    // Show detailed breakdown modal or navigate to detailed page
    showMonthlyBreakdown(monthlyExpenses);
  };

  const handleTrackProgress = () => {
    // Open Budget Management instead of just showing toast
    setShowBudgetManagement(true);
  };

  const showMonthlyBreakdown = (monthlyExpenses) => {
    const breakdown = monthlyExpenses.reduce((acc, expense) => {
      const category = expense.category_name;
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0, expenses: [] };
      }
      acc[category].total += parseFloat(expense.amount);
      acc[category].count += 1;
      acc[category].expenses.push(expense);
      return acc;
    }, {});

    // Create breakdown content
    const breakdownContent = Object.entries(breakdown)
      .sort(([,a], [,b]) => b.total - a.total)
      .map(([category, data]) => `
        <div style="margin: 10px 0; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <strong>${category}</strong><br>
          Amount: ${currencyService.formatAmount(data.total)}<br>
          Transactions: ${data.count}
        </div>
      `).join('');

    const content = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Monthly Breakdown - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        ${breakdownContent}
      </div>
    `;

    const popup = window.open('', '_blank', 'width=600,height=500,scrollbars=yes');
    popup.document.write(content);
    popup.document.close();
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>Financial Reports & Analytics</h1>
          <p>Detailed insights into your spending patterns</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCurrencySelector(!showCurrencySelector)}
          >
            <Settings size={16} />
            Currency
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => setShowBudgetManagement(true)}
          >
            <Target size={16} />
            Budgets
          </button>
          
          <div className="export-dropdown">
            <button 
              className="btn btn-primary"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download size={16} />
              Export Report
            </button>
            
            {showExportMenu && (
              <div className="dropdown-menu">
                <button onClick={() => handleExport('csv')}>
                  <FileText size={16} />
                  Export as CSV
                </button>
                <button onClick={() => handleExport('excel')}>
                  <BarChart3 size={16} />
                  Export as Excel
                </button>
                <button onClick={() => handleExport('pdf')}>
                  <FileText size={16} />
                  Generate PDF Report
                </button>
                <button onClick={() => handleExport('chart')}>
                  <PieChart size={16} />
                  Export Chart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCurrencySelector && (
        <CurrencySelector onClose={() => setShowCurrencySelector(false)} />
      )}

      {showBudgetManagement && (
        <BudgetManagement 
          user={user}
          isOpen={showBudgetManagement}
          onClose={() => setShowBudgetManagement(false)}
        />
      )}

      <div className="reports-content">
        <div className="chart-controls">
          <div className="chart-type-selector">
            <button 
              className={`btn ${chartType === 'line' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChartType('line')}
            >
              <TrendingUp size={16} />
              Trends
            </button>
            <button 
              className={`btn ${chartType === 'doughnut' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChartType('doughnut')}
            >
              <PieChart size={16} />
              Categories
            </button>
          </div>
        </div>

        <div className="main-chart glass-card">
          <h2>
            <BarChart3 size={20} />
            {chartType === 'line' ? 'Spending Trends' : 'Category Breakdown'}
          </h2>
          <ExpenseChart 
            ref={chartRef}
            data={chartType === 'line' ? stats?.monthly_trend : stats?.category_breakdown} 
            type={chartType}
          />
        </div>

        {/* Enhanced Analytics with clickable actions */}
        <div className="analytics-section">
          <div className="analytics-grid">
            <div className="analytics-card glass-card clickable" onClick={handleViewBreakdown}>
              <div className="card-header">
                <h3>
                  <Calendar size={20} />
                  This Month
                </h3>
              </div>
              <div className="card-content">
                <p className="card-description">View detailed breakdown</p>
                <div className="card-value">
                  {currencyService.formatAmount(stats?.total_expenses || 0)}
                </div>
                <span className="click-hint">Click to view details →</span>
              </div>
            </div>

            <div className="analytics-card glass-card clickable" onClick={handleTrackProgress}>
              <div className="card-header">
                <h3>
                  <Target size={20} />
                  Budget Status
                </h3>
              </div>
              <div className="card-content">
                <p className="card-description">Track your progress</p>
                <div className="card-value">
                  {stats?.total_transactions || 0} transactions
                </div>
                <span className="click-hint">Click to manage budgets →</span>
              </div>
            </div>
          </div>
        </div>

        <Analytics user={user} />
      </div>
    </div>
  );
};

export default Reports;