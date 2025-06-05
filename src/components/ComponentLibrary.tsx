import React, { useState } from 'react';
import { ComponentType, Position } from '../types/diagram';
import { v4 as uuidv4 } from 'uuid';

interface ComponentTemplate {
  id: string;
  type: ComponentType;
  label: string;
  color: string;
  icon: string;
}

interface ComponentLibraryProps {
  onAddComponent: (type: ComponentType, position: Position) => void;
  onCreateCustomComponent?: () => void;
}

const defaultTemplates: ComponentTemplate[] = [
  { id: '1', type: ComponentType.SERVICE, label: 'Service', color: '#4CAF50', icon: 'SVC' },
  { id: '2', type: ComponentType.DATABASE, label: 'Database', color: '#2196F3', icon: 'DB' },
  { id: '3', type: ComponentType.API, label: 'API', color: '#FF9800', icon: 'API' },
  { id: '4', type: ComponentType.GATEWAY, label: 'Gateway', color: '#9C27B0', icon: 'GW' },
  { id: '5', type: ComponentType.CACHE, label: 'Cache', color: '#F44336', icon: 'CH' },
  { id: '6', type: ComponentType.QUEUE, label: 'Queue', color: '#795548', icon: 'Q' },
  { id: '7', type: ComponentType.STORAGE, label: 'Storage', color: '#607D8B', icon: 'ST' },
  { id: '8', type: ComponentType.USER, label: 'User', color: '#E91E63', icon: 'U' },
  { id: '9', type: ComponentType.EXTERNAL, label: 'External', color: '#757575', icon: 'EXT' },
  { id: '10', type: ComponentType.GENERIC, label: 'Generic', color: '#666666', icon: 'GEN' }
];

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  onAddComponent,
  onCreateCustomComponent
}) => {
  const [templates, setTemplates] = useState<ComponentTemplate[]>(defaultTemplates);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const handleComponentClick = (type: ComponentType) => {
    onAddComponent(type, { x: 400, y: 300 });
  };

  const handleDragStart = (event: React.DragEvent, type: ComponentType) => {
    event.dataTransfer.setData('componentType', type);
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
      icon: 'NEW'
    };
    setTemplates(prev => [...prev, newTemplate]);
    setEditingTemplate(newTemplate.id);
  };

  return (
    <div className="component-library">
      <h3>Components</h3>
      <div className="component-list">
        {templates.map(template => (
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
                  className="component-item"
                  draggable
                  onClick={() => handleComponentClick(template.type)}
                  onDragStart={(e) => handleDragStart(e, template.type)}
                  title={`Add ${template.label} component`}
                >
                  <div 
                    className="component-icon"
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

  const handleSave = () => {
    onSave({ label, color, icon });
  };

  return (
    <div className="template-editor">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Template label"
        style={{ width: '100%', marginBottom: '5px' }}
      />
      <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ width: '30px' }}
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
      <div style={{ display: 'flex', gap: '5px' }}>
        <button onClick={handleSave} style={{ fontSize: '12px' }}>Save</button>
        <button onClick={onCancel} style={{ fontSize: '12px' }}>Cancel</button>
      </div>
    </div>
  );
}; 