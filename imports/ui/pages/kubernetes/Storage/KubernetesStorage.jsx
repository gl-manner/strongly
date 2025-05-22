// /imports/ui/pages/kubernetes/Storage/KubernetesStorage.jsx
import React, { useEffect } from 'react';
import feather from 'feather-icons';

export const KubernetesStorage = () => {
  useEffect(() => {
    feather.replace();
  }, []);

  return (
    <div className="kubernetes-storage">
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">Kubernetes Storage</h4>
        </div>
      </div>
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body text-center py-5">
              <i data-feather="database" style={{ width: '48px', height: '48px', strokeWidth: 1 }} className="mb-3"></i>
              <h5 className="mb-3">Storage Management Coming Soon</h5>
              <p className="mb-4">The Kubernetes Storage management interface is currently under development.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};