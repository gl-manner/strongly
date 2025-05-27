// Label.jsx
import React from 'react';
import './Label.scss';

export const Label = ({
  children,
  htmlFor,
  required = false,
  disabled = false,
  error = false,
  className = '',
  ...props
}) => {
  const labelClasses = [
    'label',
    disabled && 'label--disabled',
    error && 'label--error',
    className
  ].filter(Boolean).join(' ');

  return (
    <label
      htmlFor={htmlFor}
      className={labelClasses}
      {...props}
    >
      {children}
      {required && <span className="label__required" aria-label="required">*</span>}
    </label>
  );
};
