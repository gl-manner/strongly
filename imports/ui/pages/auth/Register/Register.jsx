// /imports/ui/pages/auth/Register/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import './Register.scss';

/**
 * Register page component with clean, modern styling
 */
export const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    // Reset errors
    setError('');

    // Validate name
    if (!name.trim()) {
      setError('Please enter your name.');
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    // Validate password
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    // Validate terms acceptance
    if (!acceptTerms) {
      setError('You must accept the terms and conditions.');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Create user
    Accounts.createUser({
      email,
      password,
      profile: {
        name,
        active: false // Accounts need admin approval
      }
    }, (err) => {
      setLoading(false);

      if (err) {
        setError(err.reason || 'Registration failed. Please try again.');
      } else {
        setSuccess('Registration successful! Your account is pending admin approval.');
        // Redirect to a "pending approval" page
        setTimeout(() => {
          navigate('/pending-approval');
        }, 3000);
      }
    });
  };

  return (
    <div className="register-wrapper">
      <h2 className="brand-name">Strongly</h2>

      <h3 className="form-title">Create an Account</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="registerName">Full Name</label>
          <input
            type="text"
            id="registerName"
            className="form-control"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="registerEmail">Email address</label>
          <input
            type="email"
            id="registerEmail"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="registerPassword">Password</label>
          <input
            type="password"
            id="registerPassword"
            className="form-control"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="hint-text">Password must be at least 8 characters long</div>
        </div>

        <div className="form-group">
          <label htmlFor="registerConfirmPassword">Confirm Password</label>
          <input
            type="password"
            id="registerConfirmPassword"
            className="form-control"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="terms-checkbox">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            required
          />
          <label htmlFor="acceptTerms">
            I agree to the <a href="/terms" className="terms-link">Terms and Conditions</a>
          </label>
        </div>

        <button
          type="submit"
          className="btn-register"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Creating account...
            </>
          ) : 'Create Account'}
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="login-link">
          <p>Already have an account?</p>
          <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
