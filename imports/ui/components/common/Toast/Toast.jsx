// Toast.jsx
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './Toast.scss';

// Toast component
export const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Wait for animation to complete
  };

  if (!isVisible) return null;

  const toastClasses = [
    'toast',
    `toast--${type}`,
    !isVisible && 'toast--hiding',
    className
  ].filter(Boolean).join(' ');

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div className={toastClasses} role="alert" {...props}>
      <span className="toast__icon">{getIcon()}</span>
      <span className="toast__message">{message}</span>
      <button
        type="button"
        className="toast__close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// ToastContainer to manage multiple toasts
export const ToastContainer = ({ position = 'top-right', children }) => {
  const containerClasses = [
    'toast-container',
    `toast-container--${position}`
  ].join(' ');

  return <div className={containerClasses}>{children}</div>;
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, options = {}) => {
    const id = Date.now();
    const newToast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 3000,
    };

    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
  };
};
