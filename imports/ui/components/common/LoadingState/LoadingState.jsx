// /imports/ui/components/common/LoadingState/LoadingState.jsx
import React from 'react';
import Spinner from '/imports/ui/components/common/Spinner/Spinner';
import './LoadingState.scss';

/**
 * Global loading state component
 * @param {Object} props - Component props
 * @param {string} props.message - Custom loading message
 * @param {boolean} props.fullPage - Whether to display as a full-page overlay
 */
export const LoadingState = ({
  message = 'Loading...',
  fullPage = false
}) => {
  const containerClass = fullPage ? 'loading-container full-page' : 'loading-container';

  return (
    <div className={containerClass}>
      <div className="loading-content">
        <Spinner size="large" color="primary" />
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingState;
