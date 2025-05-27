// imports/ui/pages/AgentWorkflow/workflow-components/index.js

import React, { useState, useEffect } from 'react';

// Import all component index files
// Each component's index.js contains its own whitelist
import './triggers/webhook/index.js';
import './triggers/schedule/index.js';
import './triggers/form/index.js';
import './triggers/email-receive/index.js';
import './triggers/database-change/index.js';

import './data/database/index.js';
import './data/api/index.js';
import './data/file/index.js';
import './data/storage/index.js';
import './data/s3/index.js';

import './transform/filter/index.js';
import './transform/map/index.js';
import './transform/merge/index.js';
import './transform/code/index.js';

// Import AI components loader
import './ai/ai-gateway/index.js';
import aiComponentsLoader from './ai/components-loader.js';

import './output/email/index.js';
import './output/webhook/index.js';
import './output/database/index.js';
import './output/file/index.js';
import './output/s3/index.js';
import './output/vector-db/index.js';
import './output/graph-db/index.js';

// Component registry
const componentRegistry = {
  triggers: {},
  data: {},
  transform: {},
  ai: {},
  output: {}
};

// Component metadata cache
const componentMetadata = {};

// Loading state
let isInitialized = false;
let initPromise = null;

// List of all components to scan
const COMPONENTS_TO_SCAN = [
  // Triggers
  'triggers/webhook',
  'triggers/schedule',
  'triggers/form',
  'triggers/email-receive',
  'triggers/database-change',

  // Data
  'data/database',
  'data/api',
  'data/file',
  'data/storage',
  'data/s3',

  // Transform
  'transform/filter',
  'transform/map',
  'transform/merge',
  'transform/code',

  // AI - we'll handle these differently
  // 'ai/ai-gateway', // Base component, but we'll load models dynamically

  // Output
  'output/email',
  'output/webhook',
  'output/database',
  'output/file',
  'output/s3',
  'output/vector-db',
  'output/graph-db'
];

/**
 * Check if a component exists by trying to load its metadata
 */
const componentExists = async (path) => {
  try {
    console.log(`Checking if component exists: ${path}`);
    await import(`./${path}/metadata.js`);
    console.log(`✓ Found component: ${path}`);
    return true;
  } catch (error) {
    console.log(`✗ Component not found: ${path} - ${error.message}`);
    return false;
  }
};

/**
 * Load a single component from its directory
 */
const loadComponent = async (path) => {
  const [category, name] = path.split('/');

  try {
    // First check if the component exists
    const exists = await componentExists(path);
    if (!exists) {
      console.log(`Component ${path} does not exist, skipping...`);
      return null;
    }

    console.log(`Loading component: ${category}/${name}`);

    // Load all component files in parallel
    const [
      metadataModule,
      iconModule,
      editorModule,
      schemaModule,
      executorModule
    ] = await Promise.all([
      import(`./${path}/metadata.js`),
      import(`./${path}/icon.jsx`).catch(err => {
        console.warn(`Icon not found for ${path}, using default`);
        return null;
      }),
      import(`./${path}/editor.jsx`).catch(err => {
        console.warn(`Editor not found for ${path}, using default`);
        return null;
      }),
      import(`./${path}/schema.js`).catch(() => null), // Optional
      import(`./${path}/executor.js`).catch(() => null) // Optional
    ]);

    const metadata = metadataModule.default || metadataModule;

    // Skip if this is marked as a dynamic component generator
    if (metadata.isDynamicComponent) {
      console.log(`Skipping dynamic component generator: ${path}`);
      return null;
    }

    // If icon or editor are missing, create defaults
    const DefaultIcon = iconModule?.default || (() => {
      return ({ size = 24, color = 'currentColor' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2"/>
          <circle cx="12" cy="12" r="3" fill={color}/>
        </svg>
      );
    })();

    const DefaultEditor = editorModule?.default || (() => {
      return ({ node, onSave, onCancel, isOpen }) => {
        if (!isOpen) return null;

        return (
          <>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999
              }}
              onClick={onCancel}
            />
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              zIndex: 1000,
              minWidth: '500px'
            }}>
              <h2>Configure {metadata.label}</h2>
              <p>Configuration coming soon...</p>
              <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={onCancel}>Cancel</button>
                <button onClick={() => onSave(node)}>Save</button>
              </div>
            </div>
          </>
        );
      };
    })();

    // Construct the component object
    const component = {
      // Core properties
      type: name,
      category,

      // From metadata.js
      label: metadata.label,
      description: metadata.description,
      color: metadata.color,
      defaultData: metadata.defaultData || {},

      // Connection rules
      allowedInputs: metadata.allowedInputs || ['*'],
      allowedOutputs: metadata.allowedOutputs || ['*'],
      maxInputs: metadata.maxInputs || -1,
      maxOutputs: metadata.maxOutputs || -1,

      // Component modules
      Icon: DefaultIcon,
      Editor: DefaultEditor,
      schema: schemaModule?.default || null,
      executor: executorModule?.default || null,

      // Additional metadata
      version: metadata.version || '1.0.0',
      author: metadata.author || '',
      tags: metadata.tags || [],

      // Behavior flags
      isAsync: metadata.isAsync || false,
      requiresAuth: metadata.requiresAuth || false,
      isBeta: metadata.isBeta || false
    };

    return component;
  } catch (error) {
    console.error(`Failed to load component ${path}:`, error);
    return null;
  }
};

