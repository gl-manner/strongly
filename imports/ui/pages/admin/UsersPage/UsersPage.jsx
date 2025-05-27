// /imports/ui/pages/admin/UsersPage/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Alert } from '/imports/ui/components/common/Alert/Alert.jsx';
import Breadcrumb from '/imports/ui/components/common/Breadcrumb/Breadcrumb';
import './UsersPage.scss';

// SVG Icons
const Icons = {
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="M21 21l-4.35-4.35"></path>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6"></polyline>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,18 15,12 9,6"></polyline>
    </svg>
  ),
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  )
};

export const UsersPage = () => {
  // State for search and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usersData, setUsersData] = useState({
    users: [],
    totalUsers: 0,
    totalPages: 0
  });

  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    sendEmail: true
  });

  // Edit user form state
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    active: true,
    isAdmin: false
  });

  // Get users data with search and pagination
  const { usersLoading } = useTracker(() => {
    const options = {
      page: currentPage,
      limit: usersPerPage,
      search: searchQuery.trim()
    };

    const handle = Meteor.subscribe('admin.users.list', options);

    return {
      usersLoading: !handle.ready()
    };
  }, [searchQuery, currentPage, usersPerPage]);

  // Fetch users data when parameters change
  useEffect(() => {
    const options = {
      page: currentPage,
      limit: usersPerPage,
      search: searchQuery.trim()
    };

    Meteor.call('admin.getUsersList', options, (error, result) => {
      if (error) {
        console.error('Error fetching users:', error);
        showAlert('error', 'Failed to fetch users');
      } else {
        setUsersData(result);
      }
    });
  }, [searchQuery, currentPage, usersPerPage]);

  // Alert helpers
  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  const hideAlert = () => {
    setAlert(null);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle create new user
  const handleCreateUser = (e) => {
    e.preventDefault();
    setLoading(true);

    Meteor.call('admin.createUser', newUserForm, (error, result) => {
      setLoading(false);

      if (error) {
        showAlert('error', error.reason || 'Failed to create user');
      } else {
        showAlert('success', `User created successfully! ${newUserForm.sendEmail ? 'Login email sent.' : ''}`);
        setShowCreateModal(false);
        setNewUserForm({
          name: '',
          email: '',
          organization: '',
          role: '',
          sendEmail: true
        });
      }
    });
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserForm({
      name: user.profile?.name || '',
      email: user.emails?.[0]?.address || '',
      organization: user.profile?.organization || '',
      role: user.profile?.role || '',
      active: user.profile?.active !== false,
      isAdmin: user.roles?.includes('admin') || false
    });
    setShowEditModal(true);
  };

  // Handle save user changes
  const handleSaveUser = (e) => {
    e.preventDefault();
    setLoading(true);

    const userData = {
      userId: selectedUser._id,
      profile: {
        name: editUserForm.name,
        organization: editUserForm.organization,
        role: editUserForm.role,
        active: editUserForm.active
      },
      isAdmin: editUserForm.isAdmin
    };

    Meteor.call('admin.updateUser', userData, (error) => {
      setLoading(false);

      if (error) {
        showAlert('error', error.reason || 'Failed to update user');
      } else {
        showAlert('success', 'User updated successfully');
        setShowEditModal(false);
        setSelectedUser(null);
      }
    });
  };

  // Handle toggle user active status
  const handleToggleActive = (user) => {
    const newStatus = !user.profile?.active;

    Meteor.call('admin.toggleUserActive', user._id, newStatus, (error) => {
      if (error) {
        showAlert('error', error.reason || 'Failed to update user status');
      } else {
        showAlert('success', `User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      }
    });
  };

  // Handle toggle admin status
  const handleToggleAdmin = (user) => {
    const isCurrentlyAdmin = user.roles?.includes('admin');
    const newAdminStatus = !isCurrentlyAdmin;

    Meteor.call('admin.toggleUserAdmin', user._id, newAdminStatus, (error) => {
      if (error) {
        showAlert('error', error.reason || 'Failed to update admin status');
      } else {
        showAlert('success', `User admin status ${newAdminStatus ? 'granted' : 'removed'} successfully`);
      }
    });
  };

  const breadcrumbItems = [
    { label: 'Main', link: '/' },
    { label: 'Admin', link: '/admin' },
    { label: 'Users', active: true }
  ];

  return (
    <div className="users-page-container">
      <div className="container-fluid px-4">
        {/* Alert Component */}
        {alert && (
          <div className="position-fixed" style={{ top: '20px', right: '20px', zIndex: 9999 }}>
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={hideAlert}
              timeout={5000}
            />
          </div>
        )}

        <Breadcrumb items={breadcrumbItems} />

        <div className="users-wrapper">
          {/* Page Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-2">User Management</h2>
                  <p className="text-muted">Manage user accounts, permissions, and access</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Icons.Plus className="me-2" />
                  Create User
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="search-box">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <Icons.Search />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search users by name, email, or organization..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-end align-items-center">
                <span className="text-muted">
                  Showing {usersData.users.length} of {usersData.totalUsers} users
                </span>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body p-0">
                  {usersLoading ? (
                    <div className="text-center p-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : usersData.users.length === 0 ? (
                    <div className="text-center p-5">
                      <h5>No users found</h5>
                      <p className="text-muted">
                        {searchQuery ? 'Try adjusting your search criteria' : 'No users have been created yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>User</th>
                            <th>Organization</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Admin</th>
                            <th>Created</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersData.users.map(user => (
                            <tr key={user._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="user-avatar me-3">
                                    {user.profile?.avatar ? (
                                      <img src={user.profile.avatar} alt="Avatar" className="rounded-circle" />
                                    ) : (
                                      <div className="avatar-placeholder">
                                        {(user.profile?.name || user.emails?.[0]?.address || 'U').charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="fw-semibold">{user.profile?.name || 'Unnamed User'}</div>
                                    <div className="text-muted small">{user.emails?.[0]?.address}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{user.profile?.organization || '-'}</td>
                              <td>{user.profile?.role || '-'}</td>
                              <td>
                                <span className={`badge ${user.profile?.active !== false ? 'bg-success' : 'bg-danger'}`}>
                                  {user.profile?.active !== false ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${user.roles?.includes('admin') ? 'bg-primary' : 'bg-secondary'}`}>
                                  {user.roles?.includes('admin') ? 'Admin' : 'User'}
                                </span>
                              </td>
                              <td>
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditUser(user)}
                                    title="Edit User"
                                  >
                                    <Icons.Edit />
                                  </button>
                                  <button
                                    className={`btn btn-sm ${user.profile?.active !== false ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                    onClick={() => handleToggleActive(user)}
                                    title={user.profile?.active !== false ? 'Deactivate User' : 'Activate User'}
                                  >
                                    {user.profile?.active !== false ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button
                                    className={`btn btn-sm ${user.roles?.includes('admin') ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                    onClick={() => handleToggleAdmin(user)}
                                    title={user.roles?.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                                  >
                                    {user.roles?.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {usersData.totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center p-3 border-top">
                      <div className="text-muted">
                        Page {currentPage} of {usersData.totalPages}
                      </div>
                      <nav>
                        <ul className="pagination pagination-sm mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              <Icons.ChevronLeft />
                            </button>
                          </li>

                          {[...Array(usersData.totalPages)].map((_, index) => {
                            const page = index + 1;
                            if (
                              page === 1 ||
                              page === usersData.totalPages ||
                              (page >= currentPage - 2 && page <= currentPage + 2)
                            ) {
                              return (
                                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                  <button
                                    className="page-link"
                                    onClick={() => handlePageChange(page)}
                                  >
                                    {page}
                                  </button>
                                </li>
                              );
                            } else if (
                              page === currentPage - 3 ||
                              page === currentPage + 3
                            ) {
                              return (
                                <li key={page} className="page-item disabled">
                                  <span className="page-link">...</span>
                                </li>
                              );
                            }
                            return null;
                          })}

                          <li className={`page-item ${currentPage === usersData.totalPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === usersData.totalPages}
                            >
                              <Icons.ChevronRight />
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="d-flex justify-content-end align-items-center text-muted">
                <span className="me-3">
                  Showing {usersData.users.length} of {usersData.totalUsers} users
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create New User</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreateModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleCreateUser}>
                  <div className="modal-body">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="createName" className="form-label">Full Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="createName"
                          value={newUserForm.name}
                          onChange={(e) => setNewUserForm(prev => ({...prev, name: e.target.value}))}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="createEmail" className="form-label">Email Address *</label>
                        <input
                          type="email"
                          className="form-control"
                          id="createEmail"
                          value={newUserForm.email}
                          onChange={(e) => setNewUserForm(prev => ({...prev, email: e.target.value}))}
                          required
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="createOrganization" className="form-label">Organization</label>
                        <input
                          type="text"
                          className="form-control"
                          id="createOrganization"
                          value={newUserForm.organization}
                          onChange={(e) => setNewUserForm(prev => ({...prev, organization: e.target.value}))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="createRole" className="form-label">Role</label>
                        <input
                          type="text"
                          className="form-control"
                          id="createRole"
                          value={newUserForm.role}
                          onChange={(e) => setNewUserForm(prev => ({...prev, role: e.target.value}))}
                        />
                      </div>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="sendEmail"
                        checked={newUserForm.sendEmail}
                        onChange={(e) => setNewUserForm(prev => ({...prev, sendEmail: e.target.checked}))}
                      />
                      <label className="form-check-label" htmlFor="sendEmail">
                        Send welcome email with login instructions
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Icons.Check className="me-2" />
                          Create User
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit User: {selectedUser.profile?.name}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSaveUser}>
                  <div className="modal-body">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="editName" className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="editName"
                          value={editUserForm.name}
                          onChange={(e) => setEditUserForm(prev => ({...prev, name: e.target.value}))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="editEmail" className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          id="editEmail"
                          value={editUserForm.email}
                          disabled
                        />
                        <small className="form-text text-muted">Email cannot be changed</small>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="editOrganization" className="form-label">Organization</label>
                        <input
                          type="text"
                          className="form-control"
                          id="editOrganization"
                          value={editUserForm.organization}
                          onChange={(e) => setEditUserForm(prev => ({...prev, organization: e.target.value}))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="editRole" className="form-label">Role</label>
                        <input
                          type="text"
                          className="form-control"
                          id="editRole"
                          value={editUserForm.role}
                          onChange={(e) => setEditUserForm(prev => ({...prev, role: e.target.value}))}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="editActive"
                            checked={editUserForm.active}
                            onChange={(e) => setEditUserForm(prev => ({...prev, active: e.target.checked}))}
                          />
                          <label className="form-check-label" htmlFor="editActive">
                            User is active
                          </label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="editAdmin"
                            checked={editUserForm.isAdmin}
                            onChange={(e) => setEditUserForm(prev => ({...prev, isAdmin: e.target.checked}))}
                          />
                          <label className="form-check-label" htmlFor="editAdmin">
                            User is administrator
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Icons.Check className="me-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
