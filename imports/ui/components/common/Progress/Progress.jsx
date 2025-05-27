// Progress.jsx
import React from 'react';
import './Progress.scss';

export const Progress = ({
  value = 0,
  max = 100,
  size = 'medium',
  variant = 'primary',
  showLabel = false,
  label,
  striped = false,
  animated = false,
  className = '',
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const progressClasses = [
    'progress',
    `progress--${size}`,
    className
  ].filter(Boolean).join(' ');

  const barClasses = [
    'progress__bar',
    `progress__bar--${variant}`,
    striped && 'progress__bar--striped',
    animated && 'progress__bar--animated',
  ].filter(Boolean).join(' ');

  return (
    <div className={progressClasses} role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax={max} {...props}>
      <div
        className={barClasses}
        style={{ width: `${percentage}%` }}
      >
        {showLabel && (
          <span className="progress__label">
            {label || `${Math.round(percentage)}%`}
          </span>
        )}
      </div>
    </div>
  );
};
