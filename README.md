# Interactive Diagram Tool MVP

A web-based interactive diagram tool that allows users to create architectural diagrams with click-to-focus functionality. Built with React, TypeScript, and D3.js.

## Features

### Phase 1 - Core Interaction (MVP)
- ✅ **Interactive Component Focus**: Click any component to highlight its relationships
- ✅ **Drag & Drop**: Reposition components by dragging
- ✅ **Component Library**: Pre-built component templates (Services, Databases, APIs, etc.)
- ✅ **Detail Panel**: View and edit component properties
- ✅ **Visual Hierarchy**: Focused components are highlighted, unrelated ones are dimmed
- ✅ **Export Functionality**: Export diagrams as JSON

### Component Types Supported
- Service
- Database (with cylinder visualization)
- API
- Gateway
- Cache
- Queue
- Storage
- User (with circle visualization)
- External (with hexagon visualization)
- Generic

### Connection Types
- Data Flow
- API Call
- Dependency
- Inheritance
- Composition
- Generic

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Docker (optional, for containerized deployment)

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```
   
   The app will open at `http://localhost:3000`

3. **Build for production**:
   ```bash
   npm run build
   ```

### Docker Deployment

1. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
   
   The app will be available at `http://localhost:3000`

2. **For development with hot reload**:
   ```bash
   docker-compose --profile dev up
   ```
   
   Development server will run at `http://localhost:3001`

## How to Use

### Creating Diagrams
1. **Add Components**: Click on component types in the left panel to add them to the center of the canvas
2. **Position Components**: Drag components to arrange them as needed
3. **Focus on Components**: Click any component to see its relationships highlighted
4. **Edit Properties**: Select a component and use the right panel to edit its properties
5. **Clear Focus**: Click the "Clear Focus" button or click on empty canvas area

### Keyboard Shortcuts
- **Escape**: Clear current focus
- **Ctrl/Cmd + E**: Export diagram

### Component Interaction
- **Single Click**: Focus on component and show relationships
- **Drag**: Move component to new position
- **Right Panel**: Edit component details when selected

## Architecture

### Frontend Stack
- **React 18** with TypeScript for component-based UI
- **D3.js** for SVG manipulation and interactive graphics
- **CSS3** for styling and animations
- **Create React App** for build tooling

### Project Structure
```
src/
├── components/           # React components
│   ├── DiagramCanvas.tsx    # Main SVG canvas
│   ├── ComponentRenderer.tsx # Individual component rendering
│   ├── ConnectionRenderer.tsx # Connection line rendering
│   ├── ComponentLibrary.tsx  # Component palette
│   ├── DetailPanel.tsx      # Properties panel
│   └── Toolbar.tsx          # Top toolbar
├── types/
│   └── diagram.ts           # TypeScript type definitions
├── App.tsx                  # Main application component
├── index.tsx               # Application entry point
└── index.css               # Global styles
```

### Data Model
- **Diagram**: Contains components and connections
- **Component**: Has position, size, type, title, description, and metadata
- **Connection**: Links two components with optional labels and types
- **Focus State**: Manages which components are highlighted/dimmed

## Development Roadmap

### Phase 2 - Enhanced Details (Planned)
- Component metadata and custom properties
- Connection labeling and information
- Improved visual styling and themes
- Shareable links for diagrams

### Phase 3 - Polish & Share (Planned)
- High-quality PNG/SVG export
- Embed functionality for documentation
- Responsive design for tablets
- Performance optimization for large diagrams

### Future Features
- Real-time collaboration
- Scenario/mode switching
- Advanced component library
- Integration with documentation tools
- Mobile app support
- AI-assisted diagram generation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Technical Notes

### Performance Considerations
- SVG-based rendering for crisp scaling
- Component limit of ~50 for optimal performance
- Optimized re-rendering with React hooks

### Browser Support
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

### Known Limitations
- No backend persistence (local state only)
- Limited to predefined component types
- No real-time collaboration yet
- Export limited to JSON format

## Support

For questions, issues, or feature requests, please open an issue on GitHub. 