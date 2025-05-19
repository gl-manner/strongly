// /imports/ui/components/common/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Dropdown } from '../Dropdown/Dropdown';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Navbar.scss';

/**
 * Navbar component based on NobleUI navbar
 * This component creates a responsive top navigation bar
 */
const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  // Get current user
  const { currentUser } = useTracker(() => {
    return {
      currentUser: Meteor.user()
    };
  }, []);

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    document.body.classList.toggle('sidebar-open');
  };

  // Calculate user initials for avatar if no profile image
  const getUserInitials = () => {
    if (!currentUser || !currentUser.profile) return 'U';

    const name = currentUser.profile.name || '';
    const parts = name.split(' ');

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  // Toggle user dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    // Close notification dropdown if open
    if (notificationDropdownOpen) {
      setNotificationDropdownOpen(false);
    }
  };

  // Toggle notification dropdown
  const toggleNotificationDropdown = () => {
    setNotificationDropdownOpen(!notificationDropdownOpen);
    // Close user dropdown if open
    if (dropdownOpen) {
      setDropdownOpen(false);
    }
  };

  // Create user profile items for dropdown - no header for this one
  const profileItems = [
    {
      icon: 'user',
      label: 'Profile',
      to: '/profile'
    },
    {
      icon: 'edit',
      label: 'Edit Profile',
      to: '/profile/edit'
    },
    {
      type: 'divider'
    },
    {
      icon: 'log-out',
      label: 'Log Out',
      onClick: () => Meteor.logout()
    }
  ];

  // Create notification items for dropdown - with header
  const notificationItems = [
    {
      header: 'New Notifications', // This triggers the header to show
      clearAll: true, // This shows the clear all link
      onClick: () => console.log('Clear all clicked')
    },
    {
      icon: 'user-plus',
      label: 'New user registered',
      subtitle: '2 sec ago',
      onClick: () => console.log('User notification clicked')
    },
    {
      icon: 'message-square',
      label: 'New message received',
      subtitle: '1 min ago',
      onClick: () => console.log('Message notification clicked')
    },
    {
      icon: 'shopping-bag',
      label: '10 orders have been placed',
      subtitle: '15 min ago',
      onClick: () => console.log('Order notification clicked')
    },
    {
      footerLabel: 'View all', // This triggers the footer to show
      onClick: () => console.log('View all notifications clicked')
    }
  ];

  // User profile trigger element
  const profileTrigger = (
    <>
      {currentUser && currentUser.profile && currentUser.profile.avatar ? (
        <img
          className="w-30px h-30px ms-1 rounded-circle"
          src={currentUser.profile.avatar}
          alt="profile"
        />
      ) : (
        <div className="w-30px h-30px ms-1 rounded-circle d-flex align-items-center justify-content-center bg-primary text-white">
          {getUserInitials()}
        </div>
      )}
    </>
  );

  // Notification trigger element
  const notificationTrigger = (
    <>
      <i data-feather="bell"></i>
      <div className="indicator">
        <div className="circle"></div>
      </div>
    </>
  );

  return (
    <nav className="navbar">
      <a href="#" className="sidebar-toggler" onClick={(e) => {
        e.preventDefault();
        toggleSidebar();
      }}>
        <i data-feather="menu"></i>
      </a>

      <div className="navbar-content">
        <ul className="navbar-nav">
          {/* Notifications Dropdown */}
          <li className="nav-item dropdown">
            <div className="position-relative">
              <Dropdown
                open={notificationDropdownOpen}
                toggle={toggleNotificationDropdown}
                trigger={notificationTrigger}
                items={notificationItems}
              />
            </div>
          </li>

          {/* Theme Toggle - Add this new item */}
          <li className="nav-item">
            <ThemeToggle />
          </li>

          {/* User Profile Dropdown */}
          <li className="nav-item dropdown">
            <div className="position-relative">
              <Dropdown
                open={dropdownOpen}
                toggle={toggleDropdown}
                trigger={profileTrigger}
                items={profileItems}
              />
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
