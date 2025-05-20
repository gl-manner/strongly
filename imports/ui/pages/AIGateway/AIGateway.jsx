import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link, useHistory } from 'react-router-dom';
import feather from 'feather-icons';
import { toast } from 'react-toastify';
import './AIGateway.scss';
import { LLMsCollection } from '/imports/api/ai-gateway/LLMsCollection';

// some components are missing, will add this later
// import AIGatewayStats from './components/AIGatewayStats';
// import ModelList from './components/ModelList';
// import LoadingSpinner from '/imports/ui/components/LoadingSpinner';
// import ErrorAlert from '/imports/ui/components/ErrorAlert';

export const AIGateway = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const history = useHistory();

  // Load models with useTracker
  const { user, loading, llms, error } = useTracker(() => {
    try {
      // Subscribe to models
      const llmsHandle = Meteor.subscribe('allLLMs');

      return {
        user: Meteor.user(),
        llms: LLMsCollection.find({}, { sort: { createdAt: -1 } }).fetch(),
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

  // Load usage statistics
  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        // Simulate loading stats data - in a real app, this would be a Meteor method call
        // Meteor.call('aiGateway.getStats', (error, result) => {...})

        // Mock data for demonstration
        setTimeout(() => {
          setStatsData({
            models: {
              total: llms.length,
              selfHosted: llms.filter(m => m.type === 'self-hosted').length,
              thirdParty: llms.filter(m => m.type === 'third-party').length,
              active: llms.filter(m => m.status === 'active').length
            },
            usage: {
              requestsToday: 1250,
              requestsThisWeek: 8750,
              tokensToday: 125000,
              averageLatency: 350 // ms
            }
          });
          setLoadingStats(false);
        }, 800);
      } catch (error) {
        console.error("Error loading stats:", error);
        setLoadingStats(false);
      }
    };

    if (!loading && llms) {
      loadStats();
    }
  }, [loading, llms]);

  // Initialize feather icons when component mounts or updates
  useEffect(() => {
    feather.replace();
  }, [loading, llms, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const filteredLLMs = activeTab === 'all'
    ? llms
    : llms.filter(llm => llm.type === activeTab);

  const handleModelAction = (action, model) => {
    switch (action) {
      case 'edit':
        if (model.type === 'self-hosted') {
          history.push(`/operations/ai-gateway/self-hosted/edit/${model._id}`);
        } else {
          history.push(`/operations/ai-gateway/third-party/edit/${model._id}`);
        }
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete the model "${model.name}"?`)) {
          Meteor.call('aiGateway.deleteModel', model._id, (error) => {
            if (error) {
              toast.error(`Error deleting model: ${error.message}`);
            } else {
              toast.success('Model deleted successfully');
            }
          });
        }
        break;
      case 'restart':
        Meteor.call('aiGateway.restartModel', model._id, (error) => {
          if (error) {
            toast.error(`Error restarting model: ${error.message}`);
          } else {
            toast.success('Model restart initiated');
          }
        });
        break;
      default:
        break;
    }
  };

  if (loading) {
    // return <LoadingSpinner message="Loading AI Gateway..." />;
  }

  if (error) {
    // return <ErrorAlert title="Error Loading Data" message={error} />;
  }

  return (
    <div className="ai-gateway">
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">AI Gateway</h4>
        </div>
        <div className="d-flex">
          <button
            className="btn btn-outline-primary me-2"
            onClick={() => history.push('/operations')}
          >
            <i data-feather="home" className="icon-sm me-2"></i> Operations
          </button>
          <div className="dropdown">
            <button
              className="btn btn-primary dropdown-toggle"
              type="button"
              id="addModelDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i data-feather="plus" className="icon-sm me-2"></i> Add Model
            </button>
            <ul className="dropdown-menu" aria-labelledby="addModelDropdown">
              <li>
                <Link className="dropdown-item" to="/operations/ai-gateway/self-hosted">
                  <i data-feather="server" className="icon-sm me-2"></i> Self-Hosted Model
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/operations/ai-gateway/third-party">
                  <i data-feather="globe" className="icon-sm me-2"></i> Third-Party Model
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      {/* <AIGatewayStats data={statsData} loading={loadingStats} /> */}

      {/* AI Gateway Options */}
      <div className="row mb-4">
        <div className="col-md-4 mb-4">
          <Link to="/operations/ai-gateway/self-hosted" className="text-decoration-none">
            <div className="card gateway-option">
              <div className="card-body text-center">
                <i data-feather="server" className="mb-3"></i>
                <h5 className="card-title">Self Hosted AI</h5>
                <p className="card-text">Deploy and manage your own AI models in Kubernetes</p>
                <div className="mt-3">
                  <span className="badge bg-primary">
                    {llms.filter(m => m.type === 'self-hosted').length} Models
                  </span>
                </div>
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
                <div className="mt-3">
                  <span className="badge bg-info">
                    {llms.filter(m => m.type === 'third-party').length} Models
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4 mb-4">
          <Link to="/operations/ai-gateway/api-keys" className="text-decoration-none">
            <div className="card gateway-option">
              <div className="card-body text-center">
                <i data-feather="key" className="mb-3"></i>
                <h5 className="card-title">API Keys</h5>
                <p className="card-text">Manage API keys for secure access to your models</p>
                <div className="mt-3">
                  <span className="badge bg-secondary">
                    Secure Access
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* LLMs Table */}
      <div className="row">
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

              {/* <ModelList
                models={filteredLLMs}
                onModelAction={handleModelAction}
                emptyStateType={activeTab}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGateway;
