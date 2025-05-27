// /imports/ui/components/VersionControlModal/VersionControlModal.jsx

import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import {
  GitBranch, Search, Clock, Tag, User, ChevronRight,
  Download, Eye, RotateCcw, X, Check, AlertCircle,
  Calendar, Hash, FileText
} from 'lucide-react';
import './VersionControlModal.scss';

const VersionControlModal = ({ workflowId, currentVersion, onClose, onRestore }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [versionForm, setVersionForm] = useState({
    name: '',
    description: '',
    type: 'minor', // minor or major
    tag: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (workflowId) {
      loadVersions();
    }
  }, [workflowId, currentPage, searchTerm]);

  const loadVersions = () => {
    if (!workflowId) {
      console.warn('No workflowId provided to loadVersions');
      return;
    }

    setLoading(true);
    setError(null);

    Meteor.call('workflows.versions.list', workflowId, {
      page: currentPage,
      limit: 10,
      search: searchTerm
    }, (error, result) => {
      setLoading(false);
      if (error) {
        setError(error.reason);
        console.error('Error loading versions:', error);
      } else {
        setVersions(result.versions);
        setTotalPages(result.pagination.pages);
      }
    });
  };

  const handleCreateVersion = () => {
    if (!versionForm.name.trim()) {
      setError('Version name is required');
      return;
    }

    setSaving(true);
    setError(null);

    Meteor.call('workflows.versions.create', workflowId, versionForm, (error, versionId) => {
      setSaving(false);
      if (error) {
        setError(error.reason);
        console.error('Error creating version:', error);
      } else {
        setShowCreateDialog(false);
        setVersionForm({ name: '', description: '', type: 'minor', tag: '' });
        loadVersions();
      }
    });
  };

  const handleRestore = (versionId) => {
    if (window.confirm('Are you sure you want to restore this version? Current changes will be lost.')) {
      Meteor.call('workflows.versions.restore', workflowId, versionId, (error) => {
        if (error) {
          setError(error.reason);
          console.error('Error restoring version:', error);
        } else {
          onRestore && onRestore(versionId);
          onClose();
        }
      });
    }
  };

  const handlePreview = (version) => {
    setSelectedVersion(version);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVersionTypeIcon = (type) => {
    return type === 'major' ? (
      <span className="version-type major">Major</span>
    ) : (
      <span className="version-type minor">Minor</span>
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container version-control-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title">
            <GitBranch size={20} />
            <h3>Version History</h3>
          </div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search versions by name or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateDialog(true)}
          >
            Create Version
          </button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading versions...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="empty-state">
              <GitBranch size={48} />
              <h4>No versions found</h4>
              <p>Create your first version to start tracking changes</p>
            </div>
          ) : (
            <div className="versions-grid">
              <div className="versions-list">
                {versions.map((version) => (
                  <div
                    key={version._id}
                    className={`version-item ${selectedVersion?._id === version._id ? 'selected' : ''} ${version.isCurrent ? 'current' : ''}`}
                    onClick={() => handlePreview(version)}
                  >
                    <div className="version-header">
                      <div className="version-info">
                        <h4>
                          {version.name}
                          {version.isCurrent && <span className="current-badge">Current</span>}
                        </h4>
                        <div className="version-meta">
                          <span className="version-number">
                            <Hash size={12} />
                            v{version.versionNumber}
                          </span>
                          {getVersionTypeIcon(version.type)}
                          {version.tag && (
                            <span className="version-tag">
                              <Tag size={12} />
                              {version.tag}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} />
                    </div>
                    <p className="version-description">{version.description || 'No description'}</p>
                    <div className="version-footer">
                      <span className="version-date">
                        <Clock size={12} />
                        {formatDate(version.createdAt)}
                      </span>
                      <span className="version-author">
                        <User size={12} />
                        {version.createdByName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedVersion && (
                <div className="version-preview">
                  <div className="preview-header">
                    <h4>Version Details</h4>
                    <div className="preview-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleRestore(selectedVersion._id)}
                        disabled={selectedVersion.isCurrent}
                      >
                        <RotateCcw size={14} />
                        Restore
                      </button>
                    </div>
                  </div>

                  <div className="preview-content">
                    <div className="detail-group">
                      <label>Version Name</label>
                      <p>{selectedVersion.name}</p>
                    </div>

                    <div className="detail-group">
                      <label>Description</label>
                      <p>{selectedVersion.description || 'No description provided'}</p>
                    </div>

                    <div className="detail-group">
                      <label>Version Info</label>
                      <div className="version-stats">
                        <div className="stat">
                          <span className="stat-label">Number</span>
                          <span className="stat-value">v{selectedVersion.versionNumber}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Type</span>
                          <span className="stat-value">{selectedVersion.type}</span>
                        </div>
                        {selectedVersion.tag && (
                          <div className="stat">
                            <span className="stat-label">Tag</span>
                            <span className="stat-value">{selectedVersion.tag}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="detail-group">
                      <label>Workflow Stats</label>
                      <div className="workflow-stats">
                        <div className="stat">
                          <span className="stat-label">Nodes</span>
                          <span className="stat-value">{selectedVersion.snapshot?.nodes?.length || 0}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Connections</span>
                          <span className="stat-value">{selectedVersion.snapshot?.connections?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-group">
                      <label>Created</label>
                      <p>
                        {formatDate(selectedVersion.createdAt)} by {selectedVersion.createdByName}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="modal-footer">
            <div className="pagination">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Create Version Dialog */}
        {showCreateDialog && (
          <div className="modal-backdrop" onClick={() => setShowCreateDialog(false)}>
            <div className="modal-content create-version-dialog" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Create New Version</h3>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowCreateDialog(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Version Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g., Initial Release, Bug Fixes, New Features"
                    value={versionForm.name}
                    onChange={(e) => setVersionForm({ ...versionForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the changes in this version..."
                    value={versionForm.description}
                    onChange={(e) => setVersionForm({ ...versionForm, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Version Type</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="type"
                        value="minor"
                        checked={versionForm.type === 'minor'}
                        onChange={(e) => setVersionForm({ ...versionForm, type: e.target.value })}
                      />
                      <span className="radio-text">
                        <strong>Minor</strong>
                        <small>Small changes, bug fixes, improvements</small>
                      </span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="type"
                        value="major"
                        checked={versionForm.type === 'major'}
                        onChange={(e) => setVersionForm({ ...versionForm, type: e.target.value })}
                      />
                      <span className="radio-text">
                        <strong>Major</strong>
                        <small>Significant changes, new features, breaking changes</small>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., stable, beta, release-candidate"
                    value={versionForm.tag}
                    onChange={(e) => setVersionForm({ ...versionForm, tag: e.target.value })}
                  />
                </div>

                {error && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCreateVersion}
                  disabled={saving || !versionForm.name.trim()}
                >
                  {saving ? 'Creating...' : 'Create Version'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionControlModal;
