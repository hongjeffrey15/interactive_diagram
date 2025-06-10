import React, { useState, useMemo } from 'react';
import { ComponentType, Position } from '../types/diagram';
import { v4 as uuidv4 } from 'uuid';

interface ComponentTemplate {
  id: string;
  type: ComponentType;
  label: string;
  color: string;
  icon: string;
  shape: 'rectangle' | 'circle' | 'diamond' | 'hexagon';
}

interface ComponentLibraryProps {
  onAddComponent: (type: ComponentType, position: Position, metadata: any) => void;
  onCreateCustomComponent?: () => void;
}

const defaultTemplates: ComponentTemplate[] = [
  { id: '1', type: ComponentType.SERVICE, label: 'Service', color: '#4CAF50', icon: '⚙️', shape: 'rectangle' },
  { id: '2', type: ComponentType.DATABASE, label: 'Database', color: '#2196F3', icon: '🗄️', shape: 'rectangle' },
  { id: '3', type: ComponentType.API, label: 'API', color: '#FF9800', icon: '🔌', shape: 'hexagon' },
  { id: '4', type: ComponentType.GATEWAY, label: 'Gateway', color: '#9C27B0', icon: '🚪', shape: 'diamond' },
  { id: '5', type: ComponentType.CACHE, label: 'Cache', color: '#F44336', icon: '⚡', shape: 'diamond' },
  { id: '6', type: ComponentType.QUEUE, label: 'Queue', color: '#795548', icon: '📬', shape: 'rectangle' },
  { id: '7', type: ComponentType.STORAGE, label: 'Storage', color: '#607D8B', icon: '💾', shape: 'rectangle' },
  { id: '8', type: ComponentType.USER, label: 'User', color: '#E91E63', icon: '👤', shape: 'circle' },
  { id: '9', type: ComponentType.EXTERNAL, label: 'External', color: '#757575', icon: '🌐', shape: 'hexagon' },
  { id: '10', type: ComponentType.GENERIC, label: 'Generic', color: '#666666', icon: '📦', shape: 'rectangle' },
  { id: '11', type: ComponentType.AGENT, label: 'AI Agent', color: '#7B1FA2', icon: '🤖', shape: 'hexagon' },
  { id: '12', type: ComponentType.MICROSERVICE, label: 'Microservice', color: '#00BCD4', icon: '🔧', shape: 'rectangle' },
  { id: '13', type: ComponentType.CONTAINER, label: 'Container', color: '#3F51B5', icon: '📋', shape: 'rectangle' }
];

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  onAddComponent,
  onCreateCustomComponent
}) => {
  const [templates, setTemplates] = useState<ComponentTemplate[]>(defaultTemplates);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter templates based on search term
  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) return templates;
    
    const term = searchTerm.toLowerCase();
    return templates.filter(template => 
      template.label.toLowerCase().includes(term) ||
      template.type.toLowerCase().includes(term)
    );
  }, [templates, searchTerm]);

  const handleComponentClick = (template: ComponentTemplate) => {
    // Use the template's customized properties when creating the component
    onAddComponent(template.type, { x: 400, y: 300 }, {
      title: template.label,
      color: template.color,
      metadata: { 
        shape: template.shape,
        templateId: template.id 
      }
    });
  };

  const handleDragStart = (event: React.DragEvent, template: ComponentTemplate) => {
    event.dataTransfer.setData('componentType', template.type);
    event.dataTransfer.setData('templateData', JSON.stringify({
      title: template.label,
      color: template.color,
      shape: template.shape,
      templateId: template.id
    }));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleEditTemplate = (templateId: string) => {
    setEditingTemplate(templateId);
  };

  const handleSaveTemplate = (templateId: string, updates: Partial<ComponentTemplate>) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, ...updates } : t
    ));
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleAddTemplate = () => {
    const newTemplate: ComponentTemplate = {
      id: uuidv4(),
      label: 'New Template',
      type: ComponentType.GENERIC,
      color: '#6c757d',
      icon: '📦',
      shape: 'rectangle'
    };
    setTemplates(prev => [...prev, newTemplate]);
    setEditingTemplate(newTemplate.id);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="component-library">
      <h3>Components</h3>
      
      {/* Search Section */}
      <div className="search-section">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search-btn">
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="search-results-info">
            {filteredTemplates.length} of {templates.length} components
          </div>
        )}
      </div>

      <div className="component-list">
        {filteredTemplates.map(template => (
          <div key={template.id}>
            {editingTemplate === template.id ? (
              <TemplateEditor
                template={template}
                onSave={(updates) => handleSaveTemplate(template.id, updates)}
                onCancel={() => setEditingTemplate(null)}
              />
            ) : (
              <div className="component-item-wrapper">
                <div
                  className={`component-item ${template.shape}`}
                  draggable
                  onClick={() => handleComponentClick(template)}
                  onDragStart={(e) => handleDragStart(e, template)}
                  title={`Add ${template.label} component`}
                >
                  <div 
                    className={`component-icon ${template.shape}-icon`}
                    style={{ backgroundColor: template.color }}
                  >
                    {template.icon}
                  </div>
                  <span className="component-label">{template.label}</span>
                </div>
                <div className="template-controls">
                  <button
                    onClick={() => handleEditTemplate(template.id)}
                    className="edit-btn"
                    title="Edit template"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="delete-btn"
                    title="Delete template"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredTemplates.length === 0 && searchTerm && (
          <div className="no-results">
            <p>No components found for "{searchTerm}"</p>
            <button onClick={clearSearch} className="btn-outline btn-sm">
              Clear search
            </button>
          </div>
        )}
        
        {onCreateCustomComponent && (
          <div
            className="component-item custom-component"
            onClick={onCreateCustomComponent}
            title="Create custom component"
            style={{ border: '2px dashed #ccc' }}
          >
            <div 
              className="component-icon"
              style={{ backgroundColor: '#28a745', color: 'white' }}
            >
              +
            </div>
            <span className="component-label">Custom</span>
          </div>
        )}
        
        <div
          className="component-item add-template"
          onClick={handleAddTemplate}
          title="Add new template"
          style={{ border: '2px dashed #007bff' }}
        >
          <div 
            className="component-icon"
            style={{ backgroundColor: '#007bff', color: 'white' }}
          >
            +
          </div>
          <span className="component-label">Add Template</span>
        </div>
      </div>
      
      <div className="library-help">
        <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '20px' }}>
          Click to add to center or drag to position. Use edit controls to customize templates.
        </p>
      </div>
    </div>
  );
};

// Template Editor Component
interface TemplateEditorProps {
  template: ComponentTemplate;
  onSave: (updates: Partial<ComponentTemplate>) => void;
  onCancel: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave, onCancel }) => {
  const [label, setLabel] = useState(template.label);
  const [color, setColor] = useState(template.color);
  const [icon, setIcon] = useState(template.icon);
  const [shape, setShape] = useState(template.shape);

  const handleSave = () => {
    onSave({ label, color, icon, shape });
  };

  return (
    <div className="template-editor">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Template label"
        style={{ width: '100%', marginBottom: '8px' }}
      />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ width: '40px' }}
        />
        <input
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="Icon"
          style={{ flex: 1 }}
          maxLength={4}
        />
      </div>
      <div style={{ marginBottom: '8px' }}>
        <select value={shape} onChange={(e) => setShape(e.target.value as any)} style={{ width: '100%' }}>
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="diamond">Diamond</option>
          <option value="hexagon">Hexagon</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleSave} style={{ fontSize: '12px', flex: 1 }}>Save</button>
        <button onClick={onCancel} style={{ fontSize: '12px', flex: 1 }}>Cancel</button>
      </div>
    </div>
  );
}; 