// Badge.jsx
import React from 'react';
import { X } from 'lucide-react';
import './Badge.scss';

export const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
  removable = false,
  onRemove,
  className = '',
  ...props
}) => {
  const badgeClasses = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    removable && 'badge--removable',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} {...props}>
      <span className="badge__content">{children}</span>
      {removable && (
        <button
          type="button"
          className="badge__remove"
          onClick={onRemove}
          aria-label="Remove"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
};
