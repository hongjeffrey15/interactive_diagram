import React, { useState } from 'react';

interface ToolbarProps {
  diagramTitle: string;
  onTitleChange: (newTitle: string) => void;
  onExport: (format?: 'json' | 'png') => void;
  onImport: () => void;
  onSVGImport?: () => void;
  onCreateCustomComponent: () => void;
  onClearFocus: () => void;
  backgroundColor?: string;
  onBackgroundColorChange?: (color: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  diagramTitle,
  onTitleChange,
  onExport,
  onImport,
  onSVGImport,
  onCreateCustomComponent,
  onClearFocus,
  backgroundColor,
  onBackgroundColorChange
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(diagramTitle);

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setTempTitle(diagramTitle);
  };

  const handleTitleSave = () => {
    onTitleChange(tempTitle || 'Untitled Diagram');
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(diagramTitle);
    setIsEditingTitle(false);
  };

  const exportJSONTemplate = () => {
    const template = {
      version: "1.0",
      metadata: {
        title: diagramTitle,
        description: "Interactive diagram JSON template for SVG conversion",
        author: "Interactive Diagram Tool",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["diagram", "architecture", "components", "connections"]
      },
      canvas: {
        width: 1200,
        height: 800,
        backgroundColor: backgroundColor || "#f8f9fa",
        gridEnabled: true,
        gridSize: 20,
        theme: "light"
      },
      components: [],
      connections: [],
      layout: {
        autoLayout: false,
        direction: "horizontal",
        spacing: {
          horizontal: 150,
          vertical: 100
        }
      },
      styling: {
        fonts: {
          primary: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          secondary: "Inter, sans-serif",
          monospace: "JetBrains Mono, 'Courier New', monospace"
        },
        colors: {
          primary: "#007bff",
          secondary: "#6c757d",
          accent: "#28a745",
          background: backgroundColor || "#f8f9fa",
          text: "#2c3e50",
          border: "#dee2e6"
        },
        borderRadius: 8,
        shadows: true
      },
      instructions: {
        purpose: "This JSON template provides a comprehensive format for converting SVG diagrams into the Interactive Diagram Tool format",
        componentTypes: [
          "service", "database", "api", "gateway", "cache", "queue", 
          "storage", "user", "external", "generic", "agent", "microservice", "container"
        ],
        connectionTypes: [
          "data_flow", "api_call", "dependency", "inheritance", "composition", "generic"
        ],
        shapes: ["rectangle", "circle", "diamond", "hexagon", "triangle", "custom"],
        conversionTips: [
          "Extract rectangles, circles, and other SVG shapes as components",
          "Identify text elements for component titles and descriptions",
          "Convert SVG paths and lines into connections between components",
          "Map SVG colors to component styling.backgroundColor",
          "Use SVG group (g) elements to identify nested components",
          "Convert SVG transform attributes to component position and rotation",
          "Map SVG stroke properties to connection styling",
          "Use SVG marker elements for connection arrow types"
        ]
      }
    };

    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram-json-template.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="toolbar">
      {isEditingTitle ? (
        <input
          type="text"
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTitleSave();
            if (e.key === 'Escape') handleTitleCancel();
          }}
          autoFocus
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            border: '2px solid #007bff',
            borderRadius: '4px',
            padding: '4px 8px',
            background: 'white'
          }}
        />
      ) : (
        <h1 
          onClick={handleTitleEdit}
          style={{ 
            cursor: 'pointer',
            margin: 0,
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f8f9fa'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
          title="Click to edit diagram name"
        >
          {diagramTitle}
        </h1>
      )}
      
      <div style={{ flex: 1 }} />
      
      <button onClick={onImport} title="Import diagram from file">
        Import
      </button>
      
      {onSVGImport && (
        <button onClick={onSVGImport} title="Import SVG diagram" className="svg-import-btn">
          📄 SVG Import
        </button>
      )}
      
      <button onClick={onCreateCustomComponent} title="Create a custom component">
        Custom Component
      </button>
      
      <button onClick={onClearFocus} title="Clear focus and selection">
        Clear Focus
      </button>
      
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setShowExportMenu(!showExportMenu)} 
          className="primary" 
          title="Export diagram"
        >
          Export ▼
        </button>
        
        {showExportMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}>
            <div className="export-menu">
              <button onClick={() => { onExport('json'); setShowExportMenu(false); }}>
                Export as JSON
              </button>
              <button onClick={() => { onExport('png'); setShowExportMenu(false); }}>
                Export as PNG
              </button>
              <button onClick={() => { exportJSONTemplate(); setShowExportMenu(false); }}>
                Export JSON Template
              </button>
            </div>
          </div>
        )}
      </div>
      
      <button 
        onClick={() => window.location.reload()} 
        title="Reset to initial state"
      >
        Reset
      </button>

      {onBackgroundColorChange && (
        <div className="background-color-picker">
          <label>Background:</label>
          <input
            type="color"
            value={backgroundColor || '#f8f9fa'}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            title="Change canvas background color"
          />
        </div>
      )}
    </div>
  );
}; 