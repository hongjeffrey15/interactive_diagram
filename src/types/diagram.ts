export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface DiagramComponent {
  id: string;
  type: ComponentType;
  position: Position;
  size: Size;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  color?: string;
  connections: string[]; // IDs of connected components
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  type?: ConnectionType;
  metadata?: Record<string, any>;
}

export interface Diagram {
  id: string;
  title: string;
  description?: string;
  components: DiagramComponent[];
  connections: Connection[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ComponentType {
  SERVICE = 'service',
  DATABASE = 'database',
  API = 'api',
  GATEWAY = 'gateway',
  CACHE = 'cache',
  QUEUE = 'queue',
  STORAGE = 'storage',
  USER = 'user',
  EXTERNAL = 'external',
  GENERIC = 'generic'
}

export enum ConnectionType {
  DATA_FLOW = 'data_flow',
  API_CALL = 'api_call',
  DEPENDENCY = 'dependency',
  INHERITANCE = 'inheritance',
  COMPOSITION = 'composition',
  GENERIC = 'generic'
}

export interface FocusState {
  focusedComponentId: string | null;
  highlightedConnections: string[];
  dimmedComponents: string[];
}

export interface DiagramState {
  diagram: Diagram;
  focus: FocusState;
  selectedComponentId: string | null;
  isEditing: boolean;
  zoom: number;
  pan: Position;
} 