import React from 'react';
import feather from 'feather-icons';

const AIGatewayStats = ({ data, loading }) => {
  // Initialize feather icons
  React.useEffect(() => {
    feather.replace();
  }, [data, loading]);

  if (loading || !data) {
    return (
      <div className="row mb-4">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Usage Statistics</h6>
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading statistics...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row mb-4">
      <div className="col-md-6 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h6 className="card-title">Models Overview</h6>
            {/* Solution 1: Using flexbox with equal heights */}
            <div className="row d-flex">
              <div className="col-6 col-md-3 mb-3 d-flex">
                <div className="d-flex flex-column align-items-center justify-content-top p-3 rounded bg-light w-100" style={{ minHeight: '100px' }}>
                  <h3 className="mb-1">{data.models.total}</h3>
                  <p className="text-muted mb-0 text-center">Total</p>
                </div>
              </div>
              <div className="col-6 col-md-3 mb-3 d-flex">
                <div className="d-flex flex-column align-items-center justify-content-top p-3 rounded bg-light w-100" style={{ minHeight: '100px' }}>
                  <h3 className="mb-1">{data.models.selfHosted}</h3>
                  <p className="text-muted mb-0 text-center">Self Hosted</p>
                </div>
              </div>
              <div className="col-6 col-md-3 mb-3 d-flex">
                <div className="d-flex flex-column align-items-center justify-content-top p-3 rounded bg-light w-100" style={{ minHeight: '100px' }}>
                  <h3 className="mb-1">{data.models.thirdParty}</h3>
                  <p className="text-muted mb-0 text-center">Third Party</p>
                </div>
              </div>
              <div className="col-6 col-md-3 mb-3 d-flex">
                <div className="d-flex flex-column align-items-center justify-content-top p-3 rounded bg-light w-100" style={{ minHeight: '100px' }}>
                  <h3 className="mb-1">{data.models.active}</h3>
                  <p className="text-muted mb-0 text-center">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-6 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h6 className="card-title">Usage Metrics</h6>
            <div className="row">
              <div className="col-6 col-md-3 mb-3">
                <div className="d-flex flex-column p-2">
                  <p className="text-muted mb-1">Requests Today</p>
                  <h4 className="mb-0">{data.usage.requestsToday.toLocaleString()}</h4>
                </div>
              </div>
              <div className="col-6 col-md-3 mb-3">
                <div className="d-flex flex-column p-2">
                  <p className="text-muted mb-1">Weekly Requests</p>
                  <h4 className="mb-0">{data.usage.requestsThisWeek.toLocaleString()}</h4>
                </div>
              </div>
              <div className="col-6 col-md-3 mb-3">
                <div className="d-flex flex-column p-2">
                  <p className="text-muted mb-1">Tokens Today</p>
                  <h4 className="mb-0">{data.usage.tokensToday.toLocaleString()}</h4>
                </div>
              </div>
              <div className="col-6 col-md-3 mb-3">
                <div className="d-flex flex-column p-2">
                  <p className="text-muted mb-1">Avg. Latency</p>
                  <h4 className="mb-0">{data.usage.averageLatency} ms</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGatewayStats;
