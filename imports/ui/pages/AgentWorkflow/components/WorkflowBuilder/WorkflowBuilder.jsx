// /imports/ui/components/WorkflowBuilder/WorkflowBuilder.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';
import ComponentsSidebar from '../ComponentsSidebar/ComponentsSidebar';
import WorkflowCanvas from '../WorkflowCanvas/WorkflowCanvas';
import componentRegistry, { getComponentList } from '../../workflow-components';
import NodeEditor from '../NodeEditor/NodeEditor';
import useWorkflow from '../../hooks/useWorkflow';
import {
  X, Save, Play, Settings, GitBranch, MessageSquare,
  AlertCircle, CheckCircle, Users
} from 'lucide-react';
import './WorkflowBuilder.scss';

// Lazy load components with fallbacks
const VersionControlModal = React.lazy(() =>
  import('../VersionControlModal/VersionControlModal').catch(() => ({
    default: () => (
      <div className="modal-backdrop" onClick={() => {}}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Component Not Found</h3>
          </div>
          <div className="modal-body" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>VersionControlModal component not found. Please ensure it's properly installed.</p>
          </div>
        </div>
      </div>
    )
  }))
);

const SharingSettings = React.lazy(() =>
  import('../SharingSettings/SharingSettings').catch(() => ({
    default: () => (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>SharingSettings component not found. Please ensure it's properly installed.</p>
      </div>
    )
  }))
);

