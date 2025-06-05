import React, { useState } from 'react';

interface ToolbarProps {
  diagramTitle: string;
  onTitleChange: (newTitle: string) => void;
  onExport: (format?: 'json' | 'png') => void;
  onImport: () => void;
  onCreateCustomComponent: () => void;
  onClearFocus: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  diagramTitle,
  onTitleChange,
  onExport,
  onImport,
  onCreateCustomComponent,
  onClearFocus
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
      
      <button onClick={onCreateCustomComponent} title="Create a custom component">
        Custom Component
      </button>
      
      <button onClick={onClearFocus} title="Clear focus and show all components">
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
            <button 
              onClick={() => {
                onExport('json');
                setShowExportMenu(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                border: 'none',
                background: 'none',
                textAlign: 'left',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
            >
              Export as JSON
            </button>
            <button 
              onClick={() => {
                onExport('png');
                setShowExportMenu(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                border: 'none',
                background: 'none',
                textAlign: 'left',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
            >
              Export as PNG
            </button>
          </div>
        )}
      </div>
      
      <button 
        onClick={() => window.location.reload()} 
        title="Reset to initial state"
      >
        Reset
      </button>
    </div>
  );
}; 