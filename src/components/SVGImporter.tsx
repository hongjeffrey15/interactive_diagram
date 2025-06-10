import React, { useState, useRef } from 'react';
import { DiagramComponent, Connection, ComponentType, ConnectionType, Diagram } from '../types/diagram';
import { v4 as uuidv4 } from 'uuid';

interface SVGImporterProps {
  onImport: (diagram: Diagram) => void;
  onClose: () => void;
}

// Simplified SVG parser for the specific sample
function parseSampleSVG(svgContent: string): Diagram {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  
  const components: DiagramComponent[] = [];
  const connections: Connection[] = [];
  
  // Extract title
  const titleElement = doc.querySelector('text[font-size="24"]');
  const title = titleElement?.textContent || 'Imported Diagram';
  
  // Extract rectangles and their associated text
  const rects = Array.from(doc.querySelectorAll('rect'));
  const textElements = Array.from(doc.querySelectorAll('text'));
  
  // Filter for component rectangles (not background or large layers)
  const componentRects = rects.filter(rect => {
    const width = parseFloat(rect.getAttribute('width') || '0');
    const height = parseFloat(rect.getAttribute('height') || '0');
    return width >= 100 && width <= 400 && height >= 40 && height <= 200;
  });
  
  componentRects.forEach((rect, index) => {
    const x = parseFloat(rect.getAttribute('x') || '0');
    const y = parseFloat(rect.getAttribute('y') || '0');
    const width = parseFloat(rect.getAttribute('width') || '0');
    const height = parseFloat(rect.getAttribute('height') || '0');
    const fill = rect.getAttribute('fill') || '#4CAF50';
    
    // Find text elements within this rectangle
    const relatedTexts = textElements.filter(textEl => {
      const textX = parseFloat(textEl.getAttribute('x') || '0');
      const textY = parseFloat(textEl.getAttribute('y') || '0');
      return textX >= x && textX <= x + width && textY >= y && textY <= y + height;
    });
    
    if (relatedTexts.length === 0) return;
    
    // Get component title and description
    const titleText = relatedTexts.find(t => 
      t.getAttribute('font-weight') === 'bold' && 
      parseInt(t.getAttribute('font-size') || '0') >= 12
    );
    
    const descriptionTexts = relatedTexts.filter(t => 
      t !== titleText && t.textContent && t.textContent.trim().length > 0
    );
    
    const componentTitle = titleText?.textContent?.trim() || `Component ${index + 1}`;
    const description = descriptionTexts.map(t => t.textContent?.trim()).filter(Boolean).join('; ');
    
    // Determine component type based on content
    const allText = relatedTexts.map(t => t.textContent?.toLowerCase() || '').join(' ');
    let componentType = ComponentType.GENERIC;
    
    if (allText.includes('database') || allText.includes('storage')) {
      componentType = ComponentType.DATABASE;
    } else if (allText.includes('api') || allText.includes('gateway')) {
      componentType = ComponentType.API;
    } else if (allText.includes('agent') || allText.includes('ai')) {
      componentType = ComponentType.AGENT;
    } else if (allText.includes('service') || allText.includes('manager')) {
      componentType = ComponentType.SERVICE;
    } else if (allText.includes('user') || allText.includes('input')) {
      componentType = ComponentType.USER;
    }
    
    const component: DiagramComponent = {
      id: uuidv4(),
      type: componentType,
      position: { x: x * 0.4, y: y * 0.4 }, // Scale down
      size: { width: Math.max(width * 0.4, 150), height: Math.max(height * 0.4, 80) },
      title: componentTitle,
      description: description,
      connections: [],
      children: [],
      color: fill,
      textColor: fill === '#ffffff' ? '#333333' : '#ffffff',
      styling: {
        backgroundColor: fill,
        borderColor: rect.getAttribute('stroke') || '#333333',
        borderWidth: parseFloat(rect.getAttribute('stroke-width') || '1'),
        borderRadius: parseFloat(rect.getAttribute('rx') || '4'),
        fontSize: 12
      }
    };
    
    components.push(component);
  });
  
  // Create some basic connections based on proximity and flow
  for (let i = 0; i < components.length - 1; i++) {
    const sourceComp = components[i];
    const targetComp = components[i + 1];
    
    // Check if components are vertically aligned (same column flow)
    if (Math.abs(sourceComp.position.x - targetComp.position.x) < 100 &&
        targetComp.position.y > sourceComp.position.y) {
      
      const connection: Connection = {
        id: uuidv4(),
        sourceId: sourceComp.id,
        targetId: targetComp.id,
        label: `${sourceComp.title} → ${targetComp.title}`,
        type: ConnectionType.DATA_FLOW
      };
      
      connections.push(connection);
      sourceComp.connections.push(targetComp.id);
    }
  }
  
  return {
    id: uuidv4(),
    title: title,
    description: 'Imported from SVG',
    components,
    connections,
    createdAt: new Date(),
    updatedAt: new Date(),
    backgroundColor: '#f8f9fa',
    theme: 'light'
  };
}

