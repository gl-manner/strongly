import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AgentList from './components/AgentList/AgentList';
import WorkflowBuilder from './components/WorkflowBuilder/WorkflowBuilder';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import './AgentWorkflow.scss';

const AgentWorkflow = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    // Determine view mode based on URL
    if (agentId || location.pathname.includes('/new')) {
      setViewMode('builder');
    } else {
      setViewMode('list');
    }
  }, [agentId, location]);

  const handleAgentSelect = (agent) => {
    navigate(`/agent-workflow/${agent._id}`);
  };

  const handleCreateNew = () => {
    navigate('/agent-workflow/new');
  };

  const handleClose = () => {
    navigate('/agent-workflow');
  };

  // Check if we're creating a new workflow
  const isNewWorkflow = location.pathname.includes('/new') || agentId === 'new';

  return (
    <ErrorBoundary>
      <div className="agent-workflow-container">
        {viewMode === 'list' ? (
          <AgentList
            onSelectAgent={handleAgentSelect}
            onCreateNew={handleCreateNew}
          />
        ) : (
          <WorkflowBuilder
            agentId={isNewWorkflow ? null : agentId}
            isNew={isNewWorkflow}
            onClose={handleClose}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AgentWorkflow;
