// frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon
} from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = ({ user, onLogout, darkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/expenses', icon: CreditCard, label: 'Expenses' },
    { path: '/reports', icon: BarChart3, label: 'Analytics' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`navbar ${isOpen ? 'open' : ''}`}>
        <div className="navbar-header">
          <div className="logo">
            <div className="logo-icon">💰</div>
            <span className="logo-text">ExpenseAI</span>
          </div>
          <button 
            className="menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="nav-footer">
          <div className="theme-toggle-container">
            <button 
              className={`theme-toggle ${darkMode ? 'dark' : ''}`}
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>

          <div className="user-profile">
            <div className="user-avatar">
              {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div className="user-info">
              <p className="user-name">
                {user?.first_name || user?.username || 'User'}
              </p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>

          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {isOpen && <div className="navbar-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Navbar;