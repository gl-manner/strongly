// /imports/ui/pages/auth/ResetPassword/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMethod } from '/imports/ui/hooks/useMethod';
import { useNotification } from '/imports/ui/hooks/useNotification';
import feather from 'feather-icons';
import './ResetPassword.scss';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();

  // Method hook for password reset
  const resetPassword = useMethod('auth.resetPassword');

  // Initialize feather icons when component mounts or when success state changes
  useEffect(() => {
    feather.replace();
  }, [success]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await resetPassword.call(token, password);

      // Show success message
      notify.success('Your password has been successfully reset');
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.reason || 'Failed to reset password. The token may be invalid or expired.');
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;

    // Calculate score based on different criteria
    let score = 0;

    // Length check
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 10;

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 15; // Uppercase
    if (/[a-z]/.test(password)) score += 15; // Lowercase
    if (/[0-9]/.test(password)) score += 15; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 20; // Special characters

    return Math.min(100, score);
  };

  const getPasswordStrengthClass = (password) => {
    const score = calculatePasswordStrength(password);

    if (score >= 80) return 'very-strong';
    if (score >= 60) return 'strong';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'weak';
    return 'very-weak';
  };

  const getPasswordStrengthText = (password) => {
    const score = calculatePasswordStrength(password);

    if (score >= 80) return 'Very Strong';
    if (score >= 60) return 'Strong';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Weak';
    if (score > 0) return 'Very Weak';
    return 'Enter a password';
  };

  return (
    <div className="reset-password-wrapper">
      <h2 className="brand-name">Strongly</h2>

      <h3 className="page-title">Reset Password</h3>
      <p className="page-subtitle">
        Create a new password for your account
      </p>

      {success ? (
        <div className="success-container">
          <div className="success-icon">
            <i data-feather="check-circle"></i>
          </div>
          <h3 className="success-title">Password Reset Successful</h3>
          <p className="success-message">
            Your password has been reset successfully. You will be redirected to the login page shortly.
          </p>
          <Link to="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      ) : (
        <form className="reset-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="8"
            />
            <div className="form-hint">
              Password must be at least 8 characters long.
            </div>
          </div>

          <div className="password-strength">
            <div className="strength-label">Password Strength:</div>
            <div className="strength-meter">
              <div
                className={`strength-value ${getPasswordStrengthClass(password)}`}
                style={{ width: `${calculatePasswordStrength(password)}%` }}
              ></div>
            </div>
            <div className="strength-text">
              {getPasswordStrengthText(password)}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn-primary btn-reset ${resetPassword.loading ? 'loading' : ''}`}
            disabled={resetPassword.loading}
          >
            {resetPassword.loading ? (
              <>
                <span className="spinner"></span>
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          <div className="back-link">
            <Link to="/login" className="auth-link">
              <i data-feather="arrow-left"></i> Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
