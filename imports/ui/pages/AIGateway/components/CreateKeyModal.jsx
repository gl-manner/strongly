import React, { useState, useEffect } from 'react';
import feather from 'feather-icons';
import { LLMsCollection } from '/imports/api/ai-gateway/LLMsCollection';
import { useTracker } from 'meteor/react-meteor-data';

const CreateKeyModal = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    expiresIn: '30',
    allowedModels: [],
    allowedIps: '',
    hasModelRestrictions: false,
    hasIpRestrictions: false
  });

  // Load models to restrict API key to specific ones
  const { models } = useTracker(() => {
    return {
      models: LLMsCollection.find({ status: 'active' }).fetch() || []
    };
  }, []);

  // Initialize feather icons
  useEffect(() => {
    feather.replace();
  }, [formData.hasModelRestrictions, formData.hasIpRestrictions]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleModelToggle = (modelId) => {
    if (formData.allowedModels.includes(modelId)) {
      setFormData({
        ...formData,
        allowedModels: formData.allowedModels.filter(id => id !== modelId)
      });
    } else {
      setFormData({
        ...formData,
        allowedModels: [...formData.allowedModels, modelId]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const apiKeyData = {
      name: formData.name,
      expiresIn: formData.expiresIn === 'never' ? null : parseInt(formData.expiresIn, 10),
      allowedModels: formData.hasModelRestrictions ? formData.allowedModels : [],
      allowedIps: formData.hasIpRestrictions ? formData.allowedIps.split(',').map(ip => ip.trim()).filter(ip => ip) : []
    };

    onSubmit(apiKeyData);
  };

  const isFormValid = () => {
    if (!formData.name) return false;
    if (formData.hasModelRestrictions && formData.allowedModels.length === 0) return false;
    if (formData.hasIpRestrictions && !formData.allowedIps) return false;
    return true;
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create API Key</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">API Key Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Production API Key"
                  required
                />
                <div className="form-text">
                  A descriptive name to identify this API key
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Expiration</label>
                <select
                  className="form-select"
                  name="expiresIn"
                  value={formData.expiresIn}
                  onChange={handleInputChange}
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                  <option value="never">Never expires</option>
                </select>
                <div className="form-text">
                  After expiration, the key will no longer be valid
                </div>
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="hasModelRestrictions"
                  name="hasModelRestrictions"
                  checked={formData.hasModelRestrictions}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="hasModelRestrictions">
                  Restrict to specific models
                </label>
              </div>

              {formData.hasModelRestrictions && (
                <div className="mb-3 border rounded p-3 bg-light">
                  <label className="form-label">Select Allowed Models <span className="text-danger">*</span></label>

                  {models.length === 0 ? (
                    <div className="alert alert-warning">
                      <i data-feather="alert-circle" className="icon-sm me-2"></i>
                      No active models found. Please activate at least one model first.
                    </div>
                  ) : (
                    <div className="row">
                      {models.map(model => (
                        <div key={model._id} className="col-md-6 mb-2">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`model-${model._id}`}
                              checked={formData.allowedModels.includes(model._id)}
                              onChange={() => handleModelToggle(model._id)}
                            />
                            <label className="form-check-label" htmlFor={`model-${model._id}`}>
                              {model.name}
                              <span className="ms-1 badge bg-light text-dark">{model.type}</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="form-text mt-2">
                    If no models are selected, this key won't be able to access any models
                  </div>
                </div>
              )}

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="hasIpRestrictions"
                  name="hasIpRestrictions"
                  checked={formData.hasIpRestrictions}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="hasIpRestrictions">
                  Restrict to specific IP addresses
                </label>
              </div>

              {formData.hasIpRestrictions && (
                <div className="mb-3">
                  <label className="form-label">Allowed IP Addresses <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="allowedIps"
                    value={formData.allowedIps}
                    onChange={handleInputChange}
                    placeholder="e.g., 192.168.1.1, 10.0.0.0/24"
                    required={formData.hasIpRestrictions}
                  />
                  <div className="form-text">
                    Comma-separated list of IP addresses or CIDR blocks
                  </div>
                </div>
              )}

              <div className="alert alert-info">
                <div className="d-flex">
                  <i data-feather="info" className="icon-sm me-2 flex-shrink-0"></i>
                  <div>
                    <strong>Important:</strong> You will only be shown the API key once after creation.
                    Make sure to copy it and store it securely.
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isFormValid()}
              >
                <i data-feather="key" className="icon-sm me-2"></i> Create API Key
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateKeyModal;
