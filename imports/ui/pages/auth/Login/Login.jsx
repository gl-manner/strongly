// /imports/ui/pages/auth/Login/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import Spinner from '/imports/ui/components/common/Spinner/Spinner';
import './Login.scss';

/**
 * Login page component with minimalist design
 */
export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check for stored error on component mount
  useEffect(() => {
    const storedError = sessionStorage.getItem('loginError');
    if (storedError) {
      setError(storedError);
      sessionStorage.removeItem('loginError');
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic form validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    // Clear error and set loading state
    setError('');
    setIsLoggingIn(true);

    // Attempt login
    Meteor.loginWithPassword(email, password, (err) => {
      setIsLoggingIn(false);

      if (err) {
        console.log('Login error:', err);

        // Set error state directly
        setError('Invalid email or password. Please try again.');

        // Also store in session in case of re-render
        sessionStorage.setItem('loginError', 'Invalid email or password. Please try again.');
      }
    });
  };

  return (
    <div className="login-wrapper">
      <h2 className="brand-name">Strongly</h2>

      {/* Only render error alert if there is an error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
          <Link to="/forgot-password" className="forgot-password">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="btn-login"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <Spinner size="small" color="light" text="Logging in..." />
          ) : 'Login'}
        </button>

        <div className="register-link">
          <p>
            Not a user? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
