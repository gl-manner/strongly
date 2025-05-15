// /imports/ui/components/common/Spinner/Spinner.jsx
import React from 'react';
import './Spinner.scss';

/**
 * Global spinner component for loading states
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner ('small', 'medium', 'large')
 * @param {string} props.color - Color of the spinner ('primary', 'light', 'dark')
 * @param {boolean} props.centered - Whether to center the spinner in its container
 * @param {string} props.text - Optional text to display alongside the spinner
 */
export const Spinner = ({
  size = 'medium',
  color = 'primary',
  centered = false,
  text = null
}) => {
  const sizeClass = `spinner-${size}`;
  const colorClass = `spinner-${color}`;
  const containerClass = centered ? 'spinner-container centered' : 'spinner-container';

  return (
    <div className={containerClass}>
      <div className={`spinner ${sizeClass} ${colorClass}`}>
        <div className="spinner-border"></div>
      </div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
};

export default Spinner;
