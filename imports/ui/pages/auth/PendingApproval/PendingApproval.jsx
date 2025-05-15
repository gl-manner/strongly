// /imports/ui/pages/auth/PendingApproval/PendingApproval.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import feather from 'feather-icons';
import './PendingApproval.scss';

/**
 * PendingApproval component shown to users waiting for account approval
 */
export const PendingApproval = () => {
  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  const handleLogout = () => {
    Meteor.logout();
  };

  return (
    <div className="pending-approval-wrapper">
      <h2 className="brand-name">Strongly</h2>

      <div className="status-section">
        <div className="status-icon">
          <i data-feather="clock"></i>
        </div>
        <h3 className="status-title">Account Pending Approval</h3>
        <p className="status-message">
          Your account is currently awaiting administrator approval.
        </p>
      </div>

      <div className="info-card">
        <div className="info-header">
          <i data-feather="info"></i>
          <h4>What happens next?</h4>
        </div>
        <p>
          An administrator will review your account request. Once approved, you will be able
          to access all features of the application. This process typically takes 1-2 business days.
        </p>
      </div>

      <div className="help-card">
        <h4 className="help-title">Need assistance?</h4>
        <p>
          If your approval is taking longer than expected or you have any questions,
          please contact our support team.
        </p>
        <div className="action-buttons">
          <a href="mailto:support@example.com" className="btn-outline">
            <i data-feather="mail"></i>
            Contact Support
          </a>
          <button className="btn-outline btn-secondary" onClick={handleLogout}>
            <i data-feather="log-out"></i>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

// Add this line to ensure both named and default exports are available
export default PendingApproval;