export const SVGImporter: React.FC<SVGImporterProps> = ({ onImport, onClose }) => {
  console.log('SVGImporter component rendered');
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const svgFile = files.find(file => file.type === 'image/svg+xml' || file.name.endsWith('.svg'));
    
    if (svgFile) {
      handleFile(svgFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const content = await file.text();
      const diagram = parseSampleSVG(content);
      onImport(diagram);
      onClose();
    } catch (error) {
      console.error('Error parsing SVG:', error);
      alert('Failed to parse SVG file. Please ensure it\'s a valid SVG.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSampleDiagram = () => {
    console.log('Loading sample diagram...');
    // Use the actual sample SVG content from the attached file
    const sampleSVG = `<svg width="1400" height="1500" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1400" height="1500" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2"/>
  
  <!-- Title -->
  <text x="700" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#2c3e50">
    Streamlined AI-Powered CMS Architecture
  </text>
  
  <!-- User Input Layer -->
  <rect x="50" y="70" width="200" height="80" fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="5"/>
  <text x="150" y="95" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#1976d2">EDITOR INPUT</text>
  <text x="150" y="115" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#1976d2">• Draft Article</text>
  <text x="150" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#1976d2">• Rough Ideas</text>
  <text x="150" y="145" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#1976d2">• Refinements</text>
  
  <!-- CONSOLIDATED ORCHESTRATION & GATEWAY LAYER -->
  <rect x="50" y="200" width="1300" height="180" fill="#fff3e0" stroke="#f57c00" stroke-width="3" rx="5"/>
  <text x="700" y="225" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#f57c00">UNIFIED ORCHESTRATION & GATEWAY LAYER</text>
  
  <!-- Core Orchestration Components -->
  <rect x="80" y="250" width="200" height="60" fill="#ffffff" stroke="#ff9800" stroke-width="2" rx="3"/>
  <text x="180" y="270" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ff9800">Intelligent Router &</text>
  <text x="180" y="283" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ff9800">Request Handler</text>
  <text x="180" y="298" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#666">• Input Parsing & Validation</text>
  <text x="180" y="308" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#666">• Protocol Standardization</text>
  
  <rect x="320" y="250" width="200" height="60" fill="#ffffff" stroke="#ff9800" stroke-width="2" rx="3"/>
  <text x="420" y="270" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ff9800">Agent Discovery &</text>
  <text x="420" y="283" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ff9800">Task Dispatcher</text>
  <text x="420" y="298" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#666">• Service Registry</text>
  <text x="420" y="308" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#666">• Capability Matching</text>
  
  <rect x="560" y="250" width="200" height="60" fill="#ffffff" stroke="#ff9800" stroke-width="2" rx="3"/>
  <text x="660" y="270" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ff9800">Workflow Engine &</text>
  <text x="660" y="283" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ff9800">Load Balancer</text>
  <text x="660" y="298" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#666">• Execution Planning</text>
  <text x="660" y="308" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#666">• Resource Allocation</text>
  
  <rect x="800" y="250" width="200" height="60" fill="#ffffff" stroke="#ff9800" stroke-width="2" rx="3"/>
  <text x="900" y="270" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ff9800">Security & Auth</text>
  <text x="900" y="283" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ff9800">Gateway</text>
  <text x="900" y="298" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#666">• Authentication</text>
  <text x="900" y="308" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#666">• Rate Limiting</text>
  
  <!-- AI Agents -->
  <rect x="80" y="470" width="180" height="120" fill="#ffffff" stroke="#4caf50" stroke-width="1" rx="3"/>
  <text x="170" y="490" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#4caf50">RESEARCH AGENT</text>
  <text x="170" y="510" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">• Web Scraping</text>
  <text x="170" y="525" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">• Search APIs</text>
  <text x="170" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">• Data Synthesis</text>
  <text x="170" y="555" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">• Authority Sources</text>
  
  <rect x="290" y="470" width="180" height="120" fill="#ffffff" stroke="#4caf50" stroke-width="1" rx="3"/>
  <text x="380" y="490" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#4caf50">CONTENT RAG</text>
  <text x="380" y="505" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#4caf50">AGENT</text>
  <text x="380" y="525" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">• Vector Database</text>
  <text x="380" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">• Similarity Search</text>
  <text x="380" y="555" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">• Style Analysis</text>
  
  <rect x="500" y="470" width="180" height="120" fill="#ffffff" stroke="#4caf50" stroke-width="1" rx="3"/>
  <text x="590" y="490" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#4caf50">SOCIAL LISTENING</text>
  <text x="590" y="505" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#4caf50">AGENT</text>
  <text x="590" y="525" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">• Platform APIs</text>
  <text x="590" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">• Sentiment Analysis</text>
  <text x="590" y="555" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">• Trend Detection</text>
  
  <!-- Data Storage Components -->
  <rect x="150" y="890" width="200" height="40" fill="#ffffff" stroke="#8bc34a" stroke-width="1" rx="3"/>
  <text x="250" y="905" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#8bc34a">Vector Database</text>
  <text x="250" y="920" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">(Articles & Embeddings)</text>
  
  <rect x="380" y="890" width="200" height="40" fill="#ffffff" stroke="#8bc34a" stroke-width="1" rx="3"/>
  <text x="480" y="905" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#8bc34a">Cache Layer</text>
  <text x="480" y="920" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">(Redis - Results)</text>
  
  <rect x="610" y="890" width="200" height="40" fill="#ffffff" stroke="#8bc34a" stroke-width="1" rx="3"/>
  <text x="710" y="905" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#8bc34a">Metadata Store</text>
  <text x="710" y="920" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">(PostgreSQL)</text>
  
  <rect x="840" y="890" width="200" height="40" fill="#ffffff" stroke="#8bc34a" stroke-width="1" rx="3"/>
  <text x="940" y="905" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#8bc34a">File Storage</text>
  <text x="940" y="920" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">(S3 - Media Assets)</text>
</svg>`;
    
    try {
      console.log('Parsing SVG...');
      const diagram = parseSampleSVG(sampleSVG);
      console.log('Parsed diagram:', diagram);
      console.log('Components found:', diagram.components.length);
      onImport(diagram);
      onClose();
    } catch (error) {
      console.error('Error in loadSampleDiagram:', error);
      alert('Failed to load sample diagram: ' + error);
    }
  };

  return (
    <div className="svg-importer-overlay">
      <div className="svg-importer-modal">
        <div className="svg-importer-header">
          <h2>Import SVG Diagram</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <div className="svg-importer-content">
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-zone-content">
              <div className="upload-icon">📁</div>
              <p>Drop your SVG file here or click to browse</p>
              <p className="drop-zone-hint">Supports .svg files with architectural diagrams</p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          
          <div className="sample-section">
            <p>Or try with our sample diagram:</p>
            <button 
              className="sample-button"
              onClick={loadSampleDiagram}
              disabled={isProcessing}
            >
              Load Sample Architecture
            </button>
          </div>
          
          {isProcessing && (
            <div className="processing-indicator">
              <div className="spinner"></div>
              <p>Processing SVG...</p>
            </div>
          )}
        </div>
        
        <div className="svg-importer-footer">
          <p className="import-info">
            The importer will automatically detect components, connections, and layers from your SVG.
            Best results with structured architectural diagrams.
          </p>
        </div>
      </div>
    </div>
  );
}; 