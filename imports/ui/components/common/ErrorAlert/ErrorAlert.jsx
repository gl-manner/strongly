// /imports/ui/components/ErrorAlert.jsx
import React from 'react';
import { Alert } from '/imports/ui/components/common/Alert/Alert';

const ErrorAlert = ({ title, message, onClose, timeout = false }) => {
  const formattedMessage = title ? (
    <div>
      <h5 className="alert-heading">{title}</h5>
      <p>{message}</p>
    </div>
  ) : (
    message
  );

  return (
    <div className="error-alert-container">
      <Alert
        type="error"
        message={formattedMessage}
        onClose={onClose}
        timeout={timeout}
      />
    </div>
  );
};

export default ErrorAlert;
