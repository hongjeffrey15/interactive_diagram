import { DiagramComponent, Connection, ComponentType, ConnectionType, Diagram } from '../types/diagram';
import { v4 as uuidv4 } from 'uuid';

interface SVGRect {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rx?: number;
}

interface SVGText {
  x: number;
  y: number;
  content: string;
  fontSize: number;
  fontWeight: string;
  fill: string;
  textAnchor: string;
}

interface SVGPath {
  d: string;
  stroke: string;
  strokeWidth: number;
  markerEnd?: string;
  strokeDasharray?: string;
}

interface LayerDefinition {
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  backgroundColor: string;
  components: DiagramComponent[];
}

export class SVGParser {
  private svgContent: string;
  private parser: DOMParser;
  private doc: Document;
  private components: DiagramComponent[] = [];
  private connections: Connection[] = [];
  private layers: LayerDefinition[] = [];

  constructor(svgContent: string) {
    this.svgContent = svgContent;
    this.parser = new DOMParser();
    this.doc = this.parser.parseFromString(svgContent, 'image/svg+xml');
  }

  public parse(): Diagram {
    this.extractLayers();
    this.extractComponents();
    this.extractConnections();
    this.assignComponentsToLayers();
    this.createNestedStructure();

    const title = this.extractTitle() || 'Imported Diagram';
    
    return {
      id: uuidv4(),
      title,
      description: 'Imported from SVG',
      components: this.components,
      connections: this.connections,
      createdAt: new Date(),
      updatedAt: new Date(),
      backgroundColor: '#f8f9fa',
      theme: 'light'
    };
  }

  private extractTitle(): string | null {
    const titleElements = this.doc.querySelectorAll('text');
    for (const element of Array.from(titleElements)) {
      const fontSize = parseInt(element.getAttribute('font-size') || '0');
      const fontWeight = element.getAttribute('font-weight');
      if (fontSize >= 20 || fontWeight === 'bold') {
        return element.textContent || null;
      }
    }
    return null;
  }

  private extractLayers(): void {
    const rects = this.doc.querySelectorAll('rect');
    const layerRects: SVGRect[] = [];

    Array.from(rects).forEach(rect => {
      const width = parseFloat(rect.getAttribute('width') || '0');
      const height = parseFloat(rect.getAttribute('height') || '0');
      
      // Consider large rectangles as potential layers
      if (width > 500 && height > 80) {
        layerRects.push({
          x: parseFloat(rect.getAttribute('x') || '0'),
          y: parseFloat(rect.getAttribute('y') || '0'),
          width,
          height,
          fill: rect.getAttribute('fill') || '#ffffff',
          stroke: rect.getAttribute('stroke') || '#000000',
          strokeWidth: parseFloat(rect.getAttribute('stroke-width') || '1'),
          rx: parseFloat(rect.getAttribute('rx') || '0')
        });
      }
    });

    // Sort by y position to get layer order
    layerRects.sort((a, b) => a.y - b.y);

    // Find text elements that could be layer titles
    const textElements = this.doc.querySelectorAll('text');
    
    layerRects.forEach((rect, index) => {
      let layerName = `Layer ${index + 1}`;
      
      // Find the title text for this layer
      Array.from(textElements).forEach(textEl => {
        const textY = parseFloat(textEl.getAttribute('y') || '0');
        const fontSize = parseInt(textEl.getAttribute('font-size') || '12');
        const fontWeight = textEl.getAttribute('font-weight');
        
        if (textY >= rect.y && textY <= rect.y + 50 && 
            (fontSize >= 16 || fontWeight === 'bold')) {
          const content = textEl.textContent?.trim();
          if (content && content.length > 3) {
            layerName = content;
          }
        }
      });

      this.layers.push({
        name: layerName,
        bounds: rect,
        backgroundColor: rect.fill,
        components: []
      });
    });
  }

  private extractComponents(): void {
    const rects = this.doc.querySelectorAll('rect');
    const textElements = this.doc.querySelectorAll('text');

    Array.from(rects).forEach(rect => {
      const width = parseFloat(rect.getAttribute('width') || '0');
      const height = parseFloat(rect.getAttribute('height') || '0');
      const x = parseFloat(rect.getAttribute('x') || '0');
      const y = parseFloat(rect.getAttribute('y') || '0');

      // Filter out layer rectangles and focus on component-sized rectangles
      if (width >= 50 && width <= 400 && height >= 30 && height <= 200) {
        const component = this.createComponentFromRect(rect, textElements);
        if (component) {
          this.components.push(component);
        }
      }
    });
  }

