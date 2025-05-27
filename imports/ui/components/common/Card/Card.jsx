// Card.jsx
import React from 'react';
import './Card.scss';

export const Card = ({
  children,
  className = '',
  variant = 'elevated',
  padding = true,
  interactive = false,
  ...props
}) => {
  const cardClasses = [
    'card',
    `card--${variant}`,
    !padding && 'card--no-padding',
    interactive && 'card--interactive',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardContent = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`card-content ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`card-footer ${className}`} {...props}>
      {children}
    </div>
  );
};
