import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link, useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import feather from 'feather-icons';
import { LLMsCollection } from '/imports/api/ai-gateway/LLMsCollection';
import LoadingSpinner from '/imports/ui/components/LoadingSpinner';
import ErrorAlert from '/imports/ui/components/ErrorAlert';
import ModelConfigCard from './components/ModelConfigCard';

export const CustomModelForm = () => {
  const history = useHistory();
  const { modelId } = useParams();
  const isEditing = !!modelId;

  // Model configuration state
  const [formData, setFormData] = useState({
    name: '',
    provider: 'kubernetes',
    modelType: 'CHAT',
    repoUrl: '',
    quantization: '16bit',
    modelRevision: 'main',
    hardwareTier: 'standard',
    replicas: 1,
    maxTokens: 2048,
    allowedUsers: 'all',
    tags: [],
    customParameters: '{}'
  });

  // Form state
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load model data if editing
  const { loading, model, error } = useTracker(() => {
    if (!isEditing) {
      return { loading: false, model: null, error: null };
    }

    try {
      const modelHandle = Meteor.subscribe('modelDetail', modelId);

      return {
        loading: !modelHandle.ready(),
        model: LLMsCollection.findOne(modelId),
        error: null
      };
    } catch (error) {
      console.error("Error loading model:", error);
      return {
        loading: false,
        model: null,
        error: error.message
      };
    }
  }, [modelId]);

  // Load model data into form when available
  useEffect(() => {
    if (model && !loading) {
      setFormData({
        name: model.name || '',
        provider: 'kubernetes',
        modelType: model.modelType || 'CHAT',
        repoUrl: model.modelId || '',
        quantization: model.quantization || '16bit',
        modelRevision: model.modelRevision || 'main',
        hardwareTier: model.hardwareTier || 'standard',
        replicas: model.replicas || 1,
        maxTokens: model.parameters || 2048,
        allowedUsers: model.allowedUsers || 'all',
        tags: model.tags || [],
        customParameters: model.customParameters ? JSON.stringify(model.customParameters) : '{}'
      });
    }
  }, [model, loading]);

  // Initialize feather icons
  useEffect(() => {
    feather.replace();
  }, [loading, showAdvanced]);

  // Form validation
  useEffect(() => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.repoUrl.trim()) {
      errors.repoUrl = 'Model repository URL is required';
    }

    // Validate JSON format if not empty
    if (formData.customParameters && formData.customParameters !== '{}') {
      try {
        JSON.parse(formData.customParameters);
      } catch (e) {
        errors.customParameters = 'Invalid JSON format';
      }
    }

    setValidationErrors(errors);
    setIsValid(Object.keys(errors).length === 0);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTagsChange = (tags) => {
    setFormData({
      ...formData,
      tags
    });
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value, 10)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValid) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setIsSubmitting(true);

    // Prepare model data for API
    const modelData = {
      modelId: isEditing ? modelId : undefined,
      name: formData.name,
      modelSource: 'custom',
      modelUrl: formData.repoUrl,
      modelType: formData.modelType,
      quantization: formData.quantization,
      modelRevision: formData.modelRevision,
      hardwareTier: formData.hardwareTier,
      replicas: formData.replicas,
      maxTokens: formData.maxTokens,
      allowedUsers: formData.allowedUsers,
      tags: formData.tags,
      customParameters: formData.customParameters
    };

    // Call appropriate method based on whether we're creating or updating
    const methodName = isEditing ? 'aiGateway.updateModel' : 'aiGateway.deployModel';

    Meteor.call(methodName, modelData, (error, result) => {
      setIsSubmitting(false);

      if (error) {
        console.error(`Error ${isEditing ? 'updating' : 'deploying'} model:`, error);
        toast.error(`Failed: ${error.message}`);
      } else {
        toast.success(`Model ${isEditing ? 'updated' : 'deployed'} successfully!`);
        history.push('/operations/ai-gateway/self-hosted');
      }
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading model details..." />;
  }

  if (isEditing && !model && !loading) {
    return <ErrorAlert title="Model Not Found" message="The requested model could not be found." />;
  }

  if (error) {
    return <ErrorAlert title="Error Loading Model" message={error} />;
  }

  return (
    <div className="custom-model-form">
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">{isEditing ? 'Edit' : 'Add Custom'} Self-Hosted Model</h4>
        </div>
        <div>
          <Link to="/operations/ai-gateway/self-hosted" className="btn btn-outline-primary me-2">
            <i data-feather="arrow-left" className="icon-sm me-2"></i> Back to Self-Hosted AI
          </Link>
        </div>
      </div>

      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-8">
                    <h6 className="card-title mb-4">Model Information</h6>

                    <div className="mb-3">
                      <label className="form-label">Model Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Llama-3-8B Custom"
                        required
                      />
                      {validationErrors.name && (
                        <div className="invalid-feedback">{validationErrors.name}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Repository URL <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.repoUrl ? 'is-invalid' : ''}`}
                        name="repoUrl"
                        value={formData.repoUrl}
                        onChange={handleInputChange}
                        placeholder="e.g., meta-llama/Meta-Llama-3-8B"
                        required
                      />
                      {validationErrors.repoUrl && (
                        <div className="invalid-feedback">{validationErrors.repoUrl}</div>
                      )}
                      <div className="form-text">
                        Enter either a Hugging Face model ID or a direct repository URL
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Model Type</label>
                        <select
                          className="form-select"
                          name="modelType"
                          value={formData.modelType}
                          onChange={handleInputChange}
                        >
                          <option value="CHAT">Chat (LLM)</option>
                          <option value="COMPLETION">Completion</option>
                          <option value="EMBEDDING">Embedding</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Quantization</label>
                        <select
                          className="form-select"
                          name="quantization"
                          value={formData.quantization}
                          onChange={handleInputChange}
                        >
                          <option value="16bit">16-bit (No Quantization)</option>
                          <option value="8bit">8-bit Quantization</option>
                          <option value="4bit">4-bit Quantization</option>
                        </select>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Hardware Tier</label>
                        <select
                          className="form-select"
                          name="hardwareTier"
                          value={formData.hardwareTier}
                          onChange={handleInputChange}
                        >
                          <option value="basic">Basic (2 vCPU, 8GB RAM)</option>
                          <option value="standard">Standard (4 vCPU, 16GB RAM)</option>
                          <option value="performance">Performance (8 vCPU, 32GB RAM)</option>
                          <option value="gpu-small">GPU Small (4 vCPU, 16GB RAM, 1 GPU)</option>
                          <option value="gpu-large">GPU Large (8 vCPU, 32GB RAM, 1 GPU)</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Replicas</label>
                        <input
                          type="number"
                          className="form-control"
                          name="replicas"
                          min="1"
                          max="10"
                          value={formData.replicas}
                          onChange={handleNumericChange}
                        />
                        <div className="form-text">
                          Number of model instances to deploy
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Max Tokens</label>
                        <input
                          type="number"
                          className="form-control"
                          name="maxTokens"
                          min="512"
                          max="16384"
                          value={formData.maxTokens}
                          onChange={handleNumericChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Access Control</label>
                        <select
                          className="form-select"
                          name="allowedUsers"
                          value={formData.allowedUsers}
                          onChange={handleInputChange}
                        >
                          <option value="all">All Users</option>
                          <option value="team">Team Only</option>
                          <option value="admin">Admins Only</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm mb-4"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      <i
                        data-feather={showAdvanced ? 'chevron-up' : 'chevron-down'}
                        className="icon-sm me-2"
                      ></i>
                      {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                    </button>

                    {showAdvanced && (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Model Revision</label>
                          <input
                            type="text"
                            className="form-control"
                            name="modelRevision"
                            value={formData.modelRevision}
                            onChange={handleInputChange}
                            placeholder="e.g., main, latest, v2.0"
                          />
                          <div className="form-text">
                            Specific branch, tag, or commit hash to use
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Custom Parameters (JSON)</label>
                          <textarea
                            className={`form-control ${validationErrors.customParameters ? 'is-invalid' : ''}`}
                            name="customParameters"
                            rows="8"
                            value={formData.customParameters}
                            onChange={handleInputChange}
                            placeholder='{"temperature": 0.7, "prompt_template": "...", "model_options": {...}}'
                          ></textarea>
                          {validationErrors.customParameters && (
                            <div className="invalid-feedback">{validationErrors.customParameters}</div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Tags</label>
                          <div className="d-flex flex-wrap tag-input-container">
                            {formData.tags.map((tag, index) => (
                              <div key={index} className="tag-item me-2 mb-2">
                                <span className="badge bg-primary">
                                  {tag}
                                  <i
                                    className="ms-2 cursor-pointer"
                                    onClick={() => handleTagsChange(formData.tags.filter((_, i) => i !== index))}
                                  >
                                    ×
                                  </i>
                                </span>
                              </div>
                            ))}
                            <input
                              type="text"
                              className="form-control form-control-sm tag-input"
                              placeholder="Add tag and press Enter"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                  e.preventDefault();
                                  handleTagsChange([...formData.tags, e.target.value.trim()]);
                                  e.target.value = '';
                                }
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!isValid || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {isEditing ? 'Updating...' : 'Deploying...'}
                          </>
                        ) : (
                          <>
                            <i data-feather={isEditing ? 'save' : 'server'} className="icon-sm me-2"></i>
                            {isEditing ? 'Update Model' : 'Deploy Model'}
                          </>
                        )}
                      </button>
                      <Link to="/operations/ai-gateway/self-hosted" className="btn btn-outline-secondary ms-2">
                        Cancel
                      </Link>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <ModelConfigCard
                      config={formData}
                      isValid={isValid}
                      isEditing={isEditing}
                    />

                    <div className="alert alert-info mt-4">
                      <div className="d-flex">
                        <i data-feather="info" className="icon-sm me-2 flex-shrink-0"></i>
                        <div>
                          <strong>Deployment Information</strong>
                          <p className="mb-0 mt-1">
                            {isEditing ?
                              'Updating the model may cause a brief downtime while the new configuration is applied.' :
                              'Deployment may take 5-10 minutes depending on model size and hardware availability.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModelForm;
