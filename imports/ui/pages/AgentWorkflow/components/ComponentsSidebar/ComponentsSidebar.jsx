// imports/ui/pages/AgentWorkflow/components/ComponentsSidebar.jsx
import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import { useWorkflowComponents } from '../../workflow-components/index';
import AIGatewayIcon from '../../workflow-components/ai/ai-gateway/icon.jsx';
import './ComponentsSidebar.scss';

const ComponentsSidebar = () => {
  const { componentList, loading, error, getComponent } = useWorkflowComponents();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [draggedComponent, setDraggedComponent] = useState(null);

  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleDragStart = (e, component, category) => {
    const fullComponent = { ...component, category };
    setDraggedComponent(fullComponent);
    e.dataTransfer.effectAllowed = 'copy';

    // Serialize the component data
    const componentData = {
      type: component.type,
      category: category,
      label: component.label,
      defaultData: component.defaultData,
      color: component.color
    };

    e.dataTransfer.setData('component', JSON.stringify(componentData));
  };

  const handleDragEnd = () => {
    setDraggedComponent(null);
  };

  const filterComponents = (components) => {
    if (!searchTerm) return components;
    return components.filter(comp =>
      comp.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const renderComponentIcon = (component, category) => {
    // Debug AI components
    if (category === 'ai') {
      console.log('AI Component in renderIcon:', component);
      console.log('Has provider?', component.provider);
      console.log('DefaultData provider?', component.defaultData?.provider);
    }

    // For AI components, use the AIGatewayIcon directly with provider from metadata
    if (category === 'ai' && (component.provider || component.defaultData?.provider)) {
      const provider = component.provider || component.defaultData?.provider;
      return <AIGatewayIcon size={20} color={component.color || 'currentColor'} provider={provider} />;
    }

    // Get the full component data to access the Icon component for non-AI components
    const fullComponent = getComponent(category, component.type);

    if (fullComponent?.Icon) {
      return <fullComponent.Icon size={20} color={component.color || 'currentColor'} />;
    }

    // Fallback to text icon if SVG component not available
    return <span style={{ fontSize: '20px' }}>{component.icon || '📦'}</span>;
  };

  if (loading) {
    return (
      <div className="components-sidebar">
        <div className="sidebar-loading">
          <div className="spinner"></div>
          <p>Loading components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="components-sidebar">
        <div className="sidebar-error">
          <p>Error loading components</p>
          <small>{error.message}</small>
        </div>
      </div>
    );
  }

  return (
    <div className="components-sidebar">
      <div className="sidebar-header">
        <h3>Components</h3>
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar-content">
        {Object.entries(componentList).map(([category, components]) => {
          const filteredComponents = filterComponents(components);
          if (searchTerm && filteredComponents.length === 0) return null;

          return (
            <div key={category} className="component-category">
              <button
                className="category-header"
                onClick={() => toggleCategory(category)}
              >
                <div className="category-title">
                  {expandedCategories.includes(category) ?
                    <ChevronDown size={16} /> :
                    <ChevronRight size={16} />
                  }
                  <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                  <span className="component-count">{filteredComponents.length}</span>
                </div>
              </button>

              {expandedCategories.includes(category) && (
                <div className="category-components">
                  {filteredComponents.map((component) => (
                    <div
                      key={component.type}
                      className={`component-item ${draggedComponent?.type === component.type ? 'dragging' : ''} ${component.isBeta ? 'beta' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, component, category)}
                      onDragEnd={handleDragEnd}
                    >
                      <div
                        className="component-icon"
                        style={{ color: component.color }}
                      >
                        {renderComponentIcon(component, category)}
                      </div>
                      <div className="component-info">
                        <div className="component-label">
                          {component.label}
                          {component.isBeta && <span className="beta-badge">Beta</span>}
                        </div>
                        <div className="component-description">{component.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <p className="component-total">
          {Object.values(componentList).flat().length} components available
        </p>
      </div>
    </div>
  );
};

export default ComponentsSidebar;
