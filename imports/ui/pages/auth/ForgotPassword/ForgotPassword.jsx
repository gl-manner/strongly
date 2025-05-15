// /imports/ui/pages/auth/ForgotPassword/ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMethod } from '/imports/hooks/useMethod';
import { useNotification } from '/imports/hooks/useNotification';
import feather from 'feather-icons';
import './ForgotPassword.scss';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { success, error } = useNotification();

  // Method hook for password reset
  const forgotPassword = useMethod('auth.forgotPassword');

  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, [submitted]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error('Please enter a valid email address');
      return;
    }

    try {
      await forgotPassword.call(email);

      // Show success message and mark as submitted
      success('Password reset instructions have been sent to your email');
      setSubmitted(true);
    } catch (err) {
      console.error('Password reset error:', err);
      error('Failed to send password reset email. Please try again later.');
    }
  };

  return (
    <div className="forgot-password-wrapper">
      <h2 className="brand-name">Strongly</h2>

      <h3 className="auth-title">Forgot Password</h3>
      <p className="auth-subtitle">
        Enter your email to receive password reset instructions
      </p>

      {submitted ? (
        <div className="password-reset-sent">
          <div className="sent-icon">
            <i data-feather="mail"></i>
          </div>
          <h3>Check Your Email</h3>
          <p>
            We've sent password reset instructions to <strong>{email}</strong>.
            Please check your inbox and spam folder.
          </p>
          <p className="expiry-notice">
            The password reset link will expire in 3 days.
          </p>
          <div className="action-buttons">
            <Link to="/login" className="btn-primary">
              Return to Login
            </Link>
            <button
              className="btn-link"
              onClick={() => setSubmitted(false)}
            >
              Try a different email
            </button>
          </div>
        </div>
      ) : (
        <form className="reset-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn-primary ${forgotPassword.loading ? 'loading' : ''}`}
            disabled={forgotPassword.loading}
          >
            {forgotPassword.loading ? (
              <>
                <i data-feather="loader" className="spinner"></i>
                Sending Instructions...
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          <div className="back-link">
            <Link to="/login" className="auth-link">
              <i data-feather="arrow-left" className="back-icon"></i> Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