  private createComponentFromRect(rect: Element, textElements: NodeListOf<Element>): DiagramComponent | null {
    const x = parseFloat(rect.getAttribute('x') || '0');
    const y = parseFloat(rect.getAttribute('y') || '0');
    const width = parseFloat(rect.getAttribute('width') || '0');
    const height = parseFloat(rect.getAttribute('height') || '0');
    const fill = rect.getAttribute('fill') || '#4CAF50';
    const stroke = rect.getAttribute('stroke') || '#333333';

    // Find all text elements within this rectangle
    const relatedTexts: SVGText[] = [];
    Array.from(textElements).forEach(textEl => {
      const textX = parseFloat(textEl.getAttribute('x') || '0');
      const textY = parseFloat(textEl.getAttribute('y') || '0');
      
      if (textX >= x && textX <= x + width && textY >= y && textY <= y + height) {
        relatedTexts.push({
          x: textX,
          y: textY,
          content: textEl.textContent?.trim() || '',
          fontSize: parseInt(textEl.getAttribute('font-size') || '12'),
          fontWeight: textEl.getAttribute('font-weight') || 'normal',
          fill: textEl.getAttribute('fill') || '#000000',
          textAnchor: textEl.getAttribute('text-anchor') || 'start'
        });
      }
    });

    if (relatedTexts.length === 0) return null;

    // Sort texts by y position and font size to determine hierarchy
    relatedTexts.sort((a, b) => {
      if (Math.abs(a.y - b.y) < 5) {
        return b.fontSize - a.fontSize; // Larger font first if on same line
      }
      return a.y - b.y; // Top to bottom
    });

    // Determine component type based on content
    const allText = relatedTexts.map(t => t.content.toLowerCase()).join(' ');
    const componentType = this.inferComponentType(allText);

    // Extract title and content
    const title = relatedTexts[0]?.content || 'Component';
    const bulletPoints: string[] = [];
    
    // Simplified approach - just collect all text as bullet points for now
    relatedTexts.slice(1).forEach(text => {
      const content = text.content.trim();
      if (content && !content.startsWith('•')) {
        bulletPoints.push(content);
      } else if (content.startsWith('•')) {
        const cleanContent = content.replace(/^[•\d.\s]+/, '');
        if (cleanContent) {
          bulletPoints.push(cleanContent);
        }
      }
    });

    // Create rich content structure - simplified for now
    const content = bulletPoints.length > 0 ? {
      header: title,
      sections: [{ items: bulletPoints }]
    } : undefined;

    const component: DiagramComponent = {
      id: uuidv4(),
      type: componentType,
      position: { x: x * 0.5, y: y * 0.5 }, // Scale down coordinates
      size: { width: Math.max(width * 0.5, 140), height: Math.max(height * 0.5, 80) },
      title: title,
      description: bulletPoints.join('; '),
      bulletPoints: bulletPoints.length > 0 ? bulletPoints : undefined,
      content: content,
      connections: [],
      children: [],
      color: fill,
      textColor: this.getContrastColor(fill),
      styling: {
        backgroundColor: fill,
        borderColor: stroke,
        borderWidth: parseFloat(rect.getAttribute('stroke-width') || '1'),
        borderRadius: parseFloat(rect.getAttribute('rx') || '4'),
        fontSize: 12
      }
    };

    return component;
  }

  private inferComponentType(text: string): ComponentType {
    const keywords = {
      [ComponentType.DATABASE]: ['database', 'storage', 'cache', 'vector', 'postgresql', 'redis', 's3'],
      [ComponentType.API]: ['api', 'gateway', 'endpoint', 'rest', 'graphql'],
      [ComponentType.SERVICE]: ['service', 'microservice', 'handler', 'controller', 'manager'],
      [ComponentType.AGENT]: ['agent', 'ai', 'ml', 'intelligence', 'learning', 'analysis'],
      [ComponentType.QUEUE]: ['queue', 'message', 'broker', 'event'],
      [ComponentType.USER]: ['user', 'editor', 'input', 'interface'],
      [ComponentType.EXTERNAL]: ['external', 'third-party', 'integration'],
      [ComponentType.GATEWAY]: ['gateway', 'router', 'orchestration', 'dispatcher']
    };

    for (const [type, typeKeywords] of Object.entries(keywords)) {
      if (typeKeywords.some(keyword => text.includes(keyword))) {
        return type as ComponentType;
      }
    }

    return ComponentType.GENERIC;
  }

  private getContrastColor(backgroundColor: string): string {
    // Simple contrast color calculation
    if (backgroundColor === '#ffffff' || backgroundColor.includes('f')) {
      return '#333333';
    }
    return '#ffffff';
  }

