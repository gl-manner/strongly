// Avatar.jsx
import React, { useState } from 'react';
import { User } from 'lucide-react';
import './Avatar.scss';

export const Avatar = ({
  src,
  alt = '',
  name,
  size = 'medium',
  shape = 'circle',
  status,
  statusPosition = 'bottom-right',
  className = '',
  fallbackIcon = <User />,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const avatarClasses = [
    'avatar',
    `avatar--${size}`,
    `avatar--${shape}`,
    className
  ].filter(Boolean).join(' ');

  const getInitials = (name) => {
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const renderContent = () => {
    if (src && !imageError) {
      return (
        <img
          className="avatar__image"
          src={src}
          alt={alt || name}
          onError={handleImageError}
        />
      );
    } else if (name) {
      return <span className="avatar__initials">{getInitials(name)}</span>;
    } else {
      return <span className="avatar__icon">{fallbackIcon}</span>;
    }
  };

  return (
    <div className={avatarClasses} {...props}>
      {renderContent()}
      {status && (
        <span
          className={`avatar__status avatar__status--${status} avatar__status--${statusPosition}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};
