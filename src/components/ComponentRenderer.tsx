import React from 'react';
import { DiagramComponent, ComponentType } from '../types/diagram';

interface ComponentRendererProps {
  component: DiagramComponent;
  isFocused: boolean;
  isDimmed: boolean;
  isDragging: boolean;
  onMouseDown: (event: React.MouseEvent) => void;
  onClick: (event: React.MouseEvent) => void;
  onDelete?: (componentId: string) => void;
  onConnectionStart?: (componentId: string, event: React.MouseEvent) => void;
}

const getComponentColor = (type: ComponentType, customColor?: string): string => {
  if (customColor) return customColor;
  
  switch (type) {
    case ComponentType.SERVICE:
      return '#4CAF50';
    case ComponentType.DATABASE:
      return '#2196F3';
    case ComponentType.API:
      return '#FF9800';
    case ComponentType.GATEWAY:
      return '#9C27B0';
    case ComponentType.CACHE:
      return '#F44336';
    case ComponentType.QUEUE:
      return '#795548';
    case ComponentType.STORAGE:
      return '#607D8B';
    case ComponentType.USER:
      return '#E91E63';
    case ComponentType.EXTERNAL:
      return '#757575';
    default:
      return '#666666';
  }
};

const getComponentShape = (type: ComponentType) => {
  switch (type) {
    case ComponentType.DATABASE:
    case ComponentType.CACHE:
      return 'cylinder';
    case ComponentType.USER:
      return 'circle';
    case ComponentType.EXTERNAL:
      return 'hexagon';
    default:
      return 'rectangle';
  }
};

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isFocused,
  isDimmed,
  isDragging,
  onMouseDown,
  onClick,
  onDelete,
  onConnectionStart
}) => {
  const color = getComponentColor(component.type, component.color);
  const shape = getComponentShape(component.type);
  const opacity = isDimmed ? 0.3 : 1;
  const strokeWidth = isFocused ? 3 : 1;
  const strokeColor = isFocused ? '#FF5722' : '#333';

  const renderShape = () => {
    const { x, y } = component.position;
    const { width, height } = component.size;

    switch (shape) {
      case 'circle':
        const radius = Math.min(width, height) / 2;
        return (
          <circle
            cx={x + width / 2}
            cy={y + height / 2}
            r={radius}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        );
      
      case 'cylinder':
        const ellipseHeight = height * 0.15;
        return (
          <g>
            {/* Main body */}
            <rect
              x={x}
              y={y + ellipseHeight / 2}
              width={width}
              height={height - ellipseHeight}
              fill={color}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
            {/* Top ellipse */}
            <ellipse
              cx={x + width / 2}
              cy={y + ellipseHeight / 2}
              rx={width / 2}
              ry={ellipseHeight / 2}
              fill={color}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
            {/* Bottom ellipse */}
            <ellipse
              cx={x + width / 2}
              cy={y + height - ellipseHeight / 2}
              rx={width / 2}
              ry={ellipseHeight / 2}
              fill={color}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          </g>
        );
      
      case 'hexagon':
        const points = [
          `${x + width * 0.25},${y}`,
          `${x + width * 0.75},${y}`,
          `${x + width},${y + height / 2}`,
          `${x + width * 0.75},${y + height}`,
          `${x + width * 0.25},${y + height}`,
          `${x},${y + height / 2}`
        ].join(' ');
        
        return (
          <polygon
            points={points}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        );
      
      default: // rectangle
        return (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            opacity={opacity}
            rx={4}
          />
        );
    }
  };

  return (
    <g
      className={`component ${component.type} ${isFocused ? 'focused' : ''} ${isDimmed ? 'dimmed' : ''}`}
      style={{ 
        cursor: isDragging ? 'grabbing' : 'grab',
        filter: isFocused ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none'
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {renderShape()}
      
      {/* Component Label */}
      <text
        x={component.position.x + component.size.width / 2}
        y={component.position.y + component.size.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="bold"
        fill="white"
        opacity={opacity}
        pointerEvents="none"
        style={{
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          fontSize: isFocused ? '14px' : '12px'
        }}
      >
        {component.title}
      </text>
      
      {/* Type Badge */}
      <text
        x={component.position.x + component.size.width / 2}
        y={component.position.y + component.size.height / 2 + 15}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="9"
        fill="white"
        opacity={opacity * 0.8}
        pointerEvents="none"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
      >
        {component.type.toUpperCase()}
      </text>

      {/* Delete Button - Only shown when focused */}
      {isFocused && onDelete && (
        <g>
          {/* Delete button background */}
          <circle
            cx={component.position.x + component.size.width - 8}
            cy={component.position.y + 8}
            r="8"
            fill="#dc3545"
            stroke="white"
            strokeWidth="1"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(component.id);
            }}
          />
          {/* Delete button X */}
          <text
            x={component.position.x + component.size.width - 8}
            y={component.position.y + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="white"
            fontWeight="bold"
            pointerEvents="none"
          >
            ×
          </text>
        </g>
      )}

      {/* Connection Handles - Only shown when focused */}
      {isFocused && onConnectionStart && (
        <g className="connection-handles">
          {/* Top handle */}
          <circle
            cx={component.position.x + component.size.width / 2}
            cy={component.position.y}
            r="5"
            fill="#007bff"
            stroke="white"
            strokeWidth="2"
            style={{ cursor: 'crosshair' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onConnectionStart(component.id, e);
            }}
          />
          
          {/* Right handle */}
          <circle
            cx={component.position.x + component.size.width}
            cy={component.position.y + component.size.height / 2}
            r="5"
            fill="#007bff"
            stroke="white"
            strokeWidth="2"
            style={{ cursor: 'crosshair' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onConnectionStart(component.id, e);
            }}
          />
          
          {/* Bottom handle */}
          <circle
            cx={component.position.x + component.size.width / 2}
            cy={component.position.y + component.size.height}
            r="5"
            fill="#007bff"
            stroke="white"
            strokeWidth="2"
            style={{ cursor: 'crosshair' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onConnectionStart(component.id, e);
            }}
          />
          
          {/* Left handle */}
          <circle
            cx={component.position.x}
            cy={component.position.y + component.size.height / 2}
            r="5"
            fill="#007bff"
            stroke="white"
            strokeWidth="2"
            style={{ cursor: 'crosshair' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onConnectionStart(component.id, e);
            }}
          />
        </g>
      )}
    </g>
  );
}; 