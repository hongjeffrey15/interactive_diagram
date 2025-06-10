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
  subtitle?: string; // For hierarchical text
  bulletPoints?: string[]; // For list content
  metadata?: Record<string, any>;
  color?: string;
  textColor?: string;
  connections: string[]; // IDs of connected components
  parentId?: string; // ID of parent component for nesting
  children?: string[]; // IDs of child components
  isCollapsed?: boolean; // For nested component visualization
  content?: {
    header?: string;
    subheader?: string;
    sections?: Array<{
      title?: string;
      items: string[];
    }>;
    footer?: string;
  };
  styling?: {
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | 'lighter';
    backgroundColor?: string;
    backgroundGradient?: {
      from: string;
      to: string;
      direction?: 'horizontal' | 'vertical' | 'diagonal';
    };
  };
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
  backgroundColor?: string; // Canvas background color
  theme?: 'light' | 'dark' | 'custom';
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
  GENERIC = 'generic',
  AGENT = 'agent', // New agent type for AI agents
  MICROSERVICE = 'microservice',
  CONTAINER = 'container'
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

// JSON Template Schema for SVG Import/Export
export interface DiagramJSONSchema {
  version: string;
  metadata: {
    title: string;
    description?: string;
    author?: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
  };
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
    gridEnabled: boolean;
    gridSize: number;
    theme: 'light' | 'dark' | 'custom';
  };
  components: ComponentSchema[];
  connections: ConnectionSchema[];
  layout: {
    autoLayout: boolean;
    direction: 'horizontal' | 'vertical' | 'radial' | 'hierarchical';
    spacing: {
      horizontal: number;
      vertical: number;
    };
  };
  styling: {
    fonts: {
      primary: string;
      secondary: string;
      monospace: string;
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      border: string;
    };
    borderRadius: number;
    shadows: boolean;
  };
}

export interface ComponentSchema {
  id: string;
  type: ComponentType;
  geometry: {
    position: Position;
    size: Size;
    rotation?: number;
    zIndex?: number;
  };
  content: {
    title: string;
    description?: string;
    icon?: string;
    image?: string;
  };
  styling: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderStyle: 'solid' | 'dashed' | 'dotted';
    textColor: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold' | 'lighter';
    opacity: number;
    shape: 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'triangle' | 'custom';
  };
  behavior: {
    draggable: boolean;
    resizable: boolean;
    selectable: boolean;
    connectable: boolean;
  };
  hierarchy: {
    parentId?: string;
    children: string[];
    isCollapsed: boolean;
    nestingLevel: number;
  };
  metadata: Record<string, any>;
}

export interface ConnectionSchema {
  id: string;
  source: {
    componentId: string;
    connectionPoint: 'top' | 'bottom' | 'left' | 'right' | 'center';
    offset?: Position;
  };
  target: {
    componentId: string;
    connectionPoint: 'top' | 'bottom' | 'left' | 'right' | 'center';
    offset?: Position;
  };
  routing: {
    type: 'straight' | 'curved' | 'orthogonal' | 'bezier';
    waypoints?: Position[];
    curvature?: number;
  };
  styling: {
    strokeColor: string;
    strokeWidth: number;
    strokeStyle: 'solid' | 'dashed' | 'dotted';
    arrowType: 'none' | 'arrow' | 'diamond' | 'circle';
    arrowSize: number;
    opacity: number;
  };
  content: {
    label?: string;
    labelPosition: 'start' | 'middle' | 'end';
    labelOffset?: Position;
  };
  type: ConnectionType;
  metadata: Record<string, any>;
} 