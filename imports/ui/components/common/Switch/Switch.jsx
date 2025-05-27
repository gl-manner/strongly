// Switch.jsx
import React, { forwardRef } from 'react';
import './Switch.scss';

export const Switch = forwardRef(({
  checked = false,
  defaultChecked,
  disabled = false,
  onChange,
  label,
  size = 'medium',
  className = '',
  ...props
}, ref) => {
  const switchClasses = [
    'switch',
    `switch--${size}`,
    checked && 'switch--checked',
    disabled && 'switch--disabled',
    className
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e);
    }
  };

  const switchElement = (
    <span className={switchClasses}>
      <input
        ref={ref}
        type="checkbox"
        className="switch__input"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        {...props}
      />
      <span className="switch__track">
        <span className="switch__thumb" />
      </span>
    </span>
  );

  if (label) {
    return (
      <label className={`switch-wrapper ${disabled ? 'switch-wrapper--disabled' : ''}`}>
        {switchElement}
        <span className="switch__label">{label}</span>
      </label>
    );
  }

  return switchElement;
});

Switch.displayName = 'Switch';
