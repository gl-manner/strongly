// /imports/ui/pages/AIGateway/TraditionalAI/TraditionalAI.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import feather from 'feather-icons';
import './TraditionalAI.scss';

export const TraditionalAI = () => {
  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  return (
    <div className="traditional-ai">
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">Traditional AI</h4>
        </div>
        <div>
          <Link to="/operations/ai-gateway" className="btn btn-outline-primary">
            <i data-feather="arrow-left" className="me-2"></i> Back to Gateway
          </Link>
        </div>
      </div>

      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body text-center py-5">
              <i data-feather="cpu" style={{ width: '48px', height: '48px', strokeWidth: 1 }} className="mb-3"></i>
              <h5 className="mb-3">Coming Soon</h5>
              <p className="mb-4">The Traditional AI integration is currently under development.</p>
              <p>This section will include support for:</p>
              <div className="row justify-content-center mt-3">
                <div className="col-md-8">
                  <ul className="list-group list-group-flush text-start">
                    <li className="list-group-item border-0">
                      <i data-feather="check" className="text-success me-2"></i>
                      Rule-based AI systems
                    </li>
                    <li className="list-group-item border-0">
                      <i data-feather="check" className="text-success me-2"></i>
                      Expert systems
                    </li>
                    <li className="list-group-item border-0">
                      <i data-feather="check" className="text-success me-2"></i>
                      Statistical ML models
                    </li>
                    <li className="list-group-item border-0">
                      <i data-feather="check" className="text-success me-2"></i>
                      Custom ML pipelines
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraditionalAI;
