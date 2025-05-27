// /imports/ui/components/SharingSettings/SharingSettings.jsx

import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import {
  Users, Search, UserPlus, X, Shield, Eye, Edit3,
  Trash2, Mail, Check, AlertCircle, UserCheck
} from 'lucide-react';
import './SharingSettings.scss';

const SharingSettings = ({ workflowId, ownerId }) => {
  const [sharedUsers, setSharedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState('view');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('SharingSettings props:', { workflowId, ownerId });
  }, [workflowId, ownerId]);

  const permissions = [
    { value: 'view', label: 'View Only', icon: Eye, description: 'Can view workflow and version history' },
    { value: 'edit', label: 'Edit', icon: Edit3, description: 'Can edit workflow and create versions' },
    { value: 'admin', label: 'Admin', icon: Shield, description: 'Full access including sharing and deletion' }
  ];

  useEffect(() => {
    if (workflowId) {
      loadSharedUsers();
    } else {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    if (searchTerm) {
      searchUsers();
    } else {
      setAvailableUsers([]);
    }
  }, [searchTerm, currentPage]);

  const loadSharedUsers = () => {
    if (!workflowId) {
      console.warn('No workflowId provided to loadSharedUsers');
      setLoading(false);
      return;
    }

    setLoading(true);
    Meteor.call('workflows.sharing.list', workflowId, (error, result) => {
      setLoading(false);
      if (error) {
        setError(error.reason);
        console.error('Error loading shared users:', error);
      } else {
        setSharedUsers(result || []);
      }
    });
  };

  const searchUsers = () => {
    Meteor.call('users.search', {
      search: searchTerm,
      exclude: [...sharedUsers.map(u => u.userId), ownerId],
      page: currentPage,
      limit: 10
    }, (error, result) => {
      if (error) {
        console.error('Error searching users:', error);
      } else {
        setAvailableUsers(result.users);
        setTotalPages(result.pagination.pages);
      }
    });
  };

  const handleAddUser = () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    setAdding(true);
    setError(null);

    Meteor.call('workflows.sharing.add', workflowId, {
      userId: selectedUser._id,
      permission: selectedPermission
    }, (error) => {
      setAdding(false);
      if (error) {
        setError(error.reason);
      } else {
        setSuccessMessage('User added successfully');
        setSelectedUser(null);
        setSearchTerm('');
        setAvailableUsers([]);
        loadSharedUsers();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    });
  };

  const handleUpdatePermission = (userId, newPermission) => {
    Meteor.call('workflows.sharing.update', workflowId, userId, newPermission, (error) => {
      if (error) {
        setError(error.reason);
      } else {
        loadSharedUsers();
        setSuccessMessage('Permission updated');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    });
  };

  const handleRemoveUser = (userId) => {
    if (window.confirm('Are you sure you want to remove this user\'s access?')) {
      Meteor.call('workflows.sharing.remove', workflowId, userId, (error) => {
        if (error) {
          setError(error.reason);
        } else {
          loadSharedUsers();
          setSuccessMessage('User removed');
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      });
    }
  };

  const getPermissionIcon = (permission) => {
    const perm = permissions.find(p => p.value === permission);
    return perm ? <perm.icon size={16} /> : null;
  };

  const getUserDisplayName = (user) => {
    if (user.profile?.name) return user.profile.name;
    if (user.username) return user.username;
    if (user.emails?.[0]?.address) return user.emails[0].address;
    return 'Unknown User';
  };

  // Show debug info if no workflowId
  if (!workflowId) {
    return (
      <div className="sharing-settings">
        <div className="error-state" style={{ padding: '2rem', textAlign: 'center' }}>
          <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5, color: 'var(--bs-secondary-color)' }} />
          <h4>Unable to Load Sharing Settings</h4>
          <p style={{ color: 'var(--bs-secondary-color)' }}>
            Workflow ID is missing. Please save the workflow first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sharing-settings">
      <div className="sharing-header">
        <h3>
          <Users size={20} />
          Sharing & Permissions
        </h3>
        <p className="subtitle">Manage who can access and edit this workflow</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <Check size={16} />
          {successMessage}
        </div>
      )}

      {/* Add User Section */}
      <div className="add-user-section">
        <h4>Add People</h4>
        <div className="add-user-controls">
          <div className="user-search-wrapper">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm && availableUsers.length > 0 && (
              <div className="search-results">
                {availableUsers.map(user => (
                  <div
                    key={user._id}
                    className={`user-result ${selectedUser?._id === user._id ? 'selected' : ''}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="user-avatar">
                      {getUserDisplayName(user).charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{getUserDisplayName(user)}</div>
                      {user.emails?.[0]?.address && (
                        <div className="user-email">
                          <Mail size={12} />
                          {user.emails[0].address}
                        </div>
                      )}
                    </div>
                    {selectedUser?._id === user._id && <Check size={16} />}
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="search-pagination">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <select
            value={selectedPermission}
            onChange={(e) => setSelectedPermission(e.target.value)}
            className="permission-select"
          >
            {permissions.map(perm => (
              <option key={perm.value} value={perm.value}>
                {perm.label}
              </option>
            ))}
          </select>

          <button
            className="btn btn-primary"
            onClick={handleAddUser}
            disabled={!selectedUser || adding}
          >
            <UserPlus size={16} />
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>

        {selectedUser && (
          <div className="selected-user-preview">
            <UserCheck size={16} />
            Selected: <strong>{getUserDisplayName(selectedUser)}</strong>
          </div>
        )}
      </div>

      {/* Shared Users List */}
      <div className="shared-users-section">
        <h4>People with Access</h4>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : sharedUsers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h5>No users have been granted access</h5>
            <p>Add users above to start collaborating</p>
          </div>
        ) : (
          <div className="shared-users-list">
            {sharedUsers.map(share => (
              <div key={share.userId} className="shared-user-item">
                <div className="user-avatar">
                  {share.userName.charAt(0).toUpperCase()}
                </div>

                <div className="user-details">
                  <div className="user-name">{share.userName}</div>
                  {share.userEmail && (
                    <div className="user-email">
                      <Mail size={12} />
                      {share.userEmail}
                    </div>
                  )}
                </div>

                <div className="permission-control">
                  <select
                    value={share.permission}
                    onChange={(e) => handleUpdatePermission(share.userId, e.target.value)}
                    className="permission-select small"
                  >
                    {permissions.map(perm => (
                      <option key={perm.value} value={perm.value}>
                        {perm.label}
                      </option>
                    ))}
                  </select>
                  <span className="permission-icon">
                    {getPermissionIcon(share.permission)}
                  </span>
                </div>

                <button
                  className="btn btn-ghost btn-sm btn-icon remove-btn"
                  onClick={() => handleRemoveUser(share.userId)}
                  title="Remove access"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permission Guide */}
      <div className="permission-guide">
        <h4>Permission Levels</h4>
        <div className="permission-descriptions">
          {permissions.map(perm => (
            <div key={perm.value} className="permission-item">
              <div className="permission-icon">
                <perm.icon size={20} />
              </div>
              <div className="permission-info">
                <strong>{perm.label}</strong>
                <p>{perm.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SharingSettings;
