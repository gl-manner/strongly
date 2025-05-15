// /imports/ui/pages/AIGateway/AIGateway.jsx
import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import feather from 'feather-icons';
import './AIGateway.scss';
import { LLMsCollection } from '/imports/api/llms/LLMsCollection';

export const AIGateway = () => {
  const [activeTab, setActiveTab] = useState('all');

  const { user, loading, llms, error } = useTracker(() => {
    console.log("AIGateway tracker running");
    try {
      // First, check if user is logged in without additional subscriptions
      const currentUser = Meteor.user();
      if (!currentUser) {
        console.log("User not logged in yet");
        return {
          user: null,
          llms: [],
          loading: true,
          error: null
        };
      }

      // Try to subscribe to llms collection
      const llmsHandle = Meteor.subscribe('llms');

      console.log("LLMs subscription status:", llmsHandle.ready());

      return {
        user: currentUser,
        llms: LLMsCollection.find({}).fetch(),
        loading: !llmsHandle.ready(),
        error: null
      };
    } catch (error) {
      console.error("Error in tracker:", error);
      return {
        user: Meteor.user(),
        llms: [],
        loading: false,
        error: error.message
      };
    }
  }, []);

  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  if (loading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Show error if there was a subscription error
  if (error) {
    return (
      <div className="alert alert-danger">
        <h4>Error Loading Data</h4>
        <p>{error}</p>
        <p>Please check your server console for details.</p>
      </div>
    );
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const filteredLLMs = activeTab === 'all'
    ? llms
    : llms.filter(llm => llm.type === activeTab);

  return (
    <div className="ai-gateway">
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">AI Gateway</h4>
        </div>
      </div>

      {/* AI Gateway Options */}
      <div className="row">
        <div className="col-md-4 mb-4">
          <Link to="/operations/ai-gateway/self-hosted" className="text-decoration-none">
            <div className="card gateway-option">
              <div className="card-body text-center">
                <i data-feather="server" className="mb-3"></i>
                <h5 className="card-title">Self Hosted AI</h5>
                <p className="card-text">Deploy and manage your own AI models in Kubernetes</p>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4 mb-4">
          <Link to="/operations/ai-gateway/third-party" className="text-decoration-none">
            <div className="card gateway-option">
              <div className="card-body text-center">
                <i data-feather="globe" className="mb-3"></i>
                <h5 className="card-title">Third Party AI</h5>
                <p className="card-text">Connect to external AI services with standardized interfaces</p>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4 mb-4">
          <Link to="/operations/ai-gateway/traditional" className="text-decoration-none">
            <div className="card gateway-option">
              <div className="card-body text-center">
                <i data-feather="cpu" className="mb-3"></i>
                <h5 className="card-title">Traditional AI</h5>
                <p className="card-text">Legacy AI and machine learning systems</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* LLMs Table */}
      <div className="row mt-4">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="card-title mb-0">AI Models</h6>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleTabChange('all')}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeTab === 'self-hosted' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleTabChange('self-hosted')}
                  >
                    Self Hosted
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeTab === 'third-party' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleTabChange('third-party')}
                  >
                    Third Party
                  </button>
                </div>
              </div>

              {filteredLLMs.length === 0 ? (
                <div className="text-center py-5">
                  <i data-feather="database" style={{ width: '48px', height: '48px', strokeWidth: 1 }}></i>
                  <p className="mt-3">No AI models found</p>
                  <div className="mt-3">
                    <Link to="/operations/ai-gateway/self-hosted" className="btn btn-primary me-2">Add Self-hosted Model</Link>
                    <Link to="/operations/ai-gateway/third-party" className="btn btn-outline-primary">Add Third-party Model</Link>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Parameters</th>
                        <th>Last Used</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLLMs.map((llm) => (
                        <tr key={llm._id}>
                          <td>{llm.name}</td>
                          <td>
                            <span className={`badge ${llm.type === 'self-hosted' ? 'bg-info' : 'bg-warning'}`}>
                              {llm.type === 'self-hosted' ? 'Self Hosted' : 'Third Party'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${llm.status === 'active' ? 'bg-success' : llm.status === 'deploying' ? 'bg-warning' : 'bg-danger'}`}>
                              {llm.status === 'active' ? 'Active' : llm.status === 'deploying' ? 'Deploying' : 'Inactive'}
                            </span>
                          </td>
                          <td>{llm.parameters}</td>
                          <td>{llm.lastUsed ? new Date(llm.lastUsed).toLocaleString() : 'Never'}</td>
                          <td>
                            <div className="d-flex">
                              <button className="btn btn-sm btn-outline-primary me-1" title="Edit">
                                <i data-feather="edit-2" style={{ width: '16px', height: '16px' }}></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" title="Delete">
                                <i data-feather="trash-2" style={{ width: '16px', height: '16px' }}></i>
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
    </div>
  );
};

export default AIGateway;
