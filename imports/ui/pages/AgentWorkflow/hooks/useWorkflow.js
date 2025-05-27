// imports/ui/pages/AgentWorkflow/hooks/useWorkflow.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

const useWorkflow = (agentId, isNew = false) => {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Use a ref to track if component is mounted
  const isMounted = useRef(true);

  // Ensure agentId is a string
  const normalizedAgentId = agentId ? String(agentId) : null;

  // Initialize with empty workflow for new workflows
  const initializeNewWorkflow = useCallback(() => {
    return {
      _id: null,
      name: 'New Workflow',
      description: '',
      nodes: [],
      connections: [],
      tags: [],
      settings: {},
      status: 'draft',
      currentVersion: 1,
      isDirty: false
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load workflow data
  useEffect(() => {
    // Handle new workflow case
    if (isNew || !normalizedAgentId || normalizedAgentId === 'new') {
      setWorkflow(initializeNewWorkflow());
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    Meteor.call('agents.get', normalizedAgentId, (err, result) => {
      if (!isMounted.current) return;

      if (err) {
        console.error('Error loading workflow:', err);
        // If it's a not-found error, treat it as a new workflow
        if (err.error === 'not-found') {
          setWorkflow(initializeNewWorkflow());
          setError(null);
        } else {
          setError(err);
          setWorkflow(null);
        }
      } else {
        setWorkflow(result);
        setIsDirty(false);
      }
      setLoading(false);
    });
  }, [normalizedAgentId, isNew, initializeNewWorkflow]);

  // Update workflow locally
  const updateWorkflow = useCallback((updates) => {
    setWorkflow(prev => {
      if (!prev) return prev;

      // If updates is a function, call it with previous state
      const newUpdates = typeof updates === 'function' ? updates(prev) : updates;

      return {
        ...prev,
        ...newUpdates,
        isDirty: true
      };
    });
    setIsDirty(true);
  }, []);

  // Save workflow to server
  const saveWorkflow = useCallback(async () => {
    if (!workflow) {
      throw new Error('No workflow to save');
    }

    if (isSaving) {
      console.warn('Save already in progress');
      return;
    }

    setIsSaving(true);
    setError(null);

    return new Promise((resolve, reject) => {
      // Check if this is a new workflow (no _id)
      if (!workflow._id) {
        // Create new workflow
        const dataToCreate = {
          name: workflow.name || 'New Workflow',
          description: workflow.description || '',
          nodes: workflow.nodes || [],
          connections: workflow.connections || [],
          tags: workflow.tags || [],
          settings: workflow.settings || {},
          status: workflow.status || 'draft'
        };

        Meteor.call('agents.create', dataToCreate, (err, result) => {
          if (!isMounted.current) return;

          setIsSaving(false);

          if (err) {
            console.error('Create error:', err);
            setError(err);
            reject(err);
          } else {
            console.log('Workflow created:', result);
            // Update local workflow with the new ID
            setWorkflow(prev => ({ ...prev, _id: result, isDirty: false }));
            setIsDirty(false);
            resolve(result);
          }
        });
      } else {
        // Update existing workflow
        const updates = { ...workflow };
        delete updates._id;
        delete updates.isDirty;
        delete updates.ownerId;
        delete updates.ownerName;
        delete updates.createdAt;
        delete updates.version;
        delete updates.currentVersion;

        const workflowId = String(workflow._id);

        console.log('Updating workflow:', workflowId, updates);

        Meteor.call('agents.update', workflowId, updates, (err, result) => {
          if (!isMounted.current) return;

          setIsSaving(false);

          if (err) {
            console.error('Save error:', err);
            setError(err);
            reject(err);
          } else {
            console.log('Save successful:', result);
            setIsDirty(false);
            setWorkflow(prev => ({ ...prev, isDirty: false }));
            resolve(result);
          }
        });
      }
    });
  }, [workflow, isSaving]);

  // Create new workflow
  const createWorkflow = useCallback(async (workflowData) => {
    setError(null);

    return new Promise((resolve, reject) => {
      // Ensure required fields
      const dataToCreate = {
        name: 'New Workflow',
        description: '',
        nodes: [],
        connections: [],
        tags: [],
        settings: {},
        ...workflowData
      };

      Meteor.call('agents.create', dataToCreate, (err, result) => {
        if (!isMounted.current) return;

        if (err) {
          console.error('Create error:', err);
          setError(err);
          reject(err);
        } else {
          console.log('Workflow created:', result);
          resolve(result);
        }
      });
    });
  }, []);

  // Delete workflow
  const deleteWorkflow = useCallback(async () => {
    if (!workflow || !workflow._id) {
      throw new Error('No workflow to delete');
    }

    setError(null);
    const workflowId = String(workflow._id);

    return new Promise((resolve, reject) => {
      Meteor.call('agents.remove', workflowId, (err, result) => {
        if (!isMounted.current) return;

        if (err) {
          console.error('Delete error:', err);
          setError(err);
          reject(err);
        } else {
          console.log('Workflow deleted:', result);
          resolve(result);
        }
      });
    });
  }, [workflow]);

  // Deploy workflow
  const deployWorkflow = useCallback(async () => {
    if (!workflow || !workflow._id) {
      throw new Error('No workflow to deploy');
    }

    setError(null);
    const workflowId = String(workflow._id);

    return new Promise((resolve, reject) => {
      Meteor.call('agents.deploy', workflowId, (err, result) => {
        if (!isMounted.current) return;

        if (err) {
          console.error('Deploy error:', err);
          setError(err);
          reject(err);
        } else {
          console.log('Workflow deployed:', result);
          // Update local state to reflect deployed status
          updateWorkflow({ status: 'active' });
          resolve(result);
        }
      });
    });
  }, [workflow, updateWorkflow]);

  // Pause workflow
  const pauseWorkflow = useCallback(async () => {
    if (!workflow || !workflow._id) {
      throw new Error('No workflow to pause');
    }

    setError(null);
    const workflowId = String(workflow._id);

    return new Promise((resolve, reject) => {
      Meteor.call('agents.pause', workflowId, (err, result) => {
        if (!isMounted.current) return;

        if (err) {
          console.error('Pause error:', err);
          setError(err);
          reject(err);
        } else {
          console.log('Workflow paused:', result);
          // Update local state to reflect paused status
          updateWorkflow({ status: 'paused' });
          resolve(result);
        }
      });
    });
  }, [workflow, updateWorkflow]);

  // Test workflow
  const testWorkflow = useCallback(async (testData = {}) => {
    if (!workflow || !workflow._id) {
      throw new Error('No workflow to test');
    }

    setError(null);
    const workflowId = String(workflow._id);

    return new Promise((resolve, reject) => {
      Meteor.call('agents.test', workflowId, testData, (err, result) => {
        if (!isMounted.current) return;

        if (err) {
          console.error('Test error:', err);
          setError(err);
          reject(err);
        } else {
          console.log('Test results:', result);
          resolve(result);
        }
      });
    });
  }, [workflow]);

  // Duplicate workflow
  const duplicateWorkflow = useCallback(async () => {
    if (!workflow || !workflow._id) {
      throw new Error('No workflow to duplicate');
    }

    setError(null);
    const workflowId = String(workflow._id);

    return new Promise((resolve, reject) => {
      Meteor.call('agents.duplicate', workflowId, (err, result) => {
        if (!isMounted.current) return;

        if (err) {
          console.error('Duplicate error:', err);
          setError(err);
          reject(err);
        } else {
          console.log('Workflow duplicated:', result);
          resolve(result);
        }
      });
    });
  }, [workflow]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reload workflow from server
  const reloadWorkflow = useCallback(() => {
    if (!normalizedAgentId) return;

    setLoading(true);
    setError(null);

    Meteor.call('agents.get', normalizedAgentId, (err, result) => {
      if (!isMounted.current) return;

      if (err) {
        console.error('Error reloading workflow:', err);
        setError(err);
      } else {
        setWorkflow(result);
        setIsDirty(false);
      }
      setLoading(false);
    });
  }, [normalizedAgentId]);

  return {
    workflow,
    loading,
    error,
    isDirty,
    isSaving,
    updateWorkflow,
    saveWorkflow,
    createWorkflow,
    deleteWorkflow,
    deployWorkflow,
    pauseWorkflow,
    testWorkflow,
    duplicateWorkflow,
    clearError,
    reloadWorkflow
  };
};

export default useWorkflow;
