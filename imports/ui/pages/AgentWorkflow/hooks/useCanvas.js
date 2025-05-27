// /imports/ui/pages/AgentWorkflow/hooks/useCanvas.js
import { useState, useCallback } from 'react';

const useCanvas = () => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const minZoom = 0.25;
  const maxZoom = 2;
  const zoomStep = 0.1;

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + zoomStep, maxZoom));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - zoomStep, minZoom));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
      setZoom(prev => Math.max(minZoom, Math.min(maxZoom, prev + delta)));
    }
  }, []);

  const handlePan = useCallback((e, startPan = null) => {
    if (startPan !== null) {
      setIsPanning(startPan);
      if (startPan && e) {
        setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    } else if (isPanning && e) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [isPanning, offset, panStart]);

  return {
    zoom,
    offset,
    isPanning,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleWheel,
    handlePan
  };
};

export default useCanvas;
