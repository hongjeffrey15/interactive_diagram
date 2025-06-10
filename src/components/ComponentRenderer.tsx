import React from 'react';
import { DiagramComponent, ComponentType } from '../types/diagram';

interface ComponentRendererProps {
  component: DiagramComponent;
  isFocused: boolean;
  isDimmed: boolean;
  isDragging: boolean;
  children: DiagramComponent[];
  onMouseDown: (event: React.MouseEvent) => void;
  onClick: (event: React.MouseEvent) => void;
  onDelete?: (componentId: string) => void;
  onConnectionStart?: (componentId: string, event: React.MouseEvent) => void;
  onConnectionHandleClick?: (componentId: string, direction: 'in' | 'out', event: React.MouseEvent) => void;
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
    case ComponentType.AGENT:
      return '#FF6B35';
    case ComponentType.MICROSERVICE:
      return '#4ECDC4';
    case ComponentType.CONTAINER:
      return '#45B7D1';
    default:
      return '#666666';
  }
};

const getComponentShape = (type: ComponentType, customShape?: string) => {
  // Use custom shape from template if available
  if (customShape) return customShape;
  
  switch (type) {
    case ComponentType.DATABASE:
    case ComponentType.CACHE:
      return 'cylinder';
    case ComponentType.USER:
      return 'circle';
    case ComponentType.EXTERNAL:
      return 'hexagon';
    case ComponentType.AGENT:
      return 'diamond';
    default:
      return 'rectangle';
  }
};

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isFocused,
  isDimmed,
  isDragging,
  children,
  onMouseDown,
  onClick,
  onDelete,
  onConnectionStart,
  onConnectionHandleClick
}) => {
  const color = getComponentColor(component.type, component.color);
  const shape = getComponentShape(component.type, component.metadata?.shape);
  const opacity = isDimmed ? 0.6 : 1;
  const strokeWidth = isFocused ? 3 : 1;
  const strokeColor = isFocused ? '#FF5722' : '#333';
  
  // Adjust size for parent components to accommodate children
  const hasChildren = children.length > 0;
  const adjustedSize = hasChildren 
    ? { 
        width: Math.max(component.size.width, 200), 
        height: Math.max(component.size.height, 120) 
      }
    : component.size;

  const renderRichContent = () => {
    const { x, y } = component.position;
    const { width, height } = adjustedSize;
    const content = component.content;
    const textColor = component.textColor || 'white';
    const fontSize = component.styling?.fontSize || 12;
    
    if (!content) {
      // Fallback to simple content
      return (
        <>
          {/* Component Title */}
          <text
            x={x + width / 2}
            y={y + (hasChildren ? 20 : height / 2)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize + 2}
            fontWeight="bold"
            fill={textColor}
            opacity={opacity}
            pointerEvents="none"
            style={{
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {component.title}
          </text>
          
          {/* Subtitle */}
          {component.subtitle && (
            <text
              x={x + width / 2}
              y={y + (hasChildren ? 35 : height / 2 + 15)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize - 1}
              fontWeight="normal"
              fill={textColor}
              opacity={opacity * 0.8}
              pointerEvents="none"
              style={{
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {component.subtitle}
            </text>
          )}
          
          {/* Bullet Points */}
          {component.bulletPoints && component.bulletPoints.length > 0 && (
            <g className="bullet-points">
              {component.bulletPoints.slice(0, 3).map((point, index) => (
                <text
                  key={index}
                  x={x + 10}
                  y={y + (hasChildren ? 50 : height / 2) + (index * 15)}
                  textAnchor="start"
                  dominantBaseline="middle"
                  fontSize={fontSize - 2}
                  fontWeight="normal"
                  fill={textColor}
                  opacity={opacity * 0.9}
                  pointerEvents="none"
                  style={{
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  • {point.length > 20 ? `${point.substring(0, 20)}...` : point}
                </text>
              ))}
            </g>
          )}
        </>
      );
    }

    // Rich content rendering
    let currentY = y + 15;
    const padding = 10;
    const lineHeight = 14;

    return (
      <g className="rich-content">
        {/* Header */}
        {content.header && (
          <text
            x={x + width / 2}
            y={currentY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize + 3}
            fontWeight="bold"
            fill={textColor}
            opacity={opacity}
            pointerEvents="none"
            style={{
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {content.header}
          </text>
        )}
        
        {/* Subheader */}
        {content.subheader && (() => {
          currentY += lineHeight + 3;
          return (
            <text
              x={x + width / 2}
              y={currentY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize}
              fontWeight="600"
              fill={textColor}
              opacity={opacity * 0.9}
              pointerEvents="none"
              style={{
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {content.subheader}
            </text>
          );
        })()}

        {/* Sections */}
        {content.sections && content.sections.map((section, sectionIndex) => {
          currentY += lineHeight + 8;
          return (
            <g key={sectionIndex} className="content-section">
              {/* Section Title */}
              {section.title && (
                <text
                  x={x + padding}
                  y={currentY}
                  textAnchor="start"
                  dominantBaseline="middle"
                  fontSize={fontSize - 1}
                  fontWeight="bold"
                  fill={textColor}
                  opacity={opacity * 0.95}
                  pointerEvents="none"
                  style={{
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {section.title}
                </text>
              )}
              
              {/* Section Items */}
              {section.items.map((item, itemIndex) => {
                currentY += lineHeight;
                return (
                  <text
                    key={itemIndex}
                    x={x + padding + 8}
                    y={currentY}
                    textAnchor="start"
                    dominantBaseline="middle"
                    fontSize={fontSize - 2}
                    fontWeight="normal"
                    fill={textColor}
                    opacity={opacity * 0.85}
                    pointerEvents="none"
                    style={{
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {`${itemIndex + 1}. ${item.length > 30 ? `${item.substring(0, 30)}...` : item}`}
                  </text>
                );
              })}
            </g>
          );
        })}

        {/* Footer */}
        {content.footer && (() => {
          currentY += lineHeight + 8;
          return (
            <text
              x={x + width / 2}
              y={currentY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize - 1}
              fontWeight="500"
              fill={textColor}
              opacity={opacity * 0.8}
              pointerEvents="none"
              style={{
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {content.footer}
            </text>
          );
        })()}
      </g>
    );
  };

  const renderGradientBackground = () => {
    if (!component.styling?.backgroundGradient) return null;
    
    const { from, to, direction = 'vertical' } = component.styling.backgroundGradient;
    const gradientId = `gradient-${component.id}`;
    
    let x1 = '0%', y1 = '0%', x2 = '0%', y2 = '100%';
    
    switch (direction) {
      case 'horizontal':
        x1 = '0%'; y1 = '0%'; x2 = '100%'; y2 = '0%';
        break;
      case 'diagonal':
        x1 = '0%'; y1 = '0%'; x2 = '100%'; y2 = '100%';
        break;
      default: // vertical
        x1 = '0%'; y1 = '0%'; x2 = '0%'; y2 = '100%';
    }
    
    return (
      <defs>
        <linearGradient id={gradientId} x1={x1} y1={y1} x2={x2} y2={y2}>
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
    );
  };

  const renderShape = () => {
    const { x, y } = component.position;
    const { width, height } = adjustedSize;
    const finalColor = component.styling?.backgroundGradient 
      ? `url(#gradient-${component.id})` 
      : (component.styling?.backgroundColor || color);
    const borderRadius = component.styling?.borderRadius || 4;
    const borderWidth = component.styling?.borderWidth || strokeWidth;
    const borderColor = component.styling?.borderColor || strokeColor;

    switch (shape) {
      case 'circle':
        const radius = Math.min(width, height) / 2;
        return (
          <circle
            cx={x + width / 2}
            cy={y + height / 2}
            r={radius}
            fill={finalColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
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
              fill={finalColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
              opacity={opacity}
            />
            {/* Top ellipse */}
            <ellipse
              cx={x + width / 2}
              cy={y + ellipseHeight / 2}
              rx={width / 2}
              ry={ellipseHeight / 2}
              fill={finalColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
              opacity={opacity}
            />
            {/* Bottom ellipse */}
            <ellipse
              cx={x + width / 2}
              cy={y + height - ellipseHeight / 2}
              rx={width / 2}
              ry={ellipseHeight / 2}
              fill={finalColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
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
            fill={finalColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
            opacity={opacity}
          />
        );

      case 'diamond':
        const diamondPoints = [
          `${x + width / 2},${y}`,
          `${x + width},${y + height / 2}`,
          `${x + width / 2},${y + height}`,
          `${x},${y + height / 2}`
        ].join(' ');
        
        return (
          <polygon
            points={diamondPoints}
            fill={finalColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
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
            fill={finalColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
            opacity={opacity}
            rx={borderRadius}
          />
        );
    }
  };

  const renderNestedChildren = () => {
    if (!hasChildren) return null;

    const { x, y } = component.position;
    const { width, height } = adjustedSize;
    const childSpacing = 10;
    const childSize = { width: 60, height: 40 };
    const childrenPerRow = Math.floor((width - 20) / (childSize.width + childSpacing));
    
    return (
      <g className="nested-children">
        {children.map((child, index) => {
          const row = Math.floor(index / childrenPerRow);
          const col = index % childrenPerRow;
          const childX = x + childSpacing + col * (childSize.width + childSpacing);
          const childY = y + 30 + row * (childSize.height + childSpacing);
          
          const childColor = getComponentColor(child.type, child.color);
          const childShape = getComponentShape(child.type, child.metadata?.shape);
          
          return (
            <g key={child.id} className="nested-child">
              {/* Child background */}
              <rect
                x={childX}
                y={childY}
                width={childSize.width}
                height={childSize.height}
                fill={childColor}
                stroke="#333"
                strokeWidth={1}
                opacity={0.8}
                rx={2}
              />
              {/* Child label */}
              <text
                x={childX + childSize.width / 2}
                y={childY + childSize.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
                fill="white"
                pointerEvents="none"
                style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}
              >
                {child.title.length > 8 ? `${child.title.substring(0, 8)}...` : child.title}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  const renderConnectionHandles = () => {
    if (!isFocused) return null;

    const { x, y } = component.position;
    const { width, height } = adjustedSize;
    const handleRadius = 6;

    const handles = [
      { id: 'top', cx: x + width / 2, cy: y - handleRadius, direction: 'in' as const },
      { id: 'right', cx: x + width + handleRadius, cy: y + height / 2, direction: 'out' as const },
      { id: 'bottom', cx: x + width / 2, cy: y + height + handleRadius, direction: 'out' as const },
      { id: 'left', cx: x - handleRadius, cy: y + height / 2, direction: 'in' as const }
    ];

    return (
      <g className="connection-handles">
        {handles.map(handle => (
          <g key={handle.id} className="connection-handle">
            {/* Single unified circle with hover state */}
            <circle
              cx={handle.cx}
              cy={handle.cy}
              r={handleRadius + 2}
              fill="rgba(255, 255, 255, 0.95)"
              stroke="#FF5722"
              strokeWidth={2}
              className="connection-handle-circle"
              style={{
                cursor: 'crosshair',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                transition: 'all 0.2s ease'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onConnectionHandleClick?.(component.id, handle.direction, e);
              }}
              onMouseEnter={(e) => {
                const target = e.target as SVGCircleElement;
                target.setAttribute('r', String(handleRadius + 3));
                target.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
              }}
              onMouseLeave={(e) => {
                const target = e.target as SVGCircleElement;
                target.setAttribute('r', String(handleRadius + 2));
                target.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))';
              }}
            />
            {/* Inner colored indicator */}
            <circle
              cx={handle.cx}
              cy={handle.cy}
              r={handleRadius - 1}
              fill={handle.direction === 'in' ? '#4CAF50' : '#2196F3'}
              pointerEvents="none"
              style={{ transition: 'all 0.2s ease' }}
            />
            {/* Direction indicator */}
            <text
              x={handle.cx}
              y={handle.cy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fontWeight="bold"
              fill="white"
              pointerEvents="none"
              style={{ 
                textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                transition: 'all 0.2s ease'
              }}
            >
              {handle.direction === 'in' ? '←' : '→'}
            </text>
          </g>
        ))}
      </g>
    );
  };

  return (
    <g
      className={`component ${component.type} ${shape} ${isFocused ? 'focused' : ''} ${isDimmed ? 'dimmed' : ''} ${hasChildren ? 'has-children' : ''}`}
      style={{ 
        cursor: isDragging ? 'grabbing' : (isFocused ? 'default' : 'grab'),
        filter: isFocused ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none'
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {/* Gradient definitions */}
      {renderGradientBackground()}
      
      {renderShape()}
      
      {/* Nested children container */}
      {hasChildren && (
        <rect
          x={component.position.x + 5}
          y={component.position.y + 25}
          width={adjustedSize.width - 10}
          height={adjustedSize.height - 30}
          fill="rgba(255,255,255,0.1)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1}
          strokeDasharray="3,3"
          rx={2}
          pointerEvents="none"
        />
      )}
      
      {/* Render nested children */}
      {renderNestedChildren()}
      
      {/* Rich Content */}
      {renderRichContent()}
      
      {/* Children count badge - Fixed positioning */}
      {hasChildren && (
        <g className="children-badge">
          <circle
            cx={component.position.x + adjustedSize.width - 15}
            cy={component.position.y + 15}
            r={8}
            fill="#FF5722"
            stroke="white"
            strokeWidth={2}
          />
          <text
            x={component.position.x + adjustedSize.width - 15}
            y={component.position.y + 15}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="bold"
            fill="white"
            pointerEvents="none"
          >
            {children.length}
          </text>
        </g>
      )}

      {/* Delete button - Fixed positioning */}
      {isFocused && onDelete && (
        <g className="delete-button">
          <circle
            cx={component.position.x + adjustedSize.width - 5}
            cy={component.position.y + 5}
            r={8}
            fill="#F44336"
            stroke="white"
            strokeWidth={2}
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(component.id);
            }}
          />
          <text
            x={component.position.x + adjustedSize.width - 5}
            y={component.position.y + 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="bold"
            fill="white"
            pointerEvents="none"
          >
            ×
          </text>
        </g>
      )}

      {/* Connection handles */}
      {renderConnectionHandles()}
    </g>
  );
}; 