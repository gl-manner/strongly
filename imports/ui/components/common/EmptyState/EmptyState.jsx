import React from 'react';
import './EmptyState.scss';

const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-content">
        {icon && <div className="empty-state-icon">{icon}</div>}
        <h3 className="empty-state-title">{title}</h3>
        {description && <p className="empty-state-description">{description}</p>}
        {action && <div className="empty-state-action">{action}</div>}
      </div>
    </div>
  );
};

export default EmptyState;
