import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DiagramComponent, Connection, Position, FocusState, ConnectionType } from '../types/diagram';
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
  onSetParent?: (childId: string, parentId: string | undefined) => void;
  onToggleCollapse?: (componentId: string) => void;
  onConnectionCreate?: (connection: Omit<Connection, 'id'>) => void;
  backgroundColor?: string;
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
  onSetParent,
  onToggleCollapse,
  onConnectionCreate,
  backgroundColor,
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

  const [connectionState, setConnectionState] = useState<{
    isCreating: boolean;
    sourceId: string | null;
    sourceDirection: 'in' | 'out' | null;
  }>({
    isCreating: false,
    sourceId: null,
    sourceDirection: null
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
    // Check if clicking on canvas background (not on components)
    const target = event.target as Element;
    const isCanvasBackground = target === svgRef.current || 
                              target.tagName === 'rect' || 
                              target.classList?.contains('grid-background') ||
                              target.id === 'grid';
    
    if (isCanvasBackground && !panState.isPanning && !dragState.isDragging) {
      onCanvasClick();
      // Clear connection state when clicking empty canvas
      setConnectionState({
        isCreating: false,
        sourceId: null,
        sourceDirection: null
      });
    }
  }, [onCanvasClick, panState.isPanning, dragState.isDragging]);

  const handleConnectionHandleClick = useCallback((componentId: string, direction: 'in' | 'out', event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!connectionState.isCreating) {
      // Start creating connection
      setConnectionState({
        isCreating: true,
        sourceId: componentId,
        sourceDirection: direction
      });
    } else if (connectionState.sourceId !== componentId && onConnectionCreate) {
      // Complete connection
      const sourceComponent = components.find(c => c.id === connectionState.sourceId);
      const targetComponent = components.find(c => c.id === componentId);
      
      if (sourceComponent && targetComponent) {
        // Determine connection direction based on handle directions
        let fromId: string, toId: string;
        
        if (connectionState.sourceDirection === 'out' && direction === 'in') {
          fromId = connectionState.sourceId!;
          toId = componentId;
        } else if (connectionState.sourceDirection === 'in' && direction === 'out') {
          fromId = componentId;
          toId = connectionState.sourceId!;
        } else {
          // Default: source -> target regardless of direction
          fromId = connectionState.sourceId!;
          toId = componentId;
        }

        const newConnection: Omit<Connection, 'id'> = {
          sourceId: fromId,
          targetId: toId,
          label: `${sourceComponent.title} → ${targetComponent.title}`,
          type: ConnectionType.GENERIC
        };

        onConnectionCreate(newConnection);
      }

      // Reset connection state
      setConnectionState({
        isCreating: false,
        sourceId: null,
        sourceDirection: null
      });
    } else {
      // Cancel connection (clicking same component or invalid target)
      setConnectionState({
        isCreating: false,
        sourceId: null,
        sourceDirection: null
      });
    }
  }, [connectionState, components, onConnectionCreate]);

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

  const renderComponents = () => {
    return components
      .filter(component => !component.parentId) // Only render root components directly
      .map(component => {
        const isFocused = focusState.focusedComponentId === component.id;
        const isDimmed = focusState.dimmedComponents.includes(component.id);
        const isDragging = dragState.componentId === component.id;
        const isConnectionSource = connectionState.sourceId === component.id;
        const isConnectionTarget = connectionState.isCreating && connectionState.sourceId !== component.id;
        
        // Get children components
        const children = components.filter(c => c.parentId === component.id);

        return (
          <ComponentRenderer
            key={component.id}
            component={component}
            isFocused={isFocused || isConnectionSource}
            isDimmed={isDimmed && !isConnectionTarget}
            isDragging={isDragging}
            children={children}
            onMouseDown={(event) => handleComponentMouseDown(component.id, event)}
            onClick={(event) => handleComponentClick(component.id, event)}
            onDelete={onComponentDelete}
            onConnectionHandleClick={handleConnectionHandleClick}
          />
        );
      });
  };

  const renderConnectionPreview = () => {
    if (!connectionState.isCreating || !connectionState.sourceId) return null;

    const sourceComponent = components.find(c => c.id === connectionState.sourceId);
    if (!sourceComponent) return null;

    // Get all possible target components (excluding source)
    const possibleTargets = components.filter(c => c.id !== connectionState.sourceId && !c.parentId);

    return (
      <g className="connection-preview">
        {/* Main instruction */}
        <rect
          x={sourceComponent.position.x - 50}
          y={sourceComponent.position.y - 60}
          width={sourceComponent.size.width + 100}
          height={40}
          fill="rgba(255, 87, 34, 0.95)"
          stroke="rgba(255, 87, 34, 1)"
          strokeWidth={2}
          rx={8}
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}
        />
        <text
          x={sourceComponent.position.x + sourceComponent.size.width / 2}
          y={sourceComponent.position.y - 35}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Click a connection handle on another component
        </text>
        
        {/* Pulsing indicator on source */}
        <circle
          cx={sourceComponent.position.x + sourceComponent.size.width / 2}
          cy={sourceComponent.position.y - 15}
          r="4"
          fill="#FF5722"
          opacity="0.8"
        >
          <animate
            attributeName="r"
            values="4;8;4"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0.3;0.8"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Highlight possible target components */}
        {possibleTargets.map(target => (
          <g key={`target-${target.id}`}>
            <rect
              x={target.position.x - 3}
              y={target.position.y - 3}
              width={target.size.width + 6}
              height={target.size.height + 6}
              fill="none"
              stroke="#4CAF50"
              strokeWidth={2}
              strokeDasharray="5,5"
              rx={6}
              opacity={0.7}
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;10"
                dur="1s"
                repeatCount="indefinite"
              />
            </rect>
            <text
              x={target.position.x + target.size.width / 2}
              y={target.position.y - 8}
              textAnchor="middle"
              fill="#4CAF50"
              fontSize="10"
              fontWeight="bold"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Click handle
            </text>
          </g>
        ))}

        {/* Cancel instruction */}
        <text
          x={sourceComponent.position.x + sourceComponent.size.width / 2}
          y={sourceComponent.position.y + sourceComponent.size.height + 25}
          textAnchor="middle"
          fill="#666"
          fontSize="12"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Click empty space to cancel
        </text>
      </g>
    );
  };

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
          height: '100%',
          background: backgroundColor || '#f8f9fa'
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
            {renderComponents()}
          </g>

          {/* Connection Preview Layer */}
          {renderConnectionPreview()}
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