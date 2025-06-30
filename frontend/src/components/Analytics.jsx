// frontend/src/components/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';
import { expenseService } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const Analytics = ({ user }) => {
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [insightsData, recommendationsData] = await Promise.all([
        expenseService.getAIInsights(),
        expenseService.getBudgetRecommendations()
      ]);

      setInsights(insightsData.insights || []);
      setRecommendations(recommendationsData.recommendations || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your spending patterns...</p>
      </div>
    );
  }

  return (
    <div className="analytics-section">
      <div className="analytics-grid">
        {/* AI Insights */}
        <div className="analytics-card glass-card">
          <div className="card-header">
            <h3>
              <TrendingUp size={20} />
              AI Insights
            </h3>
          </div>
          <div className="insights-list">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div key={index} className={`insight-item ${insight.type}`}>
                  <div className="insight-content">
                    <h4>{insight.title}</h4>
                    <p>{insight.message}</p>
                  </div>
                  {insight.value && (
                    <div className="insight-value">
                      {typeof insight.value === 'number' && insight.value > 100 
                        ? formatCurrency(insight.value)
                        : `${insight.value}%`
                      }
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No insights available yet. Add more expenses to see AI-powered analysis!</p>
              </div>
            )}
          </div>
        </div>

        {/* Budget Recommendations */}
        <div className="analytics-card glass-card">
          <div className="card-header">
            <h3>
              <Target size={20} />
              Budget Recommendations
            </h3>
          </div>
          <div className="recommendations-list">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <div className="rec-header">
                    <span className="rec-category">{rec.category}</span>
                    <span className={`rec-confidence ${rec.confidence}`}>
                      {rec.confidence} confidence
                    </span>
                  </div>
                  <div className="rec-amount">
                    {formatCurrency(rec.recommended_amount)}
                  </div>
                  <div className="rec-reason">
                    {rec.reason}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No recommendations available. Start tracking expenses to get AI-powered budget suggestions!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="analytics-card glass-card">
          <div className="card-header">
            <h3>
              <DollarSign size={20} />
              Quick Stats
            </h3>
          </div>
          <div className="quick-stats">
            <div className="stat-item">
              <div className="stat-icon">
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-label">This Month</span>
                <span className="stat-value">View detailed breakdown</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <Target size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Budget Status</span>
                <span className="stat-value">Track your progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;