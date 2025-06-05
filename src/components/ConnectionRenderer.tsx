import React from 'react';
import { Connection, DiagramComponent, ConnectionType } from '../types/diagram';

interface ConnectionRendererProps {
  connection: Connection;
  sourceComponent?: DiagramComponent;
  targetComponent?: DiagramComponent;
  isHighlighted: boolean;
  isDimmed: boolean;
}

const getConnectionColor = (type?: ConnectionType): string => {
  switch (type) {
    case ConnectionType.DATA_FLOW:
      return '#2196F3';
    case ConnectionType.API_CALL:
      return '#4CAF50';
    case ConnectionType.DEPENDENCY:
      return '#FF9800';
    case ConnectionType.INHERITANCE:
      return '#9C27B0';
    case ConnectionType.COMPOSITION:
      return '#F44336';
    default:
      return '#666666';
  }
};

const getConnectionStyle = (type?: ConnectionType): string => {
  switch (type) {
    case ConnectionType.DEPENDENCY:
      return '5,5';
    case ConnectionType.INHERITANCE:
      return '10,5';
    default:
      return 'none';
  }
};

export const ConnectionRenderer: React.FC<ConnectionRendererProps> = ({
  connection,
  sourceComponent,
  targetComponent,
  isHighlighted,
  isDimmed
}) => {
  if (!sourceComponent || !targetComponent) {
    return null;
  }

  const sourceCenter = {
    x: sourceComponent.position.x + sourceComponent.size.width / 2,
    y: sourceComponent.position.y + sourceComponent.size.height / 2
  };

  const targetCenter = {
    x: targetComponent.position.x + targetComponent.size.width / 2,
    y: targetComponent.position.y + targetComponent.size.height / 2
  };

  // Calculate connection points on the edges of components
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return null;

  const sourceRadius = Math.max(sourceComponent.size.width, sourceComponent.size.height) / 2;
  const targetRadius = Math.max(targetComponent.size.width, targetComponent.size.height) / 2;

  const sourcePoint = {
    x: sourceCenter.x + (dx / distance) * sourceRadius,
    y: sourceCenter.y + (dy / distance) * sourceRadius
  };

  const targetPoint = {
    x: targetCenter.x - (dx / distance) * targetRadius,
    y: targetCenter.y - (dy / distance) * targetRadius
  };

  const color = getConnectionColor(connection.type);
  const strokeDasharray = getConnectionStyle(connection.type);
  const opacity = isDimmed ? 0.2 : 1;
  const strokeWidth = isHighlighted ? 3 : 2;

  // Calculate label position (midpoint)
  const labelX = (sourcePoint.x + targetPoint.x) / 2;
  const labelY = (sourcePoint.y + targetPoint.y) / 2;

  return (
    <g className={`connection ${connection.type || 'generic'} ${isHighlighted ? 'highlighted' : ''} ${isDimmed ? 'dimmed' : ''}`}>
      {/* Arrow marker definition */}
      <defs>
        <marker
          id={`arrowhead-${connection.id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={color}
            opacity={opacity}
          />
        </marker>
      </defs>

      {/* Connection line */}
      <line
        x1={sourcePoint.x}
        y1={sourcePoint.y}
        x2={targetPoint.x}
        y2={targetPoint.y}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        opacity={opacity}
        markerEnd={`url(#arrowhead-${connection.id})`}
        style={{
          filter: isHighlighted ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
        }}
      />

      {/* Connection label */}
      {connection.label && (
        <g>
          {/* Label background */}
          <rect
            x={labelX - (connection.label.length * 3)}
            y={labelY - 8}
            width={connection.label.length * 6}
            height={16}
            fill="white"
            stroke={color}
            strokeWidth="1"
            rx="3"
            opacity={opacity * 0.9}
          />
          {/* Label text */}
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill={color}
            opacity={opacity}
            fontWeight={isHighlighted ? 'bold' : 'normal'}
          >
            {connection.label}
          </text>
        </g>
      )}
    </g>
  );
}; 