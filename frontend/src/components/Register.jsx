// frontend/src/components/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Sun, Moon } from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

const Register = ({ onLogin, darkMode, toggleDarkMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const user = await authService.register(formData);
      toast.success('Welcome to ExpenseAI! 🎉');
      onLogin(user);
    } catch (error) {
      toast.error(error.error || 'Registration failed. Please try again.');
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
            <h2>Create Account</h2>
            <p>Start your smart expense tracking journey</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="first_name" className="input-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="John"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="last_name" className="input-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="username" className="input-label">
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                placeholder="johndoe"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">
                Password *
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Create a strong password"
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

            <div className="input-group">
              <label htmlFor="password_confirm" className="input-label">
                Confirm Password *
              </label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="password_confirm"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
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

export default Register;