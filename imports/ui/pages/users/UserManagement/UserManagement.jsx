// /imports/ui/pages/users/UserManagement/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import feather from 'feather-icons';
import './UserManagement.scss';

/**
 * UserManagement component for admins
 * This component allows admins to manage users and their permissions
 */
export const UserManagement = ({ pending = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [userAction, setUserAction] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state for editing user
  const [editName, setEditName] = useState('');
  const [editActive, setEditActive] = useState(false);
  const [editIsAdmin, setEditIsAdmin] = useState(false);

  // Get users based on pending status
  const { users, usersLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('users.all');

    // Filter users based on pending status and search term
    const userQuery = pending
      ? { 'profile.active': false }
      : { 'profile.active': true };

    const users = Meteor.users.find(userQuery).fetch();

    return {
      users,
      usersLoading: !subscription.ready()
    };
  }, [pending]);

  // Re-initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  // Filter users based on search term
  const filteredUsers = searchTerm
    ? users.filter(user =>
        user.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.emails?.[0]?.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  // Handle user selection for modal
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setEditName(user.profile?.name || '');
    setEditActive(user.profile?.active || false);
    setEditIsAdmin(Roles.userIsInRole(user._id, 'admin'));
    setShowUserModal(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  // Handle saving user changes
  const handleSaveUser = () => {
    if (!selectedUser) return;

    setActionLoading(true);
    setUserAction('save');
    setError('');
    setSuccess('');

    // Call method to update user
    Meteor.call('users.updateByAdmin', selectedUser._id, {
      name: editName,
      active: editActive,
      isAdmin: editIsAdmin
    }, (err) => {
      setActionLoading(false);

      if (err) {
        setError(err.reason || 'Failed to update user.');
      } else {
        setSuccess('User updated successfully.');
        setShowUserModal(false);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    });
  };

  // Handle user status change (activate/deactivate)
  const handleStatusChange = (userId, activate) => {
    setActionLoading(true);
    setUserAction('status');
    setError('');
    setSuccess('');

    Meteor.call('users.setActive', userId, activate, (err) => {
      setActionLoading(false);

      if (err) {
        setError(err.reason || `Failed to ${activate ? 'activate' : 'deactivate'} user.`);
      } else {
        setSuccess(`User ${activate ? 'activated' : 'deactivated'} successfully.`);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    });
  };

  // Handle user role change
  const handleRoleChange = (userId, isAdmin) => {
    setActionLoading(true);
    setUserAction('role');
    setError('');
    setSuccess('');

    Meteor.call('users.setAdmin', userId, isAdmin, (err) => {
      setActionLoading(false);

      if (err) {
        setError(err.reason || `Failed to ${isAdmin ? 'grant' : 'revoke'} admin privileges.`);
      } else {
        setSuccess(`Admin privileges ${isAdmin ? 'granted' : 'revoked'} successfully.`);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    });
  };

  // Calculate user initials from name
  const getUserInitials = (user) => {
    if (!user || !user.profile || !user.profile.name) return 'U';

    const name = user.profile.name;
    const parts = name.split(' ');

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  // Check if user is admin
  const isUserAdmin = (user) => {
    return Roles.userIsInRole(user._id, 'admin');
  };

  // Loading state
  if (usersLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-wrapper">
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">
            {pending ? 'Pending User Approvals' : 'User Management'}
          </h4>
        </div>
        <div className="d-flex align-items-center flex-wrap text-nowrap">
          <div className="input-group date mb-2 mb-md-0 me-2">
            <span className="input-group-text bg-transparent">
              <i data-feather="search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-outline-primary btn-icon-text mb-2 mb-md-0"
            onClick={() => setSearchTerm('')}
          >
            <i className="btn-icon-prepend" data-feather="refresh-cw"></i>
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">
                {pending ? 'Users Awaiting Approval' : 'Registered Users'}
              </h6>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-5">
                  <i
                    data-feather={pending ? 'user-check' : 'users'}
                    className="icon-xl text-muted mb-3"
                  ></i>
                  <h5 className="text-muted">
                    {pending
                      ? 'No pending user approvals'
                      : searchTerm
                        ? 'No users match your search'
                        : 'No users found'
                    }
                  </h5>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {user.profile?.avatar ? (
                                <img
                                  src={user.profile.avatar}
                                  alt="user"
                                  className="user-avatar me-2"
                                />
                              ) : (
                                <div className="user-initials me-2">
                                  {getUserInitials(user)}
                                </div>
                              )}
                              <span>{user.profile?.name || 'Unnamed User'}</span>
                            </div>
                          </td>
                          <td>{user.emails?.[0]?.address || 'No email'}</td>
                          <td>
                            <span className={`badge ${isUserAdmin(user) ? 'bg-danger' : 'bg-primary'}`}>
                              {isUserAdmin(user) ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${user.profile?.active ? 'bg-success' : 'bg-warning'}`}>
                              {user.profile?.active ? 'Active' : 'Pending'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex">
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => handleSelectUser(user)}
                              >
                                <i data-feather="edit-2" className="icon-sm"></i>
                              </button>
                              {!pending ? (
                                <button
                                  className={`btn btn-sm ${isUserAdmin(user) ? 'btn-outline-danger' : 'btn-outline-info'} me-1`}
                                  onClick={() => handleRoleChange(user._id, !isUserAdmin(user))}
                                  disabled={actionLoading && userAction === 'role'}
                                >
                                  <i
                                    data-feather={isUserAdmin(user) ? 'user-minus' : 'user-plus'}
                                    className="icon-sm"
                                  ></i>
                                </button>
                              ) : null}
                              <button
                                className={`btn btn-sm ${user.profile?.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                onClick={() => handleStatusChange(user._id, !user.profile?.active)}
                                disabled={actionLoading && userAction === 'status'}
                              >
                                <i
                                  data-feather={user.profile?.active ? 'user-x' : 'user-check'}
                                  className="icon-sm"
                                ></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="userName" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="userName"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="userEmail" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="userEmail"
                      value={selectedUser.emails?.[0]?.address || ''}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="userActive"
                        checked={editActive}
                        onChange={(e) => setEditActive(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="userActive">
                        Active
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="userAdmin"
                        checked={editIsAdmin}
                        onChange={(e) => setEditIsAdmin(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="userAdmin">
                        Admin
                      </label>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveUser}
                  disabled={actionLoading && userAction === 'save'}
                >
                  {actionLoading && userAction === 'save' ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
};

// Add this line to fix the import issue
export default UserManagement;
