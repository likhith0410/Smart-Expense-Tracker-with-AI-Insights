// frontend/src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Login from './components/Login';
import Register from './components/Register';
import { authService } from './services/authService';
import { CurrencyProvider } from './services/currencyService';
import './styles/App.css';

// Prevent re-renders with memoized components
const LoadingSpinner = React.memo(() => (
  <div className="loading-screen">
    <div className="loading-spinner"></div>
    <p>Loading your expense tracker...</p>
  </div>
));

const AuthContainer = React.memo(({ darkMode, toggleDarkMode, onLogin }) => (
  <div className="auth-container">
    <Routes>
      <Route 
        path="/login" 
        element={
          <Login 
            onLogin={onLogin} 
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        } 
      />
      <Route 
        path="/register" 
        element={
          <Register 
            onLogin={onLogin}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        } 
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </div>
));

const MainApp = React.memo(({ user, darkMode, toggleDarkMode, onLogout }) => (
  <>
    <Navbar 
      user={user} 
      onLogout={onLogout}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    />
    <main className="main-content">
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/dashboard" element={<Home user={user} />} />
        <Route path="/expenses" element={<Expenses user={user} />} />
        <Route path="/reports" element={<Reports user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  </>
));

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Stable dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved !== null ? saved === 'true' : false;
    } catch {
      return false;
    }
  });

  // Stable handlers to prevent re-renders
  const handleLogin = useCallback((userData) => {
    console.log('User logged in:', userData);
    setUser(userData);
  }, []);

  const handleLogout = useCallback(() => {
    console.log('User logging out...');
    try {
      authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newMode = !prev;
      try {
        localStorage.setItem('darkMode', newMode.toString());
      } catch (error) {
        console.error('Failed to save dark mode preference:', error);
      }
      return newMode;
    });
  }, []);

  // One-time authentication check
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          if (isMounted) {
            setLoading(false);
            setAuthChecked(true);
          }
          return;
        }

        const userData = await authService.getProfile();
        
        if (isMounted) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        try {
          localStorage.removeItem('token');
        } catch (storageError) {
          console.error('Failed to remove token:', storageError);
        }
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setAuthChecked(true);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Apply dark mode to DOM only when needed
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } catch (error) {
      console.error('Failed to apply dark mode:', error);
    }
  }, [darkMode]);

  // Memoized toast options
  const toastOptions = useMemo(() => ({
    duration: 4000,
    style: {
      background: darkMode ? '#1f2937' : '#ffffff',
      color: darkMode ? '#ffffff' : '#000000',
      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    },
  }), [darkMode]);

  // Show loading while checking auth
  if (!authChecked || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <Toaster 
        position="top-right"
        toastOptions={toastOptions}
      />
      
      {user ? (
        <MainApp 
          user={user}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
        />
      ) : (
        <AuthContainer 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}

// Main wrapper with error boundary
function App() {
  return (
    <CurrencyProvider>
      <Router>
        <AppContent />
      </Router>
    </CurrencyProvider>
  );
}

export default App;