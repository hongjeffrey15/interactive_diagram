import React, { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DiagramCanvas } from './components/DiagramCanvas';
import { ComponentLibrary } from './components/ComponentLibrary';
import { DetailPanel } from './components/DetailPanel';
import { Toolbar } from './components/Toolbar';
import { TabBar } from './components/TabBar';
import { 
  DiagramComponent, 
  Position, 
  ComponentType, 
  ConnectionType,
  FocusState,
  Diagram,
  Connection
} from './types/diagram';
import './App.css';

const initialDiagram: Diagram = {
  id: uuidv4(),
  title: 'New Diagram',
  description: '',
  components: [
    {
      id: '1',
      type: ComponentType.USER,
      position: { x: 100, y: 100 },
      size: { width: 120, height: 80 },
      title: 'User',
      description: 'End user of the system',
      connections: ['2']
    },
    {
      id: '2',
      type: ComponentType.GATEWAY,
      position: { x: 300, y: 100 },
      size: { width: 140, height: 80 },
      title: 'API Gateway',
      description: 'Main entry point for all requests',
      connections: ['1', '3', '4']
    },
    {
      id: '3',
      type: ComponentType.SERVICE,
      position: { x: 500, y: 50 },
      size: { width: 130, height: 80 },
      title: 'Auth Service',
      description: 'Handles authentication and authorization',
      connections: ['2', '5']
    },
    {
      id: '4',
      type: ComponentType.SERVICE,
      position: { x: 500, y: 150 },
      size: { width: 130, height: 80 },
      title: 'Data Service',
      description: 'Main business logic service',
      connections: ['2', '6']
    },
    {
      id: '5',
      type: ComponentType.DATABASE,
      position: { x: 700, y: 50 },
      size: { width: 120, height: 80 },
      title: 'User DB',
      description: 'User data storage',
      connections: ['3']
    },
    {
      id: '6',
      type: ComponentType.DATABASE,
      position: { x: 700, y: 150 },
      size: { width: 120, height: 80 },
      title: 'Main DB',
      description: 'Primary application database',
      connections: ['4']
    }
  ],
  connections: [
    {
      id: 'c1',
      sourceId: '1',
      targetId: '2',
      label: 'HTTP Request',
      type: ConnectionType.API_CALL
    },
    {
      id: 'c2',
      sourceId: '2',
      targetId: '3',
      label: 'Auth Check',
      type: ConnectionType.API_CALL
    },
    {
      id: 'c3',
      sourceId: '2',
      targetId: '4',
      label: 'Business Logic',
      type: ConnectionType.API_CALL
    },
    {
      id: 'c4',
      sourceId: '3',
      targetId: '5',
      label: 'User Query',
      type: ConnectionType.DATA_FLOW
    },
    {
      id: 'c5',
      sourceId: '4',
      targetId: '6',
      label: 'Data Query',
      type: ConnectionType.DATA_FLOW
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

function App() {
  const [diagrams, setDiagrams] = useState<Diagram[]>([initialDiagram]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const diagram = diagrams[activeTabIndex];
  
  const [focusState, setFocusState] = useState<FocusState>({
    focusedComponentId: null,
    highlightedConnections: [],
    dimmedComponents: []
  });
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  // Calculate focus state when a component is focused
  const calculateFocusState = useCallback((componentId: string | null): FocusState => {
    if (!componentId) {
      return {
        focusedComponentId: null,
        highlightedConnections: [],
        dimmedComponents: []
      };
    }

    const relatedConnections = diagram.connections.filter(
      conn => conn.sourceId === componentId || conn.targetId === componentId
    );

    const relatedComponentIds = new Set<string>();
    relatedConnections.forEach(conn => {
      relatedComponentIds.add(conn.sourceId);
      relatedComponentIds.add(conn.targetId);
    });

    const dimmedComponents = diagram.components
      .filter(comp => comp.id !== componentId && !relatedComponentIds.has(comp.id))
      .map(comp => comp.id);

    return {
      focusedComponentId: componentId,
      highlightedConnections: relatedConnections.map(conn => conn.id),
      dimmedComponents
    };
  }, [diagram.connections, diagram.components]);

  const handleComponentClick = useCallback((componentId: string) => {
    const newFocusState = calculateFocusState(componentId);
    setFocusState(newFocusState);
    setSelectedComponentId(componentId);
  }, [calculateFocusState]);

  const handleCanvasClick = useCallback(() => {
    setFocusState({
      focusedComponentId: null,
      highlightedConnections: [],
      dimmedComponents: []
    });
    setSelectedComponentId(null);
  }, []);

  const handleComponentDrag = useCallback((componentId: string, newPosition: Position) => {
    setDiagrams(prev => prev.map(d =>
      d.id === diagram.id
        ? {
            ...d,
            components: d.components.map(comp =>
              comp.id === componentId
                ? { ...comp, position: newPosition }
                : comp
            ),
            updatedAt: new Date()
          }
        : d
    ));
  }, [diagram.id]);

  const handleAddComponent = useCallback((type: ComponentType, position: Position) => {
    const newComponent: DiagramComponent = {
      id: uuidv4(),
      type,
      position,
      size: { width: 140, height: 80 },
      title: `New ${type}`,
      description: '',
      connections: []
    };

    setDiagrams(prev => prev.map(d =>
      d.id === diagram.id
        ? {
            ...d,
            components: [...d.components, newComponent],
            updatedAt: new Date()
          }
        : d
    ));
  }, [diagram.id]);

  const handleComponentDrop = useCallback((componentType: string, position: Position) => {
    handleAddComponent(componentType as ComponentType, position);
  }, [handleAddComponent]);

  const handleUpdateComponent = useCallback((componentId: string, updates: Partial<DiagramComponent>) => {
    setDiagrams(prev => prev.map(d =>
      d.id === diagram.id
        ? {
            ...d,
            components: d.components.map(comp =>
              comp.id === componentId
                ? { ...comp, ...updates }
                : comp
            ),
            updatedAt: new Date()
          }
        : d
    ));
  }, [diagram.id]);

  const handleDeleteComponent = useCallback((componentId: string) => {
    if (window.confirm('Are you sure you want to delete this component?')) {
      setDiagrams(prev => prev.map(d =>
        d.id === diagram.id
          ? {
              ...d,
              components: d.components.filter(comp => comp.id !== componentId),
              connections: d.connections.filter(conn => 
                conn.sourceId !== componentId && conn.targetId !== componentId
              ),
              updatedAt: new Date()
            }
          : d
      ));
      
      // Clear selection if the deleted component was selected
      if (selectedComponentId === componentId) {
        setSelectedComponentId(null);
        handleCanvasClick();
      }
    }
  }, [selectedComponentId, handleCanvasClick, diagram.id]);

  const handleCreateConnection = useCallback((sourceId: string, targetId: string, label: string, type: ConnectionType) => {
    const newConnection: Connection = {
      id: uuidv4(),
      sourceId,
      targetId,
      label,
      type
    };

    setDiagrams(prev => prev.map(d =>
      d.id === diagram.id
        ? {
            ...d,
            connections: [...d.connections, newConnection],
            components: d.components.map(comp => {
              if (comp.id === sourceId) {
                return { ...comp, connections: [...comp.connections, targetId] };
              }
              if (comp.id === targetId) {
                return { ...comp, connections: [...comp.connections, sourceId] };
              }
              return comp;
            }),
            updatedAt: new Date()
          }
        : d
    ));
  }, [diagram.id]);

  const handleUpdateConnection = useCallback((connectionId: string, updates: Partial<Connection>) => {
    setDiagrams(prev => prev.map(d =>
      d.id === diagram.id
        ? {
            ...d,
            connections: d.connections.map(conn =>
              conn.id === connectionId
                ? { ...conn, ...updates }
                : conn
            ),
            updatedAt: new Date()
          }
        : d
    ));
  }, [diagram.id]);

  const handleDeleteConnection = useCallback((connectionId: string) => {
    const connection = diagram.connections.find(c => c.id === connectionId);
    if (!connection) return;

    setDiagrams(prev => prev.map(d =>
      d.id === diagram.id
        ? {
            ...d,
            connections: d.connections.filter(conn => conn.id !== connectionId),
            components: d.components.map(comp => {
              if (comp.id === connection.sourceId) {
                return { ...comp, connections: comp.connections.filter(id => id !== connection.targetId) };
              }
              if (comp.id === connection.targetId) {
                return { ...comp, connections: comp.connections.filter(id => id !== connection.sourceId) };
              }
              return comp;
            }),
            updatedAt: new Date()
          }
        : d
    ));
  }, [diagram.id, diagram.connections]);

  const handleExportDiagram = useCallback((format: 'json' | 'png' = 'json') => {
    if (format === 'json') {
      // JSON export (existing functionality)
      const dataStr = JSON.stringify(diagram, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${diagram.title.replace(/\s+/g, '_')}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'png') {
      // PNG export
      const svgElement = document.querySelector('.diagram-canvas svg') as SVGElement;
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = svgElement.clientWidth || 800;
      canvas.height = svgElement.clientHeight || 600;

      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = '#f8f9fa';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${diagram.title.replace(/\s+/g, '_')}.png`;
              link.click();
              URL.revokeObjectURL(url);
            }
          }, 'image/png');
        }
      };

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
    }
  }, [diagram]);

  const handleImportDiagram = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.svg,.html';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          if (file.name.endsWith('.json')) {
            // Import JSON diagram
            const importedDiagram = JSON.parse(content);
            setDiagrams(prev => [
              ...prev,
              {
                ...importedDiagram,
                id: uuidv4(),
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ]);
          } else if (file.name.endsWith('.svg') || file.name.endsWith('.html')) {
            // Basic SVG/HTML import - convert to components
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, file.name.endsWith('.svg') ? 'image/svg+xml' : 'text/html');
            
            // Simple conversion logic - this is basic and can be expanded
            const rects = doc.querySelectorAll('rect');
            const circles = doc.querySelectorAll('circle');
            
            const importedComponents: DiagramComponent[] = [];
            
            rects.forEach((rect, index) => {
              const x = parseFloat(rect.getAttribute('x') || '0');
              const y = parseFloat(rect.getAttribute('y') || '0');
              const width = parseFloat(rect.getAttribute('width') || '100');
              const height = parseFloat(rect.getAttribute('height') || '60');
              
              importedComponents.push({
                id: uuidv4(),
                type: ComponentType.GENERIC,
                position: { x, y },
                size: { width, height },
                title: `Imported Component ${index + 1}`,
                description: 'Imported from SVG/HTML',
                connections: []
              });
            });
            
            circles.forEach((circle, index) => {
              const cx = parseFloat(circle.getAttribute('cx') || '0');
              const cy = parseFloat(circle.getAttribute('cy') || '0');
              const r = parseFloat(circle.getAttribute('r') || '30');
              
              importedComponents.push({
                id: uuidv4(),
                type: ComponentType.USER,
                position: { x: cx - r, y: cy - r },
                size: { width: r * 2, height: r * 2 },
                title: `User ${index + 1}`,
                description: 'Imported from SVG/HTML',
                connections: []
              });
            });

            if (importedComponents.length > 0) {
              setDiagrams(prev => [
                ...prev,
                {
                  ...diagram,
                  components: [...diagram.components, ...importedComponents],
                  updatedAt: new Date()
                }
              ]);
            }
          }
        } catch (error) {
          alert('Error importing file: ' + error);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }, [diagram]);

  const handleCreateCustomComponent = useCallback(() => {
    const title = prompt('Enter component title:') || 'Custom Component';
    const description = prompt('Enter component description:') || '';
    const shape = prompt('Enter shape (rectangle/circle/hexagon):') || 'rectangle';
    
    let componentType = ComponentType.GENERIC;
    switch (shape.toLowerCase()) {
      case 'circle':
        componentType = ComponentType.USER;
        break;
      case 'hexagon':
        componentType = ComponentType.EXTERNAL;
        break;
      default:
        componentType = ComponentType.GENERIC;
    }
    
    const newComponent: DiagramComponent = {
      id: uuidv4(),
      type: componentType,
      position: { x: 400, y: 300 }, // Center of canvas
      size: { width: 140, height: 80 },
      title,
      description,
      connections: []
    };

    setDiagrams(prev => prev.map(d =>
      d.id === diagram.id
        ? {
            ...d,
            components: [...d.components, newComponent],
            updatedAt: new Date()
          }
        : d
    ));
  }, [diagram]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setDiagrams(prev => prev.map(d =>
      d.id === diagram.id
        ? {
            ...d,
            title: newTitle,
            updatedAt: new Date()
          }
        : d
    ));
  }, [diagram]);

  const handleNewTab = useCallback(() => {
    const newDiagram: Diagram = {
      id: uuidv4(),
      title: `New Diagram ${diagrams.length + 1}`,
      description: '',
      components: [],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setDiagrams(prev => [...prev, newDiagram]);
    setActiveTabIndex(diagrams.length);
  }, [diagrams.length]);

  const handleCloseTab = useCallback((index: number) => {
    if (diagrams.length === 1) return; // Don't close if it's the only tab
    
    if (window.confirm('Are you sure you want to close this diagram?')) {
      setDiagrams(prev => prev.filter((_, i) => i !== index));
      
      // Adjust active tab if necessary
      if (index === activeTabIndex && index === diagrams.length - 1) {
        setActiveTabIndex(index - 1);
      } else if (index < activeTabIndex) {
        setActiveTabIndex(activeTabIndex - 1);
      }
    }
  }, [diagrams.length, activeTabIndex]);

  const handleTabSwitch = useCallback((index: number) => {
    setActiveTabIndex(index);
    // Clear selection when switching tabs
    setSelectedComponentId(null);
    setFocusState({
      focusedComponentId: null,
      highlightedConnections: [],
      dimmedComponents: []
    });
  }, []);

  const selectedComponent = useMemo(() => 
    selectedComponentId ? (diagram.components.find(c => c.id === selectedComponentId) || null) : null
  , [selectedComponentId, diagram.components]);

  return (
    <div className="app">
      <Toolbar 
        diagramTitle={diagram.title}
        onExport={handleExportDiagram}
        onImport={handleImportDiagram}
        onCreateCustomComponent={handleCreateCustomComponent}
        onClearFocus={handleCanvasClick}
        onTitleChange={handleTitleChange}
      />
      
      <TabBar
        diagrams={diagrams}
        activeTabIndex={activeTabIndex}
        onTabSwitch={handleTabSwitch}
        onNewTab={handleNewTab}
        onCloseTab={handleCloseTab}
      />
      
      <div className="main-content">
        <ComponentLibrary 
          onAddComponent={handleAddComponent}
          onCreateCustomComponent={handleCreateCustomComponent}
        />
        
        <div className="canvas-container">
          <DiagramCanvas
            components={diagram.components}
            connections={diagram.connections}
            focusState={focusState}
            onComponentClick={handleComponentClick}
            onComponentDrag={handleComponentDrag}
            onComponentDelete={handleDeleteComponent}
            onCanvasClick={handleCanvasClick}
            onComponentDrop={handleComponentDrop}
            width={0}
            height={0}
          />
        </div>
        
        <DetailPanel
          selectedComponent={selectedComponent}
          connections={diagram.connections}
          allComponents={diagram.components}
          onUpdateComponent={handleUpdateComponent}
          onCreateConnection={handleCreateConnection}
          onUpdateConnection={handleUpdateConnection}
          onDeleteConnection={handleDeleteConnection}
        />
      </div>
    </div>
  );
}

export default App; 