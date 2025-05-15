// /imports/ui/components/common/Alert/Alert.jsx
import React, { useEffect, useState } from 'react';
import './Alert.scss';

export const Alert = ({ type = 'info', message, onClose, timeout = 5000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (timeout !== false) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onClose && onClose();
        }, 300); // Wait for fade out animation
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [timeout, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert-triangle';
      case 'info':
      default:
        return 'info';
    }
  };

  return (
    <div className={`alert alert-${type} ${visible ? 'visible' : 'hidden'}`}>
      <div className="alert-icon">
        <i className={`feather icon-${getIcon()}`}></i>
      </div>
      <div className="alert-content">
        {message}
      </div>
      <button className="alert-close" onClick={handleClose}>
        <i className="feather icon-x"></i>
      </button>
    </div>
  );
};
