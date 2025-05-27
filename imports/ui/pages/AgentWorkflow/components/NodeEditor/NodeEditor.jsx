import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import componentRegistry from '../../workflow-components';
import './NodeEditor.scss';
import AIGatewayIcon from '../../workflow-components/ai/ai-gateway/icon.jsx';

const NodeEditor = ({ node, onSave, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // Debug: Log what we're looking for
    console.log('NodeEditor Debug:');
    console.log('- Node type:', node.type);
    console.log('- Node category:', node.category);
    console.log('- Full node:', node);
    console.log('- Component Registry:', componentRegistry);

    // Search for the component - matching the actual logic
    let found = null;

    // First, try exact category + type match
    if (node.category && componentRegistry[node.category]) {
      const component = componentRegistry[node.category][node.type];
      if (component) {
        found = { category: node.category, component };
        console.log(`✓ Found exact match in ${node.category}/${node.type}`);
      }
    }

    // If not found, search all categories (only if no category specified)
    if (!found && !node.category) {
      Object.entries(componentRegistry).forEach(([category, components]) => {
        console.log(`- Checking category '${category}':`, Object.keys(components));
        if (components[node.type]) {
          found = { category, component: components[node.type] };
          console.log(`  ✓ Found in ${category}!`);
        }
      });
    }

    if (found) {
      console.log('- Component selected:', found.component);
      console.log('- Component category:', found.component.category);
      console.log('- Has Editor?', !!found.component.Editor);
      console.log('- Has Icon?', !!found.component.Icon);
    } else {
      console.log('- Component NOT FOUND in registry');
    }

    setDebugInfo({ found, registry: componentRegistry });
  }, [node]);

  // Get the component definition from the registry
  let componentDef = null;

  // First, try to find by exact category and type match
  if (node.category && componentRegistry[node.category]) {
    componentDef = componentRegistry[node.category][node.type];
  }

  // If not found and no category specified, search all categories
  if (!componentDef && !node.category) {
    Object.entries(componentRegistry).forEach(([category, components]) => {
      if (components[node.type]) {
        componentDef = components[node.type];
      }
    });
  }

  // Check if this component has a custom editor
  const hasCustomEditor = componentDef && componentDef.Editor;

  // If there's a custom editor component, use it
  if (hasCustomEditor) {
    const EditorComponent = componentDef.Editor;

    const handleSave = (updatedNode) => {
      // Handle the save properly - some editors return the full node, others just data
      if (updatedNode.data !== undefined) {
        onSave(updatedNode);
      } else {
        onSave({ data: updatedNode });
      }
      onClose();
    };

    const handleCancel = () => {
      setIsOpen(false);
      onClose();
    };

    return (
      <EditorComponent
        node={node}
        onSave={handleSave}
        onCancel={handleCancel}
        isOpen={isOpen}
      />
    );
  }

  // Fallback to the original NodeEditor implementation for components without custom editors
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(node.data || {});
  }, [node]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Add specific validation based on node type
    switch (node.type) {
      case 'webhook':
        if (!formData.path) newErrors.path = 'Path is required';
        break;
      case 'http-trigger':
        if (!formData.url) newErrors.url = 'URL is required';
        break;
      case 'email':
        if (!formData.to) newErrors.to = 'Recipient is required';
        if (!formData.subject) newErrors.subject = 'Subject is required';
        break;
      case 'api-request':
        if (!formData.url) newErrors.url = 'URL is required';
        break;
      case 'database':
        if (!formData.connection) newErrors.connection = 'Connection is required';
        if (!formData.query) newErrors.query = 'Query is required';
        break;
      case 'llm':
        if (!formData.prompt) newErrors.prompt = 'Prompt is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({ data: formData });
    }
  };

  const renderNodeIcon = () => {
    // Special handling for AI components
    if (node.category === 'ai' && (node.provider || node.modelInfo?.provider || node.data?.provider)) {
      const provider = node.provider || node.modelInfo?.provider || node.data?.provider;
      return <AIGatewayIcon size={24} color="currentColor" provider={provider} />;
    }

    // Check if component has a custom Icon component
    if (componentDef && componentDef.Icon) {
      const IconComponent = componentDef.Icon;
      return <IconComponent size={24} color="currentColor" />;
    }

    // Fallback to a default icon
    return <AlertCircle size={24} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      triggers: '#10b981',
      data: '#3b82f6',
      transform: '#8b5cf6',
      ai: '#ec4899',
      output: '#f59e0b'
    };
    return colors[category] || '#6b7280';
  };

  const renderDebugInfo = () => {
    return (
      <div style={{
        backgroundColor: '#f0f0f0',
        padding: '12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
        marginBottom: '16px'
      }}>
        <strong>DEBUG INFO:</strong><br/>
        Node Type: {node.type}<br/>
        Node Category: {node.category}<br/>
        Component Found: {debugInfo.found ? 'Yes' : 'No'}<br/>
        {debugInfo.found && (
          <>
            Found in Category: {debugInfo.found.category}<br/>
            Has Custom Editor: {debugInfo.found.component.Editor ? 'Yes' : 'No'}<br/>
            Has Custom Icon: {debugInfo.found.component.Icon ? 'Yes' : 'No'}<br/>
          </>
        )}
        <details style={{ marginTop: '8px' }}>
          <summary>Registry Keys</summary>
          {Object.entries(componentRegistry).map(([cat, comps]) => (
            <div key={cat}>
              {cat}: {Object.keys(comps).join(', ') || '(empty)'}
            </div>
          ))}
        </details>
      </div>
    );
  };

  const renderFallbackContent = () => {
    return (
      <div className="form-info">
        <AlertCircle size={20} />
        <p>No configuration options available for this node type.</p>

        {/* Show debug info in development */}
        {renderDebugInfo()}

        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto',
          marginTop: '16px'
        }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="node-editor-overlay" onClick={onClose}>
      <div className="node-editor" onClick={e => e.stopPropagation()}>
        <div className="editor-header">
          <div className="header-left">
            <div
              className="node-icon"
              style={{ backgroundColor: `${getCategoryColor(node.category)}20` }}
            >
              {renderNodeIcon()}
            </div>
            <div>
              <h3>{node.label}</h3>
              <span className="node-type">{node.type}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="editor-body">
          {renderFallbackContent()}
        </div>

        <div className="editor-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;
