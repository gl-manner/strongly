import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Agents } from '/imports/api/agents/collection';
import EmptyState from '/imports/ui/components/common/EmptyState/EmptyState';
import LoadingState from '/imports/ui/components/common/LoadingState/LoadingState';
import {
  Plus, Search, MoreVertical, Edit, Trash2, Copy,
  Play, Pause, Archive, Clock, User, Filter
} from 'lucide-react';
import './AgentList.scss';

const AgentList = ({ onSelectAgent, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('lastUpdated');

  const { agents, isLoading } = useTracker(() => {
    // Check if Agents collection exists
    if (!Agents) {
      console.error('Agents collection is not defined');
      return { agents: [], isLoading: false };
    }

    const handle = Meteor.subscribe('agents');

    let query = {};
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' };
    }
    if (filterStatus !== 'all') {
      query.status = filterStatus;
    }

    const sort = {};
    sort[sortBy] = -1;

    return {
      agents: Agents.find(query, { sort }).fetch(),
      isLoading: !handle.ready()
    };
  }, [searchTerm, filterStatus, sortBy]);

  const handleCreateAgent = () => {
    // If onCreateNew prop is provided, use it
    if (onCreateNew) {
      onCreateNew();
    } else {
      // Otherwise, create a new agent directly
      Meteor.call('agents.create', {
        name: 'New Workflow',
        description: 'A new workflow description',
        status: 'draft'
      }, (error, newAgentId) => {
        if (error) {
          console.error('Error creating agent:', error);
        } else if (newAgentId && onSelectAgent) {
          // Select the newly created agent
          onSelectAgent({ _id: newAgentId });
        }
      });
    }
  };

  const handleDelete = (agentId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this workflow?')) {
      Meteor.call('agents.remove', agentId, (error) => {
        if (error) {
          console.error('Error deleting agent:', error);
        }
      });
    }
  };

  const handleDuplicate = (agent, e) => {
    e.stopPropagation();
    Meteor.call('agents.duplicate', agent._id, (error, newAgentId) => {
      if (error) {
        console.error('Error duplicating agent:', error);
      } else {
        onSelectAgent({ _id: newAgentId });
      }
    });
  };

  const handleStatusChange = (agentId, newStatus, e) => {
    e.stopPropagation();
    Meteor.call('agents.updateStatus', agentId, newStatus, (error) => {
      if (error) {
        console.error('Error updating status:', error);
      }
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'badge-success', icon: Play, text: 'Active' },
      paused: { class: 'badge-warning', icon: Pause, text: 'Paused' },
      draft: { class: 'badge-secondary', icon: Edit, text: 'Draft' },
      archived: { class: 'badge-info', icon: Archive, text: 'Archived' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`badge ${config.class}`}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (isLoading) {
    return <LoadingState message="Loading workflows..." />;
  }

  return (
    <div className="agent-list">
      {/* Header */}
      <div className="agent-list-header">
        <div className="breadcrumb">
          <span>Workflows</span>
          <span className="separator">/</span>
          <span className="current">Builder</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="agent-list-content">
        <div className="content-header">
          <div>
            <h1>Workflow Builder</h1>
            <p>Design and deploy autonomous AI enabled workflows to handle complex tasks and interactions</p>
          </div>
          <button className="btn btn-primary" onClick={handleCreateAgent}>
            <Plus size={16} />
            New Workflow
          </button>
        </div>

        {/* Filters and Search */}
        <div className="content-filters">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <Filter size={16} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="lastUpdated">Last Updated</option>
                <option value="name">Name</option>
                <option value="createdAt">Created Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Agents Table */}
        {agents.length === 0 ? (
          <EmptyState
            icon={<Plus size={48} />}
            title="No workflows yet"
            description="Create your first AI workflow to get started"
            action={
              <button className="btn btn-primary" onClick={handleCreateAgent}>
                <Plus size={16} />
                Create Workflow
              </button>
            }
          />
        ) : (
          <div className="agents-table-container">
            <table className="agents-table">
              <thead>
                <tr>
                  <th>Workflow Name</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr
                    key={agent._id}
                    onClick={() => onSelectAgent(agent)}
                    className="clickable"
                  >
                    <td>
                      <div className="agent-name">
                        <span className="name">{agent.name}</span>
                        {agent.description && (
                          <span className="description">{agent.description}</span>
                        )}
                      </div>
                    </td>
                    <td>{getStatusBadge(agent.status)}</td>
                    <td>
                      <div className="owner-info">
                        <User size={14} />
                        <span>{agent.ownerName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <Clock size={14} />
                        <span>{formatDate(agent.lastUpdated)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="actions-dropdown" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-sm btn-icon dropdown-trigger">
                          <MoreVertical size={16} />
                        </button>
                        <div className="dropdown-menu">
                          <button
                            className="dropdown-item"
                            onClick={() => onSelectAgent(agent)}
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={(e) => handleDuplicate(agent, e)}
                          >
                            <Copy size={14} />
                            Duplicate
                          </button>
                          {agent.status === 'active' ? (
                            <button
                              className="dropdown-item"
                              onClick={(e) => handleStatusChange(agent._id, 'paused', e)}
                            >
                              <Pause size={14} />
                              Pause
                            </button>
                          ) : agent.status === 'paused' ? (
                            <button
                              className="dropdown-item"
                              onClick={(e) => handleStatusChange(agent._id, 'active', e)}
                            >
                              <Play size={14} />
                              Activate
                            </button>
                          ) : null}
                          <button
                            className="dropdown-item"
                            onClick={(e) => handleStatusChange(agent._id, 'archived', e)}
                          >
                            <Archive size={14} />
                            Archive
                          </button>
                          <div className="dropdown-divider"></div>
                          <button
                            className="dropdown-item danger"
                            onClick={(e) => handleDelete(agent._id, e)}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
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
  );
};

export default AgentList;
