// Divider.jsx
import React from 'react';
import './Divider.scss';

export const Divider = ({
  orientation = 'horizontal',
  variant = 'solid',
  spacing = 'medium',
  color = 'default',
  children,
  textAlign = 'center',
  className = '',
  ...props
}) => {
  const dividerClasses = [
    'divider',
    `divider--${orientation}`,
    `divider--${variant}`,
    `divider--spacing-${spacing}`,
    `divider--${color}`,
    children && `divider--with-text`,
    children && `divider--text-${textAlign}`,
    className
  ].filter(Boolean).join(' ');

  if (children) {
    return (
      <div className={dividerClasses} role="separator" {...props}>
        <span className="divider__line divider__line--before" />
        <span className="divider__text">{children}</span>
        <span className="divider__line divider__line--after" />
      </div>
    );
  }

  return <div className={dividerClasses} role="separator" {...props} />;
};
