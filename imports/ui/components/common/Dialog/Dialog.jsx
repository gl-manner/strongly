// imports/ui/components/common/Dialog/Dialog.jsx

import React from 'react';
import './Dialog.scss';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="dialog-wrapper">
      <div
        className="dialog-backdrop"
        onClick={() => onOpenChange(false)}
      />
      <div className="dialog">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className = '', ...props }) => (
  <div className={`dialog-content ${className}`} {...props}>
    {children}
  </div>
);

export const DialogHeader = ({ children, className = '', ...props }) => (
  <div className={`dialog-header ${className}`} {...props}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className = '', ...props }) => (
  <h2 className={`dialog-title ${className}`} {...props}>
    {children}
  </h2>
);

export const DialogFooter = ({ children, className = '', ...props }) => (
  <div className={`dialog-footer ${className}`} {...props}>
    {children}
  </div>
);
