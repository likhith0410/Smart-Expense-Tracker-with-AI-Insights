import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enhanced PWA Support
class PWAManager {
  constructor() {
    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.handleNetworkChanges();
    this.handleAppUpdates();
    this.setupOfflineStorage();
  }

  // Service Worker Registration with Update Handling
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('PWA: Service Worker registered successfully');

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailable();
            }
          });
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event);
        });

      } catch (error) {
        console.error('PWA: Service Worker registration failed:', error);
      }
    }
  }

  // Show update notification
  showUpdateAvailable() {
    const updateNotification = document.createElement('div');
    updateNotification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #3b82f6;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 16px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: slideDown 0.3s ease-out;
      " id="update-notification">
        <span style="font-size: 20px;">🚀</span>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">New Version Available!</div>
          <div style="font-size: 14px; opacity: 0.9;">Click to update and get the latest features</div>
        </div>
        <button onclick="window.pwaManager.updateApp()" style="
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        ">Update</button>
        <button onclick="this.parentElement.remove()" style="
          background: transparent;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
        ">×</button>
      </div>
      <style>
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(updateNotification);
  }

  // Update the app
  updateApp() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  // Handle network status changes
  handleNetworkChanges() {
    const showNetworkStatus = (isOnline) => {
      const existingStatus = document.getElementById('network-status');
      if (existingStatus) existingStatus.remove();

      const statusDiv = document.createElement('div');
      statusDiv.id = 'network-status';
      statusDiv.innerHTML = `
        <div style="
          position: fixed;
          bottom: 20px;
          left: 20px;
          background: ${isOnline ? '#10b981' : '#ef4444'};
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          z-index: 10002;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          animation: slideUp 0.3s ease-out;
        ">
          <span>${isOnline ? '🌐' : '📡'}</span>
          ${isOnline ? 'Back Online' : 'You\'re Offline'}
        </div>
        <style>
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        </style>
      `;
      
      document.body.appendChild(statusDiv);
      
      // Auto-hide after 3 seconds if online
      if (isOnline) {
        setTimeout(() => {
          if (statusDiv.parentNode) {
            statusDiv.style.opacity = '0';
            setTimeout(() => statusDiv.remove(), 300);
          }
        }, 3000);
      }
    };

    window.addEventListener('online', () => {
      showNetworkStatus(true);
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      showNetworkStatus(false);
    });
  }

  // Handle service worker messages
  handleServiceWorkerMessage(event) {
    const { data } = event;
    
    switch (data.type) {
      case 'CACHE_UPDATED':
        console.log('PWA: Cache updated with new data');
        break;
      case 'BACKGROUND_SYNC':
        console.log('PWA: Background sync completed');
        this.showSyncNotification();
        break;
      case 'OFFLINE_READY':
        console.log('PWA: App is ready for offline use');
        break;
    }
  }

  // Show sync notification
  showSyncNotification() {
    const syncNotification = document.createElement('div');
    syncNotification.innerHTML = `
      <div style="
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10002;
        display: flex;
        align-items: center;
        gap: 8px;
        backdrop-filter: blur(10px);
        animation: slideIn 0.3s ease-out;
      ">
        <span>✅</span>
        Offline data synced successfully
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(syncNotification);
    
    setTimeout(() => {
      syncNotification.style.opacity = '0';
      setTimeout(() => syncNotification.remove(), 300);
    }, 3000);
  }

  // Setup offline storage
  setupOfflineStorage() {
    // Initialize IndexedDB for offline data storage
    if ('indexedDB' in window) {
      this.initIndexedDB();
    }
  }

  // Initialize IndexedDB
  async initIndexedDB() {
    try {
      const db = await this.openDB('ExpenseTrackerDB', 1);
      console.log('PWA: IndexedDB initialized successfully');
      window.offlineDB = db;
    } catch (error) {
      console.error('PWA: Failed to initialize IndexedDB:', error);
    }
  }

  // Open IndexedDB
  openDB(name, version) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create expenses store
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          expenseStore.createIndex('date', 'date');
          expenseStore.createIndex('category', 'category');
          expenseStore.createIndex('synced', 'synced');
        }
        
        // Create categories store
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { 
            keyPath: 'id' 
          });
        }
      };
    });
  }

  // Sync offline data when back online
  async syncOfflineData() {
    try {
      if (window.offlineDB) {
        const transaction = window.offlineDB.transaction(['expenses'], 'readonly');
        const store = transaction.objectStore('expenses');
        const index = store.index('synced');
        const unsyncedExpenses = await this.getAllFromIndex(index, false);
        
        if (unsyncedExpenses.length > 0) {
          console.log(`PWA: Syncing ${unsyncedExpenses.length} offline expenses...`);
          
          // Send message to service worker to handle sync
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SYNC_OFFLINE_DATA',
              data: unsyncedExpenses
            });
          }
        }
      }
    } catch (error) {
      console.error('PWA: Failed to sync offline data:', error);
    }
  }

  // Get all records from IndexedDB index
  getAllFromIndex(index, query) {
    return new Promise((resolve, reject) => {
      const request = index.getAll(query);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Handle app updates
  handleAppUpdates() {
    // Check for app updates periodically
    setInterval(() => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
      }
    }, 30000); // Check every 30 seconds
  }
}

// Initialize PWA Manager
window.pwaManager = new PWAManager();

// Enhanced Web Vitals reporting with PWA metrics
function reportPWAVitals(metric) {
  // You can send PWA performance metrics to your analytics
  console.log('PWA Metric:', metric);
}

// Report web vitals
reportWebVitals(reportPWAVitals);

// PWA Install Detection
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: Install prompt triggered');
  // The prompt is handled in index.html
});

window.addEventListener('appinstalled', (evt) => {
  console.log('PWA: App installed successfully');
  // Track installation
  if (window.gtag) {
    window.gtag('event', 'pwa_install', {
      event_category: 'engagement',
      event_label: 'PWA Installation'
    });
  }
});

// Performance optimization
window.addEventListener('load', () => {
  // Preload critical routes
  const criticalRoutes = ['/dashboard', '/expenses', '/reports'];
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      criticalRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    });
  }
});

console.log('🚀 Smart Expense Tracker PWA initialized successfully!');