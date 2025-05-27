// Textarea.jsx
import React, { forwardRef } from 'react';
import './Textarea.scss';

export const Textarea = forwardRef(({
  className = '',
  error = false,
  disabled = false,
  fullWidth = false,
  resize = 'vertical',
  rows = 3,
  maxLength,
  showCount = false,
  value,
  onChange,
  ...props
}, ref) => {
  const textareaClasses = [
    'textarea',
    `textarea--resize-${resize}`,
    error && 'textarea--error',
    disabled && 'textarea--disabled',
    fullWidth && 'textarea--full-width',
    className
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const charCount = value ? value.length : 0;

  return (
    <div className="textarea-wrapper">
      <textarea
        ref={ref}
        className={textareaClasses}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={handleChange}
        {...props}
      />
      {showCount && maxLength && (
        <div className="textarea-count">
          {charCount} / {maxLength}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
