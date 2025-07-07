// Smart Expense Tracker - Service Worker
// Version 1.0.0

const CACHE_NAME = 'expense-tracker-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html',
  // Add your key routes
  '/dashboard',
  '/expenses',
  '/reports'
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/expenses/categories/',
  '/api/auth/profile/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('Service Worker: Caching static assets');
        await cache.addAll(STATIC_CACHE_URLS);
        console.log('Service Worker: Static assets cached successfully');
      } catch (error) {
        console.error('Service Worker: Failed to cache static assets', error);
      }
    })()
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          })
      );
      
      // Take control of all clients
      await clients.claim();
      console.log('Service Worker: Activated successfully');
    })()
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests
    if (request.method === 'GET' && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for API request');
    
    // If network fails, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'You are currently offline. Some features may not be available.',
        cached: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Handle navigation requests with cache-first for app shell
async function handleNavigationRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the response
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Service Worker: Network failed for navigation request');
  }
  
  // Try cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return cached index.html for SPA routing
  const indexResponse = await cache.match('/');
  if (indexResponse) {
    return indexResponse;
  }
  
  // Fallback to offline page
  return cache.match(OFFLINE_URL) || new Response('Offline', { status: 503 });
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the response
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch static resource', request.url);
    return new Response('Resource not available offline', { status: 503 });
  }
}

// Handle background sync for offline expense creation
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'expense-sync') {
    event.waitUntil(syncOfflineExpenses());
  }
});

// Sync offline expenses when connection is restored
async function syncOfflineExpenses() {
  console.log('Service Worker: Syncing offline expenses...');
  
  try {
    // Get offline expenses from IndexedDB (you'll implement this)
    const offlineExpenses = await getOfflineExpenses();
    
    for (const expense of offlineExpenses) {
      try {
        const response = await fetch('/api/expenses/expenses/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${expense.token}`
          },
          body: JSON.stringify(expense.data)
        });
        
        if (response.ok) {
          // Remove from offline storage
          await removeOfflineExpense(expense.id);
          console.log('Service Worker: Synced offline expense', expense.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync expense', expense.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Placeholder functions for offline storage (implement with IndexedDB)
async function getOfflineExpenses() {
  // Implement IndexedDB logic to get offline expenses
  return [];
}

async function removeOfflineExpense(id) {
  // Implement IndexedDB logic to remove synced expense
  console.log('Service Worker: Removing offline expense', id);
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New expense notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/logo192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Smart Expense Tracker', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_EXPENSE') {
    // Cache expense data for offline use
    cacheExpenseData(event.data.expense);
  }
});

// Cache expense data
async function cacheExpenseData(expense) {
  try {
    // Store in IndexedDB for offline access
    console.log('Service Worker: Caching expense data', expense);
    // Implement IndexedDB storage logic here
  } catch (error) {
    console.error('Service Worker: Failed to cache expense data', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered', event.tag);
  
  if (event.tag === 'expense-backup') {
    event.waitUntil(performPeriodicSync());
  }
});

async function performPeriodicSync() {
  console.log('Service Worker: Performing periodic sync...');
  // Implement periodic data sync logic
}