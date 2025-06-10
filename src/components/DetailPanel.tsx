import React, { useState } from 'react';
import { DiagramComponent, Connection, ConnectionType } from '../types/diagram';

interface DetailPanelProps {
  selectedComponent: DiagramComponent | null;
  connections: Connection[];
  allComponents: DiagramComponent[];
  onUpdateComponent: (componentId: string, updates: Partial<DiagramComponent>) => void;
  onCreateConnection?: (sourceId: string, targetId: string, label: string, type: ConnectionType) => void;
  onUpdateConnection?: (connectionId: string, updates: Partial<Connection>) => void;
  onDeleteConnection?: (connectionId: string) => void;
  onSetParent?: (childId: string, parentId: string | undefined) => void;
  onToggleCollapse?: (componentId: string) => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  selectedComponent,
  connections,
  allComponents,
  onUpdateComponent,
  onCreateConnection,
  onUpdateConnection,
  onDeleteConnection,
  onSetParent,
  onToggleCollapse
}) => {
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  
  if (!selectedComponent) {
    return (
      <div className="detail-panel">
        <h3>Component Details</h3>
        <div className="no-selection">
          Click on a component to view its details
        </div>
      </div>
    );
  }

  const relatedConnections = connections.filter(
    conn => conn.sourceId === selectedComponent.id || conn.targetId === selectedComponent.id
  );

  const handleFieldChange = (field: string, value: string | string[]) => {
    onUpdateComponent(selectedComponent.id, { [field]: value });
  };

  const getConnectionDescription = (connection: Connection) => {
    const isSource = connection.sourceId === selectedComponent.id;
    const otherComponentId = isSource ? connection.targetId : connection.sourceId;
    const otherComponent = allComponents.find(c => c.id === otherComponentId);
    const direction = isSource ? '→' : '←';
    
    return `${direction} ${otherComponent?.title || 'Unknown'} ${connection.label ? `(${connection.label})` : ''}`;
  };

  const handleCreateConnection = () => {
    setEditingConnection(null);
    setShowConnectionModal(true);
  };

  const handleEditConnection = (connection: Connection) => {
    setEditingConnection(connection);
    setShowConnectionModal(true);
  };

  const handleDeleteConnection = (connectionId: string) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      onDeleteConnection?.(connectionId);
    }
  };

  return (
    <div className="detail-panel">
      <h3>Component Details</h3>
      
      <div className="detail-field">
        <label>Title</label>
        <input
          type="text"
          value={selectedComponent.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="Component title"
        />
      </div>

      <div className="detail-field">
        <label>Type</label>
        <input
          type="text"
          value={selectedComponent.type}
          readOnly
          style={{ backgroundColor: '#f8f9fa' }}
        />
      </div>

      <div className="detail-field">
        <label>Description</label>
        <textarea
          value={selectedComponent.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Component description"
        />
      </div>

      <div className="detail-field">
        <label>Position</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            value={selectedComponent.position.x}
            onChange={(e) => onUpdateComponent(selectedComponent.id, {
              position: { ...selectedComponent.position, x: parseInt(e.target.value) || 0 }
            })}
            placeholder="X"
            style={{ width: '50%' }}
          />
          <input
            type="number"
            value={selectedComponent.position.y}
            onChange={(e) => onUpdateComponent(selectedComponent.id, {
              position: { ...selectedComponent.position, y: parseInt(e.target.value) || 0 }
            })}
            placeholder="Y"
            style={{ width: '50%' }}
          />
        </div>
      </div>

      <div className="detail-field">
        <label>Size</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            value={selectedComponent.size.width}
            onChange={(e) => onUpdateComponent(selectedComponent.id, {
              size: { ...selectedComponent.size, width: parseInt(e.target.value) || 140 }
            })}
            placeholder="Width"
            style={{ width: '50%' }}
            min="50"
            max="800"
          />
          <input
            type="number"
            value={selectedComponent.size.height}
            onChange={(e) => onUpdateComponent(selectedComponent.id, {
              size: { ...selectedComponent.size, height: parseInt(e.target.value) || 80 }
            })}
            placeholder="Height"
            style={{ width: '50%' }}
            min="50"
            max="600"
          />
        </div>
      </div>

      {/* Enhanced Typography Section */}
      <div className="typography-section">
        <h4>Typography & Styling</h4>
        
        <div className="detail-field">
          <label>Subtitle</label>
          <input
            type="text"
            value={selectedComponent.subtitle || ''}
            onChange={(e) => handleFieldChange('subtitle', e.target.value)}
            placeholder="Component subtitle"
          />
        </div>

        <div className="detail-field">
          <label>Text Color</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="color"
              value={selectedComponent.textColor || '#ffffff'}
              onChange={(e) => handleFieldChange('textColor', e.target.value)}
              style={{ width: '40px', height: '30px' }}
            />
            <input
              type="text"
              value={selectedComponent.textColor || '#ffffff'}
              onChange={(e) => handleFieldChange('textColor', e.target.value)}
              placeholder="#ffffff"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="detail-field">
          <label>Font Size</label>
          <input
            type="range"
            min="8"
            max="24"
            value={selectedComponent.styling?.fontSize || 12}
            onChange={(e) => onUpdateComponent(selectedComponent.id, {
              styling: { 
                ...selectedComponent.styling, 
                fontSize: parseInt(e.target.value) 
              }
            })}
          />
          <span style={{ fontSize: '12px', color: '#666' }}>
            {selectedComponent.styling?.fontSize || 12}px
          </span>
        </div>

        <div className="detail-field">
          <label>Background Color</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="color"
              value={selectedComponent.color || '#4CAF50'}
              onChange={(e) => handleFieldChange('color', e.target.value)}
              style={{ width: '40px', height: '30px' }}
            />
            <input
              type="text"
              value={selectedComponent.color || '#4CAF50'}
              onChange={(e) => handleFieldChange('color', e.target.value)}
              placeholder="#4CAF50"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="detail-field">
          <label>Border Radius</label>
          <input
            type="range"
            min="0"
            max="20"
            value={selectedComponent.styling?.borderRadius || 4}
            onChange={(e) => onUpdateComponent(selectedComponent.id, {
              styling: { 
                ...selectedComponent.styling, 
                borderRadius: parseInt(e.target.value) 
              }
            })}
          />
          <span style={{ fontSize: '12px', color: '#666' }}>
            {selectedComponent.styling?.borderRadius || 4}px
          </span>
        </div>
      </div>

      {/* Rich Content Section */}
      <div className="content-section">
        <h4>Rich Content</h4>
        
        <div className="detail-field">
          <label>Bullet Points</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {(selectedComponent.bulletPoints || []).map((point, index) => (
              <div key={index} style={{ display: 'flex', gap: '5px' }}>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => {
                    const newPoints = [...(selectedComponent.bulletPoints || [])];
                    newPoints[index] = e.target.value;
                    onUpdateComponent(selectedComponent.id, { bulletPoints: newPoints });
                  }}
                  placeholder={`Bullet point ${index + 1}`}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => {
                    const newPoints = (selectedComponent.bulletPoints || []).filter((_, i) => i !== index);
                    onUpdateComponent(selectedComponent.id, { bulletPoints: newPoints });
                  }}
                  className="btn-sm btn-danger"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newPoints = [...(selectedComponent.bulletPoints || []), ''];
                onUpdateComponent(selectedComponent.id, { bulletPoints: newPoints });
              }}
              className="btn-sm btn-outline"
            >
              + Add Bullet Point
            </button>
          </div>
        </div>

        <div className="detail-field">
          <label>Advanced Content</label>
          <button
            onClick={() => {
              const defaultContent = {
                header: selectedComponent.title,
                subheader: 'Enhanced functionality',
                sections: [
                  {
                    title: 'Key Features',
                    items: ['Feature 1', 'Feature 2', 'Feature 3']
                  }
                ],
                footer: 'Professional component'
              };
              onUpdateComponent(selectedComponent.id, {
                content: selectedComponent.content || defaultContent
              });
            }}
            className="btn-sm btn-primary"
          >
            {selectedComponent.content ? 'Edit Advanced Content' : 'Enable Advanced Content'}
          </button>
        </div>

        {selectedComponent.content && (
          <div className="advanced-content-editor">
            <div className="detail-field">
              <label>Header</label>
              <input
                type="text"
                value={selectedComponent.content.header || ''}
                onChange={(e) => onUpdateComponent(selectedComponent.id, {
                  content: { 
                    ...selectedComponent.content, 
                    header: e.target.value 
                  }
                })}
                placeholder="Main header"
              />
            </div>

            <div className="detail-field">
              <label>Subheader</label>
              <input
                type="text"
                value={selectedComponent.content.subheader || ''}
                onChange={(e) => onUpdateComponent(selectedComponent.id, {
                  content: { 
                    ...selectedComponent.content, 
                    subheader: e.target.value 
                  }
                })}
                placeholder="Subtitle or description"
              />
            </div>

            <div className="detail-field">
              <label>Footer</label>
              <input
                type="text"
                value={selectedComponent.content.footer || ''}
                onChange={(e) => onUpdateComponent(selectedComponent.id, {
                  content: { 
                    ...selectedComponent.content, 
                    footer: e.target.value 
                  }
                })}
                placeholder="Footer text"
              />
            </div>
          </div>
        )}
      </div>

      {/* Relationship Management Section */}
      <div className="relationship-section">
        <div className="section-header">
          <h4>Relationships</h4>
          <button className="btn-primary btn-sm animated-btn" onClick={handleCreateConnection}>
            <span className="btn-icon">+</span>
            Create Connection
          </button>
        </div>

        {relatedConnections.length > 0 ? (
          <div className="connection-list">
            {relatedConnections.map(connection => (
              <div key={connection.id} className="connection-item-detailed">
                <div className="connection-info">
                  <span className="connection-text">{getConnectionDescription(connection)}</span>
                  <span className="connection-type">{connection.type || 'generic'}</span>
                </div>
                <div className="connection-actions">
                  <button 
                    className="btn-sm btn-outline animated-btn"
                    onClick={() => handleEditConnection(connection)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-sm btn-danger animated-btn"
                    onClick={() => handleDeleteConnection(connection.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-connections">
            No connections found. Click "Create Connection" to add one.
          </div>
        )}
      </div>

      {/* Nesting Section */}
      {onSetParent && (
        <div className="nesting-section">
          <div className="section-header">
            <h4>Component Nesting</h4>
          </div>
          
          <div className="form-field">
            <label>Parent Component:</label>
            <select 
              value={selectedComponent.parentId || ''} 
              onChange={(e) => onSetParent(selectedComponent.id, e.target.value || undefined)}
            >
              <option value="">No Parent (Root Level)</option>
              {allComponents
                .filter(c => c.id !== selectedComponent.id && !isDescendant(c.id, selectedComponent.id, allComponents))
                .map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.title}</option>
                ))
              }
            </select>
          </div>

          {selectedComponent.children && selectedComponent.children.length > 0 && (
            <div className="children-list">
              <label>Child Components:</label>
              {selectedComponent.children.map(childId => {
                const child = allComponents.find(c => c.id === childId);
                return child ? (
                  <div key={childId} className="child-item">
                    <span>{child.title}</span>
                    <button 
                      className="btn-sm btn-outline"
                      onClick={() => onSetParent(childId, undefined)}
                    >
                      Unlink
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {onToggleCollapse && selectedComponent.children && selectedComponent.children.length > 0 && (
            <div className="form-field">
              <button 
                className="btn-outline"
                onClick={() => onToggleCollapse(selectedComponent.id)}
              >
                {selectedComponent.isCollapsed ? 'Expand Children' : 'Collapse Children'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Connection Modal */}
      {showConnectionModal && (
        <ConnectionModal
          selectedComponent={selectedComponent}
          allComponents={allComponents}
          existingConnection={editingConnection}
          onSave={(targetId, label, type) => {
            if (editingConnection) {
              onUpdateConnection?.(editingConnection.id, { label, type });
            } else {
              onCreateConnection?.(selectedComponent.id, targetId, label, type);
            }
            setShowConnectionModal(false);
          }}
          onCancel={() => setShowConnectionModal(false)}
        />
      )}

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <small style={{ color: '#6c757d' }}>
          Component ID: {selectedComponent.id}
        </small>
      </div>
    </div>
  );
};

// Connection Modal Component
interface ConnectionModalProps {
  selectedComponent: DiagramComponent;
  allComponents: DiagramComponent[];
  existingConnection: Connection | null;
  onSave: (targetId: string, label: string, type: ConnectionType) => void;
  onCancel: () => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  selectedComponent,
  allComponents,
  existingConnection,
  onSave,
  onCancel
}) => {
  const [targetId, setTargetId] = useState(
    existingConnection ? 
      (existingConnection.sourceId === selectedComponent.id ? existingConnection.targetId : existingConnection.sourceId) : 
      ''
  );
  const [label, setLabel] = useState(existingConnection?.label || '');
  const [type, setType] = useState(existingConnection?.type || ConnectionType.GENERIC);

  const availableComponents = allComponents.filter(c => c.id !== selectedComponent.id);

  const handleSave = () => {
    if (!targetId) {
      alert('Please select a target component');
      return;
    }
    onSave(targetId, label, type);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animated-modal">
        <div className="modal-header">
          <h3>{existingConnection ? 'Edit Connection' : 'Create Connection'}</h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-field">
            <label>From: {selectedComponent.title}</label>
          </div>
          
          <div className="form-field">
            <label>To:</label>
            <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
              <option value="">Select target component</option>
              {availableComponents.map(comp => (
                <option key={comp.id} value={comp.id}>{comp.title}</option>
              ))}
            </select>
          </div>
          
          <div className="form-field">
            <label>Label:</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Connection label"
            />
          </div>
          
          <div className="form-field">
            <label>Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value as ConnectionType)}>
              <option value={ConnectionType.GENERIC}>Generic</option>
              <option value={ConnectionType.API_CALL}>API Call</option>
              <option value={ConnectionType.DATA_FLOW}>Data Flow</option>
              <option value={ConnectionType.DEPENDENCY}>Dependency</option>
              <option value={ConnectionType.INHERITANCE}>Inheritance</option>
              <option value={ConnectionType.COMPOSITION}>Composition</option>
            </select>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn-primary animated-btn" onClick={handleSave}>
            {existingConnection ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to check if a component is a descendant
const isDescendant = (potentialAncestorId: string, componentId: string, allComponents: DiagramComponent[]): boolean => {
  const component = allComponents.find(c => c.id === componentId);
  if (!component || !component.children) return false;
  
  if (component.children.includes(potentialAncestorId)) return true;
  
  return component.children.some(childId => 
    isDescendant(potentialAncestorId, childId, allComponents)
  );
}; 