/**
 * Load dynamic AI components
 */
const loadDynamicAIComponents = async () => {
  console.log('🤖 Loading dynamic AI components...');

  try {
    // Initialize AI components loader
    await aiComponentsLoader.loadAIComponents();

    // Get all loaded AI components
    const aiComponents = aiComponentsLoader.getAIComponents();

    // Add each AI component to the registry
    Object.entries(aiComponents).forEach(([type, component]) => {
      // Extract the simple name from the type (remove 'ai-' prefix)
      const simpleName = type.replace('ai-', '');
      componentRegistry.ai[simpleName] = component;
      componentMetadata[`ai/${simpleName}`] = component;
    });

    console.log(`🤖 Loaded ${Object.keys(aiComponents).length} AI model components`);
  } catch (error) {
    console.error('Failed to load AI components:', error);
  }
};

/**
 * Scan and load all available components
 */
const scanAndLoadComponents = async () => {
  console.log('🔍 Scanning for workflow components...');

  const loadPromises = [];
  const foundComponents = [];

  // Check each component path
  for (const path of COMPONENTS_TO_SCAN) {
    loadPromises.push(
      componentExists(path).then(exists => {
        if (exists) {
          foundComponents.push(path);
          const [category, name] = path.split('/');
          return loadComponent(path).then(component => {
            if (component) {
              componentRegistry[category][name] = component;
              componentMetadata[path] = component;
            }
          });
        }
      })
    );
  }

  await Promise.all(loadPromises);

  // Load dynamic AI components
  await loadDynamicAIComponents();

  console.log(`✅ Found and loaded ${foundComponents.length} static components`);
  return foundComponents;
};

/**
 * Initialize all components
 */
export const initializeComponents = async () => {
  if (initPromise) return initPromise;
  if (isInitialized) return componentRegistry;

  initPromise = (async () => {
    console.log('🔧 Initializing workflow components...');
    const startTime = Date.now();

    try {
      // Clear registries
      Object.keys(componentRegistry).forEach(key => {
        componentRegistry[key] = {};
      });
      Object.keys(componentMetadata).forEach(key => {
        delete componentMetadata[key];
      });

      // Scan and load all components
      const loadedPaths = await scanAndLoadComponents();

      // Set up reactive AI component updates if on client
      if (Meteor.isClient) {
        aiComponentsLoader.initializeAIComponents();
      }

      // Log summary
      const loadTime = Date.now() - startTime;
      const summary = {};

      Object.entries(componentRegistry).forEach(([category, components]) => {
        const count = Object.keys(components).length;
        if (count > 0) {
          summary[category] = {
            count,
            components: Object.keys(components)
          };
        }
      });

      console.log(`⏱️  Completed in ${loadTime}ms`);
      console.log('📊 Component Summary:');
      Object.entries(summary).forEach(([category, info]) => {
        console.log(`  ${category}: ${info.count} components`);
        if (category === 'ai') {
          console.log(`    └─ Dynamic AI models loaded from gateway`);
        } else {
          console.log(`    └─ ${info.components.join(', ')}`);
        }
      });

      isInitialized = true;
      return componentRegistry;
    } catch (error) {
      console.error('Failed to initialize components:', error);
      throw error;
    }
  })();

  return initPromise;
};

