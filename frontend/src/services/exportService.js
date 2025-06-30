// frontend/src/services/exportService.js
import { currencyService } from './currencyService';

const formatDate = (date, format = 'yyyy-MM-dd') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  if (format === 'yyyy-MM-dd') return `${year}-${month}-${day}`;
  if (format === 'dd/MM/yyyy') return `${day}/${month}/${year}`;
  if (format === 'MMMM d, yyyy') {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    return `${monthNames[d.getMonth()]} ${d.getDate()}, ${year}`;
  }
  return d.toLocaleDateString();
};

export const exportService = {
  // Export expenses to CSV
  exportToCSV: (expenses, filename = 'expenses') => {
    const headers = ['Date', 'Title', 'Category', 'Amount', 'Payment Method', 'Description'];
    
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        formatDate(expense.date, 'yyyy-MM-dd'),
        `"${expense.title}"`,
        `"${expense.category_name}"`,
        expense.amount,
        expense.payment_method,
        `"${expense.description || ''}"`
      ].join(','))
    ].join('\n');

    downloadFile(csvContent, `${filename}_${formatDate(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
  },

  // Export expenses to Excel format
  exportToExcel: (expenses, stats, filename = 'expense_report') => {
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .summary { background-color: #e8f4fd; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="title">Expense Report - ${formatDate(new Date(), 'MMMM d, yyyy')}</div>
          
          <table>
            <tr class="summary">
              <th>Total Expenses</th>
              <td>${currencyService.formatAmount(stats?.total_expenses || 0)}</td>
              <th>Total Transactions</th>
              <td>${stats?.total_transactions || 0}</td>
            </tr>
          </table>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map(expense => `
                <tr>
                  <td>${formatDate(expense.date, 'dd/MM/yyyy')}</td>
                  <td>${expense.title}</td>
                  <td>${expense.category_name}</td>
                  <td>${currencyService.formatAmount(expense.amount)}</td>
                  <td>${expense.payment_method}</td>
                  <td>${expense.description || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    downloadFile(htmlContent, `${filename}_${formatDate(new Date(), 'yyyy-MM-dd')}.xls`, 'application/vnd.ms-excel');
  },

  // Export chart as image
  exportChartAsPNG: (chartRef, filename = 'chart') => {
    if (chartRef && chartRef.current) {
      const canvas = chartRef.current.canvas;
      const url = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `${filename}_${formatDate(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = url;
      link.click();
    }
  },

  // Generate PDF report
  generatePDFReport: (expenses, stats, insights) => {
    const reportContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #6366f1;">Smart Expense Tracker Report</h1>
        <p><strong>Generated on:</strong> ${formatDate(new Date(), 'MMMM d, yyyy')}</p>
        
        <h2>Summary</h2>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <p><strong>Total Expenses:</strong> ${currencyService.formatAmount(stats?.total_expenses || 0)}</p>
          <p><strong>Total Transactions:</strong> ${stats?.total_transactions || 0}</p>
          <p><strong>Average Transaction:</strong> ${currencyService.formatAmount(stats?.avg_transaction || 0)}</p>
          <p><strong>Top Category:</strong> ${stats?.top_category || 'None'}</p>
        </div>

        <h2>AI Insights</h2>
        ${insights && insights.length > 0 ? insights.map(insight => `
          <div style="margin: 10px 0; padding: 10px; border-left: 4px solid #6366f1;">
            <strong>${insight.title}</strong><br>
            ${insight.message}
          </div>
        `).join('') : '<p>No insights available</p>'}

        <h2>Recent Transactions</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Title</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Category</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.slice(0, 10).map(expense => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(expense.date, 'dd/MM/yyyy')}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${expense.title}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${expense.category_name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${currencyService.formatAmount(expense.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();
  }
};

// Helper function to download files
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};