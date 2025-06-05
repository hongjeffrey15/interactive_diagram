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
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  selectedComponent,
  connections,
  allComponents,
  onUpdateComponent,
  onCreateConnection,
  onUpdateConnection,
  onDeleteConnection
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

  const handleFieldChange = (field: string, value: string) => {
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
              size: { ...selectedComponent.size, width: parseInt(e.target.value) || 0 }
            })}
            placeholder="Width"
            style={{ width: '50%' }}
          />
          <input
            type="number"
            value={selectedComponent.size.height}
            onChange={(e) => onUpdateComponent(selectedComponent.id, {
              size: { ...selectedComponent.size, height: parseInt(e.target.value) || 0 }
            })}
            placeholder="Height"
            style={{ width: '50%' }}
          />
        </div>
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