const WorkflowBuilder = ({ agentId, isNew = false, onClose }) => {
  const navigate = useNavigate();
  const { workflow, loading, error, updateWorkflow, saveWorkflow } = useWorkflow(agentId, isNew);

  // Debug logging
  useEffect(() => {
    console.log('WorkflowBuilder state:', { agentId, isNew, workflow, loading, error });
  }, [agentId, isNew, workflow, loading, error]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [showVersionControl, setShowVersionControl] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track changes
  useEffect(() => {
    if (workflow?.isDirty) {
      setHasUnsavedChanges(true);
    }
  }, [workflow]);

  // Handle unsaved changes on close
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Do you want to save before closing?'
      );

      if (confirmClose) {
        handleSave().then(() => {
          onClose();
        });
      } else if (window.confirm('Are you sure you want to discard your changes?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  // Handle browser/tab close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const result = await saveWorkflow();
      setHasUnsavedChanges(false);
      setSaveStatus({ type: 'success', message: 'Saved successfully' });

      // If this was a new workflow, update the URL
      if (isNew && result) {
        navigate(`/workflows/${result}`, { replace: true });
      }

      setTimeout(() => setSaveStatus(null), 3000);
      return true;
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Failed to save workflow' });
      console.error('Save error:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeploy = async () => {
    if (!workflow?.nodes?.length) {
      setSaveStatus({ type: 'error', message: 'Cannot deploy empty workflow' });
      return;
    }

    try {
      await handleSave();
      Meteor.call('agents.deploy', workflow._id, (error) => {
        if (error) {
          setSaveStatus({ type: 'error', message: 'Failed to deploy workflow' });
        } else {
          setSaveStatus({ type: 'success', message: 'Workflow deployed successfully' });
          updateWorkflow({ status: 'active' });
        }
      });
    } catch (error) {
      console.error('Deploy error:', error);
    }
  };

  const handleRun = () => {
    if (!workflow?.nodes?.length) {
      setSaveStatus({ type: 'error', message: 'Cannot run empty workflow' });
      return;
    }

    // Open test runner modal or execute test run
    console.log('Running workflow test...');
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  const handleNodeEdit = (node) => {
    setEditingNode(node);
    setShowNodeEditor(true);
  };

  const handleNodeUpdate = (nodeId, updates) => {
    if (nodeId === null && updates.id) {
      // This is a new node from drag and drop
      updateWorkflow({
        nodes: [...(workflow.nodes || []), updates]
      });
    } else {
      // This is an update to existing node
      updateWorkflow({
        nodes: workflow.nodes.map(node =>
          node.id === nodeId ? { ...node, ...updates } : node
        )
      });
    }
    setHasUnsavedChanges(true);
  };

  const handleNodeDelete = (nodeId) => {
    updateWorkflow({
      nodes: workflow.nodes.filter(node => node.id !== nodeId),
      connections: workflow.connections.filter(
        conn => conn.source !== nodeId && conn.target !== nodeId
      )
    });
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    setHasUnsavedChanges(true);
  };

  const handleNodeEditorSave = (updates) => {
    if (editingNode) {
      handleNodeUpdate(editingNode.id, updates);
      setShowNodeEditor(false);
      setEditingNode(null);
    }
  };

  const handleVersionRestore = (versionId) => {
    // Reload workflow after version restore
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="workflow-builder-loading">
        <div className="spinner"></div>
        <p>Loading workflow...</p>
      </div>
    );
  }

  // Don't show error if workflow is initialized (handled by useWorkflow hook)
  if (error && !workflow) {
    return (
      <div className="workflow-builder-error">
        <AlertCircle size={48} />
        <h3>Failed to load workflow</h3>
        <p>{error.message}</p>
        <button className="btn btn-primary" onClick={handleClose}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="workflow-builder">
      {/* Header */}
      <div className="workflow-header">
        <div className="header-left">
          <h2>{workflow?.name || 'New Workflow'}</h2>
          <span className={`status-badge ${workflow?.status || 'draft'}`}>
            {workflow?.status || 'Draft'}
          </span>
          {saveStatus && (
            <div className={`save-status ${saveStatus.type}`}>
              {saveStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {saveStatus.message}
            </div>
          )}
        </div>

        <div className="header-right">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(true)}>
            <Settings size={16} />
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              console.log('Version button clicked', { workflow, agentId, showVersionControl });
              setShowVersionControl(true);
            }}
          >
            <GitBranch size={16} />
            Version {workflow?.currentVersion || '1'}
          </button>
          <div className="divider"></div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleRun}
            disabled={!workflow?.nodes?.length}
          >
            <Play size={16} />
            Run
          </button>
          {workflow?.status === 'draft' ? (
            <button
              className="btn btn-success btn-sm"
              onClick={handleDeploy}
              disabled={!workflow?.nodes?.length || isSaving}
            >
              Deploy
            </button>
          ) : (
            <button
              className="btn btn-warning btn-sm"
              onClick={() => console.log('Pause workflow')}
            >
              Pause
            </button>
          )}
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="workflow-content">
        <ComponentsSidebar componentList={getComponentList()} />

        <WorkflowCanvas
          workflow={workflow}
          selectedNode={selectedNode}
          onNodeSelect={handleNodeSelect}
          onNodeUpdate={handleNodeUpdate}
          onNodeDelete={handleNodeDelete}
          onNodeEdit={handleNodeEdit}
          onConnectionAdd={(connection) => {
            updateWorkflow({
              connections: [...(workflow.connections || []), connection]
            });
            setHasUnsavedChanges(true);
          }}
          onConnectionDelete={(connectionId) => {
            updateWorkflow({
              connections: workflow.connections.filter(c => c.id !== connectionId)
            });
            setHasUnsavedChanges(true);
          }}
        />

        {/* Chat Assistant */}
        <button className="chat-fab">
          <MessageSquare size={20} />
        </button>
      </div>

      {/* Node Editor Modal */}
      {showNodeEditor && editingNode && (
        <NodeEditor
          node={editingNode}
          onSave={handleNodeEditorSave}
          onClose={() => {
            setShowNodeEditor(false);
            setEditingNode(null);
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Workflow Settings</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowSettings(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="settings-tabs">
              <button
                className={`tab ${activeSettingsTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('general')}
              >
                <Settings size={16} />
                General
              </button>
              <button
                className={`tab ${activeSettingsTab === 'sharing' ? 'active' : ''}`}
                onClick={() => setActiveSettingsTab('sharing')}
              >
                <Users size={16} />
                Sharing
              </button>
            </div>

            <div className="modal-body">
              {activeSettingsTab === 'general' ? (
                <div className="general-settings">
                  <div className="form-group">
                    <label>Workflow Name</label>
                    <input
                      type="text"
                      value={workflow?.name || ''}
                      onChange={(e) => {
                        updateWorkflow({ name: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      value={workflow?.description || ''}
                      onChange={(e) => {
                        updateWorkflow({ description: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      placeholder="Comma separated tags"
                      value={workflow?.tags?.join(', ') || ''}
                      onChange={(e) => {
                        updateWorkflow({
                          tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        });
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <React.Suspense fallback={<div>Loading...</div>}>
                  <SharingSettings
                    workflowId={workflow?._id || agentId}
                    ownerId={workflow?.ownerId || Meteor.userId()}
                  />
                </React.Suspense>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSettings(false)}>
                Close
              </button>
              {activeSettingsTab === 'general' && (
                <button className="btn btn-primary" onClick={() => {
                  handleSave();
                  setShowSettings(false);
                }}>
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Version Control Modal */}
      {showVersionControl && (
        <React.Suspense fallback={
          <div className="modal-backdrop">
            <div className="modal-container">
              <div className="spinner"></div>
            </div>
          </div>
        }>
          <VersionControlModal
            workflowId={workflow?._id || agentId}
            currentVersion={workflow?.currentVersion || 1}
            onClose={() => setShowVersionControl(false)}
            onRestore={handleVersionRestore}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default WorkflowBuilder;
