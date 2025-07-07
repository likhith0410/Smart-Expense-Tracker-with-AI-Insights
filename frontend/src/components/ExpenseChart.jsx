// frontend/src/components/ExpenseChart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ExpenseChart = ({ data, type = 'line' }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
        bodyColor: isDarkMode ? '#f1f5f9' : '#1e293b',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => `₹${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDarkMode ? '#94a3b8' : '#64748b',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: isDarkMode ? '#374151' : '#e2e8f0',
          drawBorder: false,
        },
        ticks: {
          color: isDarkMode ? '#94a3b8' : '#64748b',
          font: {
            size: 12,
          },
          callback: (value) => `₹${value.toLocaleString()}`,
        },
      },
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8,
        backgroundColor: '#6366f1',
        borderColor: '#ffffff',
        borderWidth: 2,
      },
      line: {
        borderWidth: 3,
        tension: 0.4,
      },
    },
  };

  const lineChartData = {
    labels: data?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Monthly Spending',
        data: data?.map(item => item.amount) || [],
        borderColor: '#6366f1',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.05)');
          return gradient;
        },
        fill: true,
      },
    ],
  };

  if (type === 'line') {
    return (
      <div style={{ height: '350px', padding: '1rem' }}>
        <Line data={lineChartData} options={lineChartOptions} />
      </div>
    );
  }

  // Doughnut chart for category breakdown
  const doughnutData = {
    labels: data?.map(item => item.category__name) || [],
    datasets: [
      {
        data: data?.map(item => item.total) || [],
        backgroundColor: [
          '#6366f1',
          '#8b5cf6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#06b6d4',
          '#84cc16',
          '#f97316',
        ],
        borderColor: isDarkMode ? '#1e293b' : '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? '#f1f5f9' : '#1e293b',
          padding: 20,
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
        bodyColor: isDarkMode ? '#f1f5f9' : '#1e293b',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 12,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '65%',
  };

  return (
    <div style={{ height: '350px', padding: '1rem' }}>
      <Doughnut data={doughnutData} options={doughnutOptions} />
    </div>
  );
};

export default ExpenseChart;