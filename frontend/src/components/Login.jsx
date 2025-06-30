// frontend/src/components/Login.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Sun, Moon } from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

const Login = ({ onLogin, darkMode, toggleDarkMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.login(formData);
      toast.success('Welcome back! 🎉');
      onLogin(user);
    } catch (error) {
      toast.error(error.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="theme-toggle-top">
        <button 
          className={`theme-toggle ${darkMode ? 'dark' : ''}`}
          onClick={toggleDarkMode}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>

      <div className="auth-container">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">💰</div>
              <h1 className="gradient-text">ExpenseAI</h1>
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to continue managing your expenses</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="username" className="input-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-features">
          <div className="feature-card glass-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Insights</h3>
            <p>Get intelligent spending analysis and personalized recommendations</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">📱</div>
            <h3>Receipt Scanning</h3>
            <p>Automatically extract expense data from receipt photos using OCR</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">📊</div>
            <h3>Smart Analytics</h3>
            <p>Visualize your spending patterns with interactive charts and reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;