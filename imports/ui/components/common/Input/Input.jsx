// Input.jsx
import React, { forwardRef } from 'react';
import './Input.scss';

export const Input = forwardRef(({
  className = '',
  type = 'text',
  error = false,
  disabled = false,
  size = 'medium',
  fullWidth = false,
  startIcon,
  endIcon,
  ...props
}, ref) => {
  const inputClasses = [
    'input',
    `input--${size}`,
    error && 'input--error',
    disabled && 'input--disabled',
    fullWidth && 'input--full-width',
    (startIcon || endIcon) && 'input--with-icon',
    className
  ].filter(Boolean).join(' ');

  const inputElement = (
    <input
      ref={ref}
      type={type}
      className={inputClasses}
      disabled={disabled}
      {...props}
    />
  );

  if (startIcon || endIcon) {
    return (
      <div className="input-wrapper">
        {startIcon && <span className="input-icon input-icon--start">{startIcon}</span>}
        {inputElement}
        {endIcon && <span className="input-icon input-icon--end">{endIcon}</span>}
      </div>
    );
  }

  return inputElement;
});

Input.displayName = 'Input';