/**
 * Get component list for sidebar
 */
export const getComponentList = () => {
  const list = {};

  Object.entries(componentRegistry).forEach(([category, components]) => {
    list[category] = Object.values(components).map(component => ({
      type: component.type,
      label: component.label,
      description: component.description,
      defaultData: component.defaultData,
      color: component.color,
      isBeta: component.isBeta,
      tags: component.tags,
      category: component.category // Include category for AI components
    }));
  });

  return list;
};

/**
 * Get a specific component
 */
export const getComponent = (category, type) => {
  return componentRegistry[category]?.[type];
};

/**
 * Check if a connection is allowed between two components
 */
export const canConnect = (sourceComponent, targetComponent) => {
  // Check if source allows output to target's category/type
  const allowedOutputs = sourceComponent.allowedOutputs;
  if (allowedOutputs.includes('*')) return true;

  if (allowedOutputs.includes(targetComponent.category)) return true;
  if (allowedOutputs.includes(`${targetComponent.category}/${targetComponent.type}`)) return true;

  // Check if target allows input from source's category/type
  const allowedInputs = targetComponent.allowedInputs;
  if (allowedInputs.includes('*')) return true;

  if (allowedInputs.includes(sourceComponent.category)) return true;
  if (allowedInputs.includes(`${sourceComponent.category}/${sourceComponent.type}`)) return true;

  return false;
};

/**
 * Get all available component types
 */
export const getAvailableComponents = () => {
  const structure = {};

  Object.entries(componentRegistry).forEach(([category, components]) => {
    structure[category] = Object.keys(components);
  });

  return structure;
};

/**
 * Reload AI components (useful when models change)
 */
export const reloadAIComponents = async () => {
  console.log('🔄 Reloading AI components...');

  // Clear existing AI components
  componentRegistry.ai = {};
  Object.keys(componentMetadata).forEach(key => {
    if (key.startsWith('ai/')) {
      delete componentMetadata[key];
    }
  });

  // Reload
  await loadDynamicAIComponents();
};

/**
 * React hook for using components
 */
export const useWorkflowComponents = () => {
  const [components, setComponents] = useState(componentRegistry);
  const [loading, setLoading] = useState(!isInitialized);
  const [error, setError] = useState(null);
  const [aiComponentsState, setAIComponentsState] = useState({
    loading: false,
    count: 0
  });

  useEffect(() => {
    if (isInitialized) {
      setLoading(false);
      return;
    }

    initializeComponents()
      .then(() => {
        setComponents({ ...componentRegistry });
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  // Monitor AI components loading state
  useEffect(() => {
    const checkAIComponents = setInterval(() => {
      const state = aiComponentsLoader.getLoadingState();
      setAIComponentsState({
        loading: state.isLoading,
        count: state.componentCount
      });

      // Update components if AI components have changed
      if (!state.isLoading && state.componentCount > 0) {
        setComponents({ ...componentRegistry });
      }
    }, 1000);

    return () => clearInterval(checkAIComponents);
  }, []);

  return {
    components,
    loading,
    error,
    componentList: getComponentList(),
    getComponent,
    canConnect,
    availableComponents: getAvailableComponents(),
    reloadAIComponents,
    aiComponentsState
  };
};

export default componentRegistry;
