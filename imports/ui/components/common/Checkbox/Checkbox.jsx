// Checkbox.jsx
import React, { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';
import './Checkbox.scss';

export const Checkbox = forwardRef(({
  className = '',
  checked = false,
  defaultChecked,
  indeterminate = false,
  disabled = false,
  label,
  error = false,
  onChange,
  ...props
}, ref) => {
  const checkboxClasses = [
    'checkbox',
    checked && 'checkbox--checked',
    indeterminate && 'checkbox--indeterminate',
    disabled && 'checkbox--disabled',
    error && 'checkbox--error',
    className
  ].filter(Boolean).join(' ');

  const wrapperClasses = [
    'checkbox-wrapper',
    disabled && 'checkbox-wrapper--disabled'
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e);
    }
  };

  const checkbox = (
    <span className={checkboxClasses}>
      <input
        ref={ref}
        type="checkbox"
        className="checkbox__input"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        {...props}
      />
      <span className="checkbox__box">
        {(checked || indeterminate) && (
          <span className="checkbox__icon">
            {indeterminate ? <Minus size={12} /> : <Check size={12} />}
          </span>
        )}
      </span>
    </span>
  );

  if (label) {
    return (
      <label className={wrapperClasses}>
        {checkbox}
        <span className="checkbox__label">{label}</span>
      </label>
    );
  }

  return checkbox;
});

Checkbox.displayName = 'Checkbox';
