// /imports/ui/components/WorkflowCanvas/WorkflowCanvas.jsx

import React, { useRef, useEffect, useState, useCallback } from 'react';
import useCanvas from '../../hooks/useCanvas';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Grid3x3, Trash2, Edit2 } from 'lucide-react';
import { useWorkflowComponents } from '../../workflow-components';
import AIGatewayIcon from '../../workflow-components/ai/ai-gateway/icon.jsx';
import './WorkflowCanvas.scss';

const WorkflowCanvas = ({
  workflow,
  selectedNode,
  onNodeSelect,
  onNodeUpdate,
  onNodeDelete,
  onConnectionAdd,
  onConnectionDelete,
  onNodeEdit,
  componentRegistry: propComponentRegistry
}) => {
  const canvasRef = useRef(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragTransform, setDragTransform] = useState({ x: 0, y: 0 });

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Connection state
  const [connectionMode, setConnectionMode] = useState(false);
  const [selectedSourceNode, setSelectedSourceNode] = useState(null);
  const [hoveredPort, setHoveredPort] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Get component registry from hook if not provided as prop
  const { components: hookComponentRegistry, loading, error } = useWorkflowComponents();
  const componentRegistry = propComponentRegistry || hookComponentRegistry;

  const {
    zoom,
    offset,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handlePan,
    handleWheel
  } = useCanvas();

  // Fullscreen handler
  const handleFullscreen = useCallback(() => {
    const canvasElement = canvasRef.current;

    if (!document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement) {
      // Enter fullscreen
      if (canvasElement.requestFullscreen) {
        canvasElement.requestFullscreen();
      } else if (canvasElement.webkitRequestFullscreen) { // Safari
        canvasElement.webkitRequestFullscreen();
      } else if (canvasElement.mozRequestFullScreen) { // Firefox
        canvasElement.mozRequestFullScreen();
      } else if (canvasElement.msRequestFullscreen) { // IE11
        canvasElement.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { // Safari
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) { // IE11
        document.msExitFullscreen();
      }
    }
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isNowFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle drop for new components
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const componentData = e.dataTransfer.getData('component');
    if (!componentData) return;

    try {
      const component = JSON.parse(componentData);
      const rect = canvasRef.current.getBoundingClientRect();

      // Calculate drop position relative to canvas, accounting for zoom and offset
      const x = (e.clientX - rect.left - offset.x) / zoom;
      const y = (e.clientY - rect.top - offset.y) / zoom;

      // Get the full component definition to extract all needed data
      let fullComponent = null;
      let provider = component.provider; // Start with provider from drag data

      if (componentRegistry && component.category && componentRegistry[component.category]) {
        fullComponent = componentRegistry[component.category][component.type];
        // Get provider from multiple possible sources
        if (!provider && fullComponent) {
          provider = fullComponent.provider ||
                    fullComponent.modelInfo?.provider ||
                    fullComponent.defaultData?.provider ||
                    component.defaultData?.provider;
        }
      }

      console.log('Dropping AI component:', {
        type: component.type,
        category: component.category,
        dragProvider: component.provider,
        fullComponentProvider: fullComponent?.provider,
        modelInfoProvider: fullComponent?.modelInfo?.provider,
        defaultDataProvider: component.defaultData?.provider,
        finalProvider: provider
      });

      // Create the new node with drop position
      const newNode = {
        id: `node-${Date.now()}`,
        type: component.type,
        category: component.category,
        label: component.label,
        position: { x, y },
        data: component.defaultData || {},
        color: component.color,
        // Add provider for AI components
        ...(component.category === 'ai' && provider ? { provider } : {}),
        // Add modelInfo if available
        ...(component.category === 'ai' && fullComponent?.modelInfo ? { modelInfo: fullComponent.modelInfo } : {})
      };

      // Call the onNodeUpdate with null nodeId to indicate new node
      onNodeUpdate(null, newNode);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [zoom, offset, onNodeUpdate, componentRegistry]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (e.target === e.currentTarget) {
      setIsDragOver(false);
    }
  };

  // Connection handlers
  const handlePortClick = (e, node, portType) => {
    e.stopPropagation();

    if (portType === 'output') {
      // Start connection from output port
      setConnectionMode(true);
      setSelectedSourceNode(node);

      // Initialize mouse position for preview line
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x) / zoom;
      const y = (e.clientY - rect.top - offset.y) / zoom;
      setMousePosition({ x, y });
    }
  };

  const handlePortMouseUp = (e, node, portType) => {
    e.stopPropagation();

    if (portType === 'input' && connectionMode && selectedSourceNode) {
      // Complete connection to input port
      if (selectedSourceNode.id !== node.id) {
        // Check if this exact connection already exists
        const connectionExists = workflow?.connections?.some(conn =>
          conn.source === selectedSourceNode.id && conn.target === node.id
        );

        if (!connectionExists) {
          const newConnection = {
            id: `conn-${Date.now()}`,
            source: selectedSourceNode.id,
            target: node.id
          };
          onConnectionAdd(newConnection);
        }
      }

      // Clear connection mode after completing connection
      setConnectionMode(false);
      setSelectedSourceNode(null);
      setMousePosition({ x: 0, y: 0 });
    }
  };

  // Node interaction handlers
  const handleNodeMouseDown = (e, node) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();

    const rect = canvasRef.current.getBoundingClientRect();
    const nodeX = node.position.x * zoom + offset.x;
    const nodeY = node.position.y * zoom + offset.y;

    setDragOffset({
      x: e.clientX - rect.left - nodeX,
      y: e.clientY - rect.top - nodeY
    });

    setDraggedNode(node);
    onNodeSelect(node);
  };

  const handleNodeMouseEnter = (nodeId) => {
    setHoveredNode(nodeId);
  };

  const handleNodeMouseLeave = () => {
    setHoveredNode(null);
  };

  const handleCanvasClick = (e) => {
    // Check if clicking on empty canvas (not on a node or port)
    if (e.target.classList.contains('canvas-area') ||
        e.target.classList.contains('canvas-grid') ||
        e.target.classList.contains('canvas-transform')) {
      // Cancel connection mode on canvas click
      if (connectionMode) {
        setConnectionMode(false);
        setSelectedSourceNode(null);
        setMousePosition({ x: 0, y: 0 });
      } else {
        onNodeSelect(null);
      }
    }
  };

  // Handle mouse move for dragging nodes and connection preview
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggedNode) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - dragOffset.x - offset.x) / zoom;
        const y = (e.clientY - rect.top - dragOffset.y - offset.y) / zoom;

        // Update transform for visual feedback
        setDragTransform({
          x: x - draggedNode.position.x,
          y: y - draggedNode.position.y
        });
      }

      if (connectionMode && selectedSourceNode) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - offset.x) / zoom;
        const y = (e.clientY - rect.top - offset.y) / zoom;
        setMousePosition({ x, y });
      }
    };

    const handleMouseUp = (e) => {
      // Save the final position when releasing the drag
      if (draggedNode) {
        const finalX = draggedNode.position.x + dragTransform.x;
        const finalY = draggedNode.position.y + dragTransform.y;
        onNodeUpdate(draggedNode.id, { position: { x: finalX, y: finalY } });
        setDraggedNode(null);
        setDragTransform({ x: 0, y: 0 });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedNode, dragOffset, zoom, offset, onNodeUpdate, connectionMode, selectedSourceNode, dragTransform]);

  // Get component icon
  const getNodeIcon = (node) => {
    // Debug logging for AI nodes
    if (node.category === 'ai') {
      console.log('Getting icon for AI node:', {
        nodeId: node.id,
        provider: node.provider,
        modelInfoProvider: node.modelInfo?.provider,
        dataProvider: node.data?.provider
      });
    }

    // Special handling for AI components
    if (node.category === 'ai') {
      const provider = node.provider || node.modelInfo?.provider || node.data?.provider;
      if (provider) {
        return <AIGatewayIcon size={20} provider={provider} />;
      }
    }

    // Try to get icon from component registry
    if (componentRegistry && node?.category && node?.type) {
      const component = componentRegistry[node.category]?.[node.type];
      if (component?.Icon) {
        return <component.Icon size={20} />;
      }
    }

    // Fallback icons based on category
    const categoryIcons = {
      triggers: '⚡',
      data: '🗄️',
      transform: '🔄',
      ai: '🤖',
      output: '📤'
    };

    return <div className="default-icon">{categoryIcons[node.category] || '📦'}</div>;
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      triggers: '#3b82f6',
      data: '#10b981',
      transform: '#8b5cf6',
      ai: '#ec4899',
      output: '#f59e0b'
    };
    return colors[category] || '#6b7280';
  };

  // Function to draw SVG connections
  const renderConnections = () => {
    if (!workflow?.connections || !workflow?.nodes) return null;

    const connections = workflow.connections.map(conn => {
      const sourceNode = workflow.nodes.find(n => n.id === conn.source);
      const targetNode = workflow.nodes.find(n => n.id === conn.target);

      if (!sourceNode || !targetNode) return null;

      // Calculate positions with drag transform
      const sourcePos = { ...sourceNode.position };
      const targetPos = { ...targetNode.position };

      if (draggedNode?.id === sourceNode.id) {
        sourcePos.x += dragTransform.x;
        sourcePos.y += dragTransform.y;
      }
      if (draggedNode?.id === targetNode.id) {
        targetPos.x += dragTransform.x;
        targetPos.y += dragTransform.y;
      }

      // Calculate connection points to connect to the OUTSIDE of the ports
      const sourceX = sourcePos.x + 80; // Right edge of the output port
      const sourceY = sourcePos.y + 40; // Center vertically

      const targetX = targetPos.x; // Left edge of the input port
      const targetY = targetPos.y + 40; // Center vertically

      // Create curved path
      const controlOffset = Math.min(Math.abs(targetX - sourceX) * 0.5, 50);
      const path = `M ${sourceX} ${sourceY} C ${sourceX + controlOffset} ${sourceY}, ${targetX - controlOffset} ${targetY}, ${targetX} ${targetY}`;

      return (
        <g key={conn.id}>
          <path
            d={path}
            fill="none"
            stroke="#666"
            strokeWidth="2"
            className="connection-path"
          />
          <path
            d={`M ${targetX - 8} ${targetY - 4} l 8 4 l -8 4 z`}
            fill="#666"
            className="connection-arrow"
          />
          {/* Delete button on hover */}
          <circle
            cx={(sourceX + targetX) / 2}
            cy={(sourceY + targetY) / 2}
            r="8"
            fill="#fff"
            stroke="#dc3545"
            strokeWidth="2"
            className="connection-delete"
            style={{ cursor: 'pointer', pointerEvents: 'all' }}
            onClick={() => onConnectionDelete(conn.id)}
          >
            <title>Delete connection</title>
          </circle>
          <text
            x={(sourceX + targetX) / 2}
            y={(sourceY + targetY) / 2 + 4}
            textAnchor="middle"
            fill="#dc3545"
            fontSize="16"
            fontWeight="bold"
            className="connection-delete-icon"
            style={{ pointerEvents: 'none' }}
          >
            ×
          </text>
        </g>
      );
    });

    // Add preview connection if in connection mode
    if (connectionMode && selectedSourceNode && mousePosition.x !== 0 && mousePosition.y !== 0) {
      const sourcePos = { ...selectedSourceNode.position };
      if (draggedNode?.id === selectedSourceNode.id) {
        sourcePos.x += dragTransform.x;
        sourcePos.y += dragTransform.y;
      }

      const sourceX = sourcePos.x + 80;
      const sourceY = sourcePos.y + 40;
      const targetX = mousePosition.x;
      const targetY = mousePosition.y;

      const controlOffset = Math.min(Math.abs(targetX - sourceX) * 0.5, 50);
      const path = `M ${sourceX} ${sourceY} C ${sourceX + controlOffset} ${sourceY}, ${targetX - controlOffset} ${targetY}, ${targetX} ${targetY}`;

      connections.push(
        <g key="preview-connection">
          <path
            d={path}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="connection-preview"
            style={{ pointerEvents: 'none' }}
          />
        </g>
      );
    }

    return connections;
  };

  // Show loading state if components are still loading
  if (loading && !propComponentRegistry) {
    return (
      <div className="workflow-canvas">
        <div className="canvas-loading">
          <div className="spinner"></div>
          <p>Loading workflow components...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`workflow-canvas ${isFullscreen ? 'fullscreen' : ''}`} ref={canvasRef}>
      {/* Canvas Controls */}
      <div className="canvas-controls">
        <div className="control-group">
          <button className="control-btn" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button className="control-btn" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={18} />
          </button>
        </div>
        <div className="control-group">
          <button className="control-btn" onClick={handleZoomReset} title="Reset View">
            <RotateCcw size={18} />
          </button>
          <button
            className="control-btn"
            onClick={handleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        className={`canvas-area ${isDragOver ? 'drag-over' : ''} ${connectionMode ? 'connection-mode' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onWheel={handleWheel}
        onMouseDown={(e) => !draggedNode && handlePan(e, true)}
        onMouseMove={(e) => !draggedNode && handlePan(e)}
        onMouseUp={() => !draggedNode && handlePan(null, false)}
        onClick={handleCanvasClick}
      >
        {/* Grid Background */}
        <div
          className="canvas-grid"
          style={{
            backgroundPosition: `${offset.x}px ${offset.y}px`,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`
          }}
        />

        {/* Transform Container */}
        <div
          className="canvas-transform"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Render connections as SVG */}
          <svg
            className="connections-layer"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              overflow: 'visible'
            }}
          >
            {renderConnections()}
          </svg>

          {/* Nodes */}
          {workflow?.nodes?.map((node) => {
            const categoryColor = node.color || getCategoryColor(node.category);
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode?.id === node.id;
            const isDragging = draggedNode?.id === node.id;

            return (
              <div
                key={node.id}
                id={node.id}
                className={`workflow-node ${node.category} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDragging ? 'dragging' : ''}`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  borderColor: categoryColor,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  transform: isDragging ? `translate(${dragTransform.x}px, ${dragTransform.y}px)` : 'none',
                  transition: 'none' // Remove transition for smooth dragging
                }}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onMouseEnter={() => handleNodeMouseEnter(node.id)}
                onMouseLeave={handleNodeMouseLeave}
              >
                {/* Node Actions (visible on hover) */}
                <div className="node-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNodeEdit(node);
                    }}
                    title="Edit"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNodeDelete(node.id);
                    }}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Connection Ports */}
                <div className="node-ports">
                  {/* Input port (not for triggers) */}
                  {node.category !== 'triggers' && (
                    <div
                      className={`node-port input-port ${
                        connectionMode && selectedSourceNode ? 'active' : ''
                      } ${hoveredPort === `${node.id}-input` ? 'hovered' : ''}`}
                      onMouseEnter={() => setHoveredPort(`${node.id}-input`)}
                      onMouseLeave={() => setHoveredPort(null)}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseUp={(e) => handlePortMouseUp(e, node, 'input')}
                    />
                  )}

                  {/* Output port */}
                  <div
                    className={`node-port output-port ${
                      connectionMode && selectedSourceNode?.id === node.id ? 'selected' : ''
                    } ${hoveredPort === `${node.id}-output` ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredPort(`${node.id}-output`)}
                    onMouseLeave={() => setHoveredPort(null)}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handlePortClick(e, node, 'output');
                    }}
                  />
                </div>

                {/* Node Content */}
                <div className="node-content">
                  <div
                    className="node-icon"
                    style={{ color: categoryColor }}
                  >
                    {getNodeIcon(node)}
                  </div>
                </div>

                {/* Node Label */}
                <div className="node-label">{node.label}</div>

                {/* Status Indicator */}
                {node.status && node.status !== 'idle' && (
                  <div className={`node-status ${node.status}`} />
                )}
              </div>
            );
          })}

          {(!workflow?.nodes || workflow.nodes.length === 0) && (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Main workflow nodes */}
                  <circle cx="30" cy="30" r="12" fill="var(--bs-primary)" opacity="0.2"/>
                  <circle cx="30" cy="30" r="8" fill="var(--bs-primary)"/>

                  <circle cx="90" cy="30" r="12" fill="var(--bs-info)" opacity="0.2"/>
                  <circle cx="90" cy="30" r="8" fill="var(--bs-info)"/>

                  <circle cx="30" cy="90" r="12" fill="var(--bs-success)" opacity="0.2"/>
                  <circle cx="30" cy="90" r="8" fill="var(--bs-success)"/>

                  <circle cx="90" cy="90" r="12" fill="var(--bs-warning)" opacity="0.2"/>
                  <circle cx="90" cy="90" r="8" fill="var(--bs-warning)"/>

                  {/* Center node */}
                  <circle cx="60" cy="60" r="16" fill="var(--bs-primary)" opacity="0.1"/>
                  <circle cx="60" cy="60" r="12" fill="var(--bs-primary)" opacity="0.2"/>
                  <circle cx="60" cy="60" r="8" fill="var(--bs-primary)"/>

                  {/* Connecting lines */}
                  <path d="M38 30 L52 52" stroke="var(--bs-gray-400)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5"/>
                  <path d="M82 30 L68 52" stroke="var(--bs-gray-400)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5"/>
                  <path d="M38 90 L52 68" stroke="var(--bs-gray-400)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5"/>
                  <path d="M82 90 L68 68" stroke="var(--bs-gray-400)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5"/>

                  {/* Arrows */}
                  <path d="M48 48 L52 52 L48 56" stroke="var(--bs-gray-400)" strokeWidth="2" fill="none" opacity="0.5"/>
                  <path d="M72 48 L68 52 L72 56" stroke="var(--bs-gray-400)" strokeWidth="2" fill="none" opacity="0.5"/>
                  <path d="M48 72 L52 68 L48 64" stroke="var(--bs-gray-400)" strokeWidth="2" fill="none" opacity="0.5"/>
                  <path d="M72 72 L68 68 L72 64" stroke="var(--bs-gray-400)" strokeWidth="2" fill="none" opacity="0.5"/>

                  {/* Plus icon in center */}
                  <path d="M60 54 L60 66 M54 60 L66 60" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Start Building Your Workflow</h3>
              <p>Drag components from the sidebar to add them here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