  private extractConnections(): void {
    const paths = this.doc.querySelectorAll('path');
    
    Array.from(paths).forEach(path => {
      const d = path.getAttribute('d');
      const stroke = path.getAttribute('stroke') || '#333333';
      const markerEnd = path.getAttribute('marker-end');
      const strokeDasharray = path.getAttribute('stroke-dasharray');
      
      if (d && markerEnd?.includes('arrowhead')) {
        const connection = this.createConnectionFromPath(d, stroke, strokeDasharray || undefined);
        if (connection) {
          this.connections.push(connection);
        }
      }
    });
  }

  private createConnectionFromPath(d: string, stroke: string, strokeDasharray?: string): Connection | null {
    // Parse path to extract start and end points
    const pathRegex = /M\s*(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?).*?L\s*(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?)/;
    const match = d.match(pathRegex);
    
    if (!match) return null;

    const startX = parseFloat(match[1]) * 0.5;
    const startY = parseFloat(match[2]) * 0.5;
    const endX = parseFloat(match[3]) * 0.5;
    const endY = parseFloat(match[4]) * 0.5;

    // Find components near start and end points
    const sourceComponent = this.findComponentNearPoint(startX, startY);
    const targetComponent = this.findComponentNearPoint(endX, endY);

    if (!sourceComponent || !targetComponent || sourceComponent.id === targetComponent.id) {
      return null;
    }

    const connectionType = strokeDasharray ? 
      (strokeDasharray.includes('5,5') ? ConnectionType.DEPENDENCY : ConnectionType.DATA_FLOW) : 
      ConnectionType.GENERIC;

    return {
      id: uuidv4(),
      sourceId: sourceComponent.id,
      targetId: targetComponent.id,
      label: `${sourceComponent.title} → ${targetComponent.title}`,
      type: connectionType
    };
  }

  private findComponentNearPoint(x: number, y: number, tolerance: number = 50): DiagramComponent | null {
    for (const component of this.components) {
      const compX = component.position.x;
      const compY = component.position.y;
      const compW = component.size.width;
      const compH = component.size.height;

      // Check if point is near the component boundaries
      if (x >= compX - tolerance && x <= compX + compW + tolerance &&
          y >= compY - tolerance && y <= compY + compH + tolerance) {
        return component;
      }
    }
    return null;
  }

  private assignComponentsToLayers(): void {
    this.components.forEach(component => {
      const layer = this.layers.find(layer => 
        component.position.x >= layer.bounds.x * 0.5 &&
        component.position.x <= (layer.bounds.x + layer.bounds.width) * 0.5 &&
        component.position.y >= layer.bounds.y * 0.5 &&
        component.position.y <= (layer.bounds.y + layer.bounds.height) * 0.5
      );

      if (layer) {
        layer.components.push(component);
        // Add layer information to component metadata
        component.metadata = {
          ...component.metadata,
          layer: layer.name,
          layerColor: layer.backgroundColor
        };
      }
    });
  }

  private createNestedStructure(): void {
    // Group components by layers and create parent-child relationships
    this.layers.forEach(layer => {
      if (layer.components.length > 1) {
        // Create a parent component for the layer
        const layerBounds = layer.bounds;
        const parentComponent: DiagramComponent = {
          id: uuidv4(),
          type: ComponentType.GENERIC,
          position: { 
            x: layerBounds.x * 0.5, 
            y: layerBounds.y * 0.5 
          },
          size: { 
            width: layerBounds.width * 0.5, 
            height: layerBounds.height * 0.5 
          },
          title: layer.name,
          description: `Container for ${layer.components.length} components`,
          connections: [],
          children: layer.components.map(c => c.id),
          color: layer.backgroundColor,
          textColor: this.getContrastColor(layer.backgroundColor),
          styling: {
            backgroundColor: layer.backgroundColor,
            borderRadius: 8,
            fontSize: 16
          }
        };

        // Set parent-child relationships
        layer.components.forEach(component => {
          component.parentId = parentComponent.id;
          // Adjust position relative to parent
          component.position.x -= parentComponent.position.x;
          component.position.y -= parentComponent.position.y;
        });

        this.components.push(parentComponent);
      }
    });
  }

  public static async parseFromFile(file: File): Promise<Diagram> {
    const content = await file.text();
    const parser = new SVGParser(content);
    return parser.parse();
  }

  public static parseFromString(svgContent: string): Diagram {
    const parser = new SVGParser(svgContent);
    return parser.parse();
  }
} 