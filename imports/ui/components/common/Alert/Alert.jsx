import React, { useEffect, useState } from 'react';
import './Alert.scss';

// SVG Icon Components
const Icons = {
  CheckCircle: ({ className = "" }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22,4 12,14.01 9,11.01"></polyline>
    </svg>
  ),
  AlertCircle: ({ className = "" }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  AlertTriangle: ({ className = "" }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  Info: ({ className = "" }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
  X: ({ className = "" }) => (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
};

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

  const getIconComponent = () => {
    switch (type) {
      case 'success':
        return <Icons.CheckCircle className="alert-icon-svg" />;
      case 'error':
        return <Icons.AlertCircle className="alert-icon-svg" />;
      case 'warning':
        return <Icons.AlertTriangle className="alert-icon-svg" />;
      case 'info':
      default:
        return <Icons.Info className="alert-icon-svg" />;
    }
  };

  return (
    <div className={`alert alert-${type} ${visible ? 'visible' : 'hidden'}`}>
      <div className="alert-icon">
        {getIconComponent()}
      </div>
      <div className="alert-content">
        {message}
      </div>
      <button className="alert-close" onClick={handleClose}>
        <Icons.X className="alert-close-icon" />
      </button>
    </div>
  );
};
