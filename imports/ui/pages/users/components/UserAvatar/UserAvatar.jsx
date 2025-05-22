// /imports/ui/components/users/UserAvatar/UserAvatar.jsx
import React from 'react';
import './UserAvatar.scss';

export const UserAvatar = ({ user, size = 'md' }) => {
  // Get user initials from name
  const getInitials = () => {
    if (!user || !user.profile || !user.profile.name) {
      return 'U';
    }

    const nameParts = user.profile.name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }

    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Get background color based on user ID
  const getAvatarColor = () => {
    if (!user || !user._id) {
      return '#6c757d'; // Default gray
    }

    // Generate a color based on user ID (pseudo-random but consistent)
    const colors = [
      '#4f46e5', // Primary
      '#7c3aed', // Purple
      '#10b981', // Success
      '#3b82f6', // Info
      '#f59e0b', // Warning
      '#ef4444', // Danger
      '#6366f1', // Indigo
      '#ec4899', // Pink
      '#8b5cf6', // Violet
      '#14b8a6', // Teal
    ];

    const hash = user._id.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colors[hash % colors.length];
  };

  return (
    <div className={`user-avatar user-avatar-${size}`} style={{ backgroundColor: getAvatarColor() }}>
      {user && user.profile && user.profile.avatar ? (
        <img src={user.profile.avatar} alt={user.profile.name || 'User'} />
      ) : (
        <span className="user-initials">{getInitials()}</span>
      )}

      {user && user.status === 'online' && (
        <span className="status-indicator online"></span>
      )}
    </div>
  );
};
