import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DiagramComponent, Connection, Position, FocusState } from '../types/diagram';
import { ComponentRenderer } from './ComponentRenderer';
import { ConnectionRenderer } from './ConnectionRenderer';

interface DiagramCanvasProps {
  components: DiagramComponent[];
  connections: Connection[];
  focusState: FocusState;
  onComponentClick: (componentId: string) => void;
  onComponentDrag: (componentId: string, newPosition: Position) => void;
  onComponentDelete: (componentId: string) => void;
  onComponentDrop?: (componentType: string, position: Position) => void;
  onCanvasClick: () => void;
  width?: number;
  height?: number;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  components,
  connections,
  focusState,
  onComponentClick,
  onComponentDrag,
  onComponentDelete,
  onComponentDrop,
  onCanvasClick,
  width: propWidth,
  height: propHeight
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    componentId: string | null;
    startPosition: Position;
    offset: Position;
  }>({
    isDragging: false,
    componentId: null,
    startPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  });

  const [panState, setPanState] = useState<{
    isPanning: boolean;
    startPoint: Position;
    offset: Position;
  }>({
    isPanning: false,
    startPoint: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  });

  const [zoom, setZoom] = useState(1);

  const handleComponentMouseDown = useCallback((componentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    setDragState({
      isDragging: true,
      componentId,
      startPosition: component.position,
      offset: {
        x: (event.clientX - svgRect.left) / zoom - panState.offset.x - component.position.x,
        y: (event.clientY - svgRect.top) / zoom - panState.offset.y - component.position.y
      }
    });
  }, [components, zoom, panState.offset]);

  const handleCanvasMouseDown = useCallback((event: React.MouseEvent) => {
    // Only start panning if clicking on empty canvas (not on components)
    if (event.target === svgRef.current || ((event.target as Element).tagName === 'rect' && (event.target as Element).getAttribute('width') === '100%')) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      setPanState({
        isPanning: true,
        startPoint: {
          x: event.clientX - svgRect.left,
          y: event.clientY - svgRect.top
        },
        offset: panState.offset
      });
      event.preventDefault();
      event.stopPropagation();
    }
  }, [panState.offset]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    if (dragState.isDragging && dragState.componentId) {
      const newPosition = {
        x: (event.clientX - svgRect.left) / zoom - panState.offset.x - dragState.offset.x,
        y: (event.clientY - svgRect.top) / zoom - panState.offset.y - dragState.offset.y
      };
      onComponentDrag(dragState.componentId, newPosition);
    } else if (panState.isPanning) {
      const panSpeed = 0.15; // Reduced from 0.3 to 0.15 for gentler panning
      const newOffset = {
        x: panState.offset.x + (event.clientX - svgRect.left - panState.startPoint.x) * panSpeed / zoom,
        y: panState.offset.y + (event.clientY - svgRect.top - panState.startPoint.y) * panSpeed / zoom
      };
      setPanState(prev => ({ ...prev, offset: newOffset }));
    }
  }, [dragState, panState, onComponentDrag, zoom]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        componentId: null,
        startPosition: { x: 0, y: 0 },
        offset: { x: 0, y: 0 }
      });
    }
    if (panState.isPanning) {
      setPanState(prev => ({ ...prev, isPanning: false }));
    }
  }, [dragState.isDragging, panState.isPanning]);

  const handleComponentClick = useCallback((componentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!dragState.isDragging && !panState.isPanning) {
      onComponentClick(componentId);
    }
  }, [dragState.isDragging, panState.isPanning, onComponentClick]);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (event.target === svgRef.current && !panState.isPanning) {
      onCanvasClick();
    }
  }, [onCanvasClick, panState.isPanning]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * zoomFactor)));
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!onComponentDrop) return;

    const componentType = event.dataTransfer.getData('componentType');
    if (!componentType) return;

    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const position = {
      x: (event.clientX - svgRect.left) / zoom - panState.offset.x,
      y: (event.clientY - svgRect.top) / zoom - panState.offset.y
    };

    onComponentDrop(componentType, position);
  }, [onComponentDrop, zoom, panState.offset]);

  // Set up global mouse events for dragging and panning
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      if (dragState.isDragging && dragState.componentId) {
        const newPosition = {
          x: (event.clientX - svgRect.left) / zoom - panState.offset.x - dragState.offset.x,
          y: (event.clientY - svgRect.top) / zoom - panState.offset.y - dragState.offset.y
        };
        onComponentDrag(dragState.componentId, newPosition);
      } else if (panState.isPanning) {
        const panSpeed = 0.15; // Reduced from 0.3 to 0.15 for gentler panning
        const newOffset = {
          x: panState.offset.x + (event.clientX - svgRect.left - panState.startPoint.x) * panSpeed / zoom,
          y: panState.offset.y + (event.clientY - svgRect.top - panState.startPoint.y) * panSpeed / zoom
        };
        setPanState(prev => ({ ...prev, offset: newOffset }));
      }
    };

    const handleGlobalMouseUp = () => {
      if (dragState.isDragging) {
        setDragState({
          isDragging: false,
          componentId: null,
          startPosition: { x: 0, y: 0 },
          offset: { x: 0, y: 0 }
        });
      }
      if (panState.isPanning) {
        setPanState(prev => ({ ...prev, isPanning: false }));
      }
    };

    if (dragState.isDragging || panState.isPanning) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState, panState, onComponentDrag, zoom]);

  const getCursor = () => {
    if (dragState.isDragging) return 'grabbing';
    if (panState.isPanning) return 'grabbing';
    return 'grab';
  };

  const handleCenterView = useCallback(() => {
    if (components.length === 0) {
      setPanState(prev => ({ ...prev, offset: { x: 0, y: 0 } }));
      setZoom(1);
      return;
    }

    // Calculate bounds of all components
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    components.forEach(comp => {
      minX = Math.min(minX, comp.position.x);
      minY = Math.min(minY, comp.position.y);
      maxX = Math.max(maxX, comp.position.x + comp.size.width);
      maxY = Math.max(maxY, comp.position.y + comp.size.height);
    });

    // Add padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Calculate center and zoom to fit
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    const scaleX = dimensions.width / contentWidth;
    const scaleY = dimensions.height / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

    // Center the view
    const offsetX = (dimensions.width / newZoom / 2) - centerX;
    const offsetY = (dimensions.height / newZoom / 2) - centerY;

    setPanState(prev => ({ ...prev, offset: { x: offsetX, y: offsetY } }));
    setZoom(newZoom);
  }, [components, dimensions.width, dimensions.height]);

  // Set up canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 600
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="diagram-canvas"
      style={{ width: '100%', height: '100%' }}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ 
          cursor: getCursor(),
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      >
        {/* Grid Pattern */}
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Main content group with zoom and pan transforms */}
        <g transform={`scale(${zoom}) translate(${panState.offset.x}, ${panState.offset.y})`}>
          {/* Connections Layer */}
          <g className="connections-layer">
            {connections.map(connection => (
              <ConnectionRenderer
                key={connection.id}
                connection={connection}
                sourceComponent={components.find(c => c.id === connection.sourceId)}
                targetComponent={components.find(c => c.id === connection.targetId)}
                isHighlighted={focusState.highlightedConnections.includes(connection.id)}
                isDimmed={focusState.focusedComponentId !== null && 
                         !focusState.highlightedConnections.includes(connection.id)}
              />
            ))}
          </g>

          {/* Components Layer */}
          <g className="components-layer">
            {components.map(component => (
              <ComponentRenderer
                key={component.id}
                component={component}
                isFocused={focusState.focusedComponentId === component.id}
                isDimmed={focusState.dimmedComponents.includes(component.id)}
                onMouseDown={(event) => handleComponentMouseDown(component.id, event)}
                onClick={(event) => handleComponentClick(component.id, event)}
                isDragging={dragState.componentId === component.id}
                onDelete={onComponentDelete}
              />
            ))}
          </g>
        </g>
      </svg>
      
      {/* Canvas Controls */}
      <div className="canvas-controls">
        <button onClick={handleCenterView} title="Center view on components">
          ⌂
        </button>
      </div>
      
      {/* Zoom indicator */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '5px 10px',
        borderRadius: '3px',
        fontSize: '12px',
        color: '#666'
      }}>
        Zoom: {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}; 