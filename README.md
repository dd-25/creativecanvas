# 🎨 Canvas Builder - Professional Design Tool

A modern, full-stack web application for creating interactive canvases with professional design tools. Build stunning visuals with drawing tools, shapes, text, images, and export them as high-quality PDFs or PNGs.

## 🚀 Live Demo

- **Frontend**: [http://localhost:3000](http://localhost:3000) (Development)
- **Backend API**: [http://localhost:5000](http://localhost:5000) (Development)

## ✨ Key Features

### 🎯 Core Design Tools
- **Free Drawing**: Smooth brush tool with adjustable size and colors
- **Eraser Tool**: Layer-by-layer erasing with custom cursor
- **Shape Tools**: Rectangles and circles with customizable fill/stroke
- **Text Elements**: Rich text with fonts, sizes, and colors
- **Image Support**: Upload images or use URLs with validation
- **Interactive Canvas**: Zoom, pan, and responsive design

### 🌟 Advanced Features
- **Pixel-Perfect Export**: PNG and PDF exports with identical quality
- **Real-time Preview**: Instant visual feedback for all operations
- **Element Management**: Select, delete, and layer management
- **Canvas Scaling**: Smart fit-to-screen with zoom controls
- **Error Handling**: Comprehensive validation and user feedback
- **Professional UI**: Modern interface with tool panels and properties

### 🛡️ Production Ready
- **Modular Backend**: Clean separation of controllers, services, and routes
- **Error Recovery**: Robust error handling throughout the application
- **File Security**: Secure image upload with validation
- **Performance**: Optimized rendering and efficient state management
- **Documentation**: Complete API documentation and setup guides

## 🏗️ Project Structure

```
copilot/
├── backend/                    # Node.js/Express API Server
│   ├── config/                 # Configuration files
│   │   ├── constants.js       # Application constants
│   │   └── multer.js          # File upload configuration
│   ├── controllers/           # Request handlers & business logic
│   │   ├── canvasController.js # Canvas operations & export
│   │   └── elementsController.js # Element CRUD operations
│   ├── middleware/            # Express middleware
│   │   └── errorHandler.js   # Centralized error handling
│   ├── routes/                # API route definitions
│   │   ├── canvasRoutes.js   # Canvas endpoints
│   │   └── elementsRoutes.js # Element endpoints
│   ├── services/              # Core business services
│   │   ├── canvasService.js  # Canvas rendering & image generation
│   │   └── pdfService.js     # PDF export with pixel-perfect quality
│   ├── utils/                 # Utility functions
│   │   └── validation.js     # Input validation helpers
│   ├── server.js             # Main server entry point
│   └── package.json          # Backend dependencies
└── frontend/                  # React SPA Application
    ├── src/
    │   ├── components/        # React UI components
    │   │   ├── Canvas.jsx    # Main canvas with drawing tools
    │   │   ├── Sidebar.jsx   # Tool panel & properties
    │   │   ├── Header.jsx    # App header & navigation
    │   │   └── ...           # Other components
    │   ├── services/         # API integration layer
    │   │   └── api.js        # HTTP client & API calls
    │   ├── App.jsx           # Main application component
    │   └── main.jsx          # Application entry point
    ├── public/               # Static assets
    └── package.json          # Frontend dependencies
```

## 🛠️ Technology Stack

### Frontend Technologies
- **React 18** - Modern UI with hooks and functional components
- **Vite** - Lightning-fast build tool and development server
- **HTML5 Canvas** - Native drawing and rendering capabilities
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Axios** - Promise-based HTTP client for API communication
- **React Hot Toast** - Elegant notification system

### Backend Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, minimalist web framework
- **Canvas (node-canvas)** - Server-side canvas rendering
- **PDFKit** - Professional PDF generation library
- **Multer** - Multipart form data handling for file uploads
- **UUID** - Unique identifier generation
- **CORS** - Cross-origin resource sharing middleware

### Development Tools
- **ESLint** - Code linting and style enforcement
- **Vite Config** - Optimized build configuration
- **Git** - Version control and collaboration

## 📋 Prerequisites

- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn**
- **Git** (for cloning)

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Git** (for cloning the repository)

### 1. Clone & Setup
```bash
# Clone the repository
git clone <your-repository-url>
cd canvas-builder/copilot

# Setup both frontend and backend
npm run setup  # Installs dependencies for both parts
```

### 2. Start Development Servers

#### Backend Server
```bash
cd backend
npm run dev     # Starts on http://localhost:5000
```

#### Frontend Application  
```bash
cd frontend
npm run dev     # Starts on http://localhost:3000
```

### 3. Start Creating!
1. Open your browser to `http://localhost:3000`
2. Initialize a new canvas with your preferred dimensions
3. Use the drawing tools to create your design
4. Export as PNG or PDF when finished

## 🎯 How to Use

### Basic Canvas Operations
1. **Initialize Canvas**: Set width, height, and background color
2. **Drawing Tool**: Click and drag to draw freehand with brush
3. **Eraser Tool**: Remove parts of drawings layer by layer
4. **Shapes**: Add rectangles and circles with custom colors
5. **Text**: Click to place text elements with formatting options
6. **Images**: Upload files or use image URLs

### Advanced Features
- **Element Selection**: Click any element to view properties
- **Layer Management**: Elements stack with automatic z-index
- **Export Options**: Choose PNG for images or PDF for documents
- **Canvas Controls**: Zoom and pan for precise editing
- **Responsive Design**: Works on desktop, tablet, and mobile

## 📚 API Reference

### Base URLs
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

### Canvas Management

#### Initialize Canvas
```http
POST /canvas/init
Content-Type: application/json

{
  "width": 800,
  "height": 600,
  "backgroundColor": "#ffffff"
}

Response: {
  "success": true,
  "sessionId": "uuid-v4",
  "canvas": { canvas_data }
}
```

#### Get Canvas Data
```http
GET /canvas/:sessionId

Response: {
  "success": true,
  "canvas": {
    "id": "session-id",
    "width": 800,
    "height": 600,
    "backgroundColor": "#ffffff",
    "elements": [...]
  }
}
```

#### Clear Canvas
```http
DELETE /canvas/:sessionId/clear

Response: {
  "success": true,
  "message": "Canvas cleared successfully"
}
```

### Element Operations

#### Add Rectangle
```http
POST /canvas/:sessionId/rectangle

{
  "x": 50,
  "y": 50,
  "width": 100,
  "height": 60,
  "fillColor": "#3b82f6",
  "strokeColor": "#1e40af",
  "strokeWidth": 2
}
```

#### Add Circle
```http
POST /canvas/:sessionId/circle

{
  "x": 100,
  "y": 100,
  "radius": 40,
  "fillColor": "#10b981",
  "strokeColor": "#047857",
  "strokeWidth": 2
}
```

#### Add Text
```http
POST /canvas/:sessionId/text

{
  "x": 50,
  "y": 50,
  "text": "Hello World",
  "fontSize": 24,
  "fontFamily": "Arial",
  "color": "#374151",
  "bold": false,
  "italic": false
}
```

#### Add Drawing Path
```http
POST /canvas/:sessionId/path

{
  "points": [
    {"x": 10, "y": 10},
    {"x": 20, "y": 15},
    {"x": 30, "y": 25}
  ],
  "strokeWidth": 3,
  "color": "#000000",
  "tool": "draw"
}
```

#### Upload Image
```http
POST /canvas/:sessionId/image-upload
Content-Type: multipart/form-data

FormData:
- image: [file]
- x: 50
- y: 50
- width: 150
- height: 100
```

#### Add Image from URL
```http
POST /canvas/:sessionId/image-url

{
  "x": 50,
  "y": 50,
  "width": 150,
  "height": 100,
  "imageUrl": "https://example.com/image.jpg"
}
```

#### Delete Element
```http
DELETE /canvas/:sessionId/element/:elementId

Response: {
  "success": true,
  "message": "Element deleted successfully"
}
```

### Export Operations

#### Export as PNG
```http
GET /canvas/:sessionId/export/png

Response: PNG image file
Headers:
- Content-Type: image/png
- Content-Disposition: attachment; filename="canvas-{sessionId}.png"
```

#### Export as PDF
```http
GET /canvas/:sessionId/export/pdf?compress=true

Response: PDF file
Headers:
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="canvas-{sessionId}.pdf"
```

#### Export with POST Data
```http
POST /canvas/export/png
POST /canvas/export/pdf

{
  "width": 800,
  "height": 600,
  "backgroundColor": "#ffffff",
  "elements": [...]
}
```

### Error Responses
```json
{
  "error": "Error message description",
  "details": "Additional error context"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## 🔧 Development & Deployment

### Development Setup

#### Environment Variables

**Frontend (`.env`)**
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Canvas Builder
VITE_APP_VERSION=1.0.0
```

**Backend (`.env`)**
```env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=10485760
SESSION_TIMEOUT=3600000
```

#### Available Scripts

**Frontend Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend Scripts**
```bash
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server
npm run setup        # Install dependencies for both parts
```

### Production Deployment

#### Frontend (Vercel/Netlify)
1. **Build Settings**:
   ```
   Build Command: npm run build
   Output Directory: dist
   Node Version: 18.x
   ```

2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-api-domain.com
   ```

#### Backend (Render/Railway/Heroku)
1. **Build Settings**:
   ```
   Build Command: npm install
   Start Command: npm start
   Node Version: 18.x
   ```

2. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

## 🧪 Testing & Quality Assurance

### Manual Testing Checklist
- [ ] Canvas initialization with various dimensions
- [ ] Drawing tool with different brush sizes and colors
- [ ] Eraser tool functionality and cursor alignment
- [ ] Shape tools (rectangle, circle) with custom styling
- [ ] Text elements with different fonts and sizes
- [ ] Image upload from local files
- [ ] Image loading from external URLs
- [ ] Element selection and deletion
- [ ] Canvas export as PNG
- [ ] Canvas export as PDF
- [ ] Mobile responsiveness
- [ ] Error handling for invalid inputs
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)

### API Testing
```bash
# Test canvas initialization
curl -X POST http://localhost:5000/api/canvas/init \
  -H "Content-Type: application/json" \
  -d '{"width":800,"height":600,"backgroundColor":"#ffffff"}'

# Test PNG export
curl -X GET http://localhost:5000/api/canvas/{sessionId}/export/png \
  --output test-export.png

# Test PDF export  
curl -X GET http://localhost:5000/api/canvas/{sessionId}/export/pdf \
  --output test-export.pdf
```
   ```

### Backend (Render)
1. **Create Web Service**: Connect your repository
2. **Configure Build**:
   ```bash
   Build Command: npm install
   Start Command: npm start
   ```
3. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=5000
   ```

### Alternative Deployment Options
- **Netlify** (Frontend)
- **Heroku** (Backend)
- **Railway** (Backend)
- **DigitalOcean App Platform** (Full-stack)

## ✅ Current Project Status

### 🎯 **Fully Implemented & Working**
- **✅ Interactive Canvas**: Full drawing and design capabilities
- **✅ Drawing Tools**: Brush tool with adjustable size and colors
- **✅ Eraser Tool**: Layer-by-layer erasing with perfect cursor alignment
- **✅ Shape Tools**: Rectangles and circles with custom styling
- **✅ Text Elements**: Rich text with fonts, sizes, and colors
- **✅ Image Support**: File upload and URL-based image loading
- **✅ Export System**: Pixel-perfect PNG and PDF export
- **✅ Element Management**: Selection, deletion, and layer management
- **✅ Responsive Design**: Works on desktop, tablet, and mobile
- **✅ Error Handling**: Comprehensive validation and user feedback

### 🔧 **Recent Fixes & Optimizations**
- **Fixed PDF Export**: Resolved "CanvasService is not a constructor" error
- **Fixed Eraser Cursor**: Perfect mouse position alignment and real-time tracking
- **Improved Export Quality**: PNG and PDF now produce identical pixel-perfect output
- **Enhanced API Structure**: Modular backend with clean separation of concerns
- **Optimized Performance**: Efficient canvas rendering and state management
- **Better Error Recovery**: Robust error handling throughout the application

### 🏗️ **Technical Architecture**
- **Backend**: Modular Node.js/Express with controllers, services, and routes
- **Frontend**: Modern React with hooks and functional components
- **Canvas Rendering**: HTML5 Canvas with server-side node-canvas for exports
- **File Handling**: Secure image upload with validation and processing
- **API Design**: RESTful endpoints with comprehensive error handling

### 🧪 **Tested & Verified**
- Canvas initialization with various dimensions ✅
- Drawing and erasing with perfect cursor alignment ✅  
- Shape and text element creation ✅
- Image upload and URL loading ✅
- PNG export with high quality ✅
- PDF export with compression ✅
- Mobile responsiveness ✅
- Error handling for edge cases ✅

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Contribution Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation for API changes
- Ensure responsive design for UI changes

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **HTML5 Canvas API** - Native drawing and rendering capabilities
- **PDFKit** - Professional PDF generation library
- **React Team** - Amazing UI library and ecosystem
- **Express.js** - Fast, minimalist web framework
- **Node Canvas** - Server-side canvas rendering
- **Open Source Community** - Incredible tools and libraries

## 📞 Support & Contact

- **Documentation**: This README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions and feature requests
- **Email**: Contact the development team

---

**🎨 Built with passion for the creative community**

*⭐ Star this repository if you found it helpful!*

**Current Version**: 1.0.0 - Production Ready  
**Last Updated**: June 2025  
**Status**: ✅ All core features implemented and tested

## 🔮 Future Development Roadmap

### 🤝 Real-Time Collaboration
- [ ] **Multi-user Editing**: Real-time collaborative canvas editing using Socket.IO
- [ ] **Live Cursors**: See other users' cursors and selections in real-time
- [ ] **User Presence**: Display active users with avatars and status
- [ ] **Conflict Resolution**: Intelligent handling of simultaneous edits
- [ ] **Chat Integration**: Built-in chat for collaborators
- [ ] **Permission System**: Role-based access (owner, editor, viewer)
- [ ] **Room Management**: Create and manage collaborative sessions
- [ ] **Activity Feed**: Real-time updates of all user actions

### 🎨 Custom Templates & Presets
- [ ] **Template Library**: Pre-designed templates for various use cases
  - Business cards, flyers, posters, social media posts
  - Presentations, infographics, certificates
  - Wedding invitations, birthday cards, logos
- [ ] **Template Marketplace**: Community-driven template sharing
- [ ] **Smart Templates**: AI-powered template suggestions
- [ ] **Template Categories**: Organized by industry, occasion, style
- [ ] **Custom Template Creation**: Save user designs as reusable templates
- [ ] **Template Versioning**: Track and manage template updates
- [ ] **Responsive Templates**: Templates that adapt to different canvas sizes

### 🎯 Advanced Design Features
- [ ] **Vector Graphics**: SVG import/export and manipulation
- [ ] **Advanced Shapes**: Bezier curves, polygons, stars, arrows
- [ ] **Path Editor**: Node-level editing for complex shapes
- [ ] **Gradients**: Linear and radial gradient support
- [ ] **Shadows & Effects**: Drop shadows, glow, blur effects
- [ ] **Pattern Fills**: Texture and pattern support for fills
- [ ] **Typography**: Advanced text formatting, fonts, text effects
- [ ] **Image Filters**: Brightness, contrast, saturation, blur filters

### 🔄 Animation & Interactive Elements
- [ ] **Animation Timeline**: Keyframe-based animation system
- [ ] **Transitions**: Smooth element transitions and morphing
- [ ] **Interactive Elements**: Clickable buttons, hover effects
- [ ] **GIF Export**: Animated GIF export functionality
- [ ] **Video Export**: Export animations as MP4/WebM videos
- [ ] **Presentation Mode**: Slideshow functionality with transitions
- [ ] **Motion Presets**: Pre-built animation templates

### ☁️ Cloud & Storage Integration
- [ ] **Cloud Storage**: Save designs to AWS S3, Google Drive, Dropbox
- [ ] **Auto-save**: Automatic cloud backup every few seconds
- [ ] **Version History**: Full design history with restore points
- [ ] **Cross-device Sync**: Access designs from any device
- [ ] **Offline Mode**: Continue working without internet connection
- [ ] **Design Library**: Personal library of saved elements and assets
- [ ] **Team Workspaces**: Shared workspaces for organizations

### 🔌 API & Integration Enhancements
- [ ] **Stock Photo APIs**: Unsplash, Pexels, Shutterstock integration
- [ ] **Font APIs**: Google Fonts, Adobe Fonts integration
- [ ] **Social Media APIs**: Direct publishing to social platforms
- [ ] **Print APIs**: Integration with print-on-demand services
- [ ] **Webhook Support**: Real-time notifications for external systems
- [ ] **GraphQL API**: More efficient data fetching
- [ ] **SDK Development**: JavaScript SDK for third-party integrations

### 🎮 User Experience & Interface
- [ ] **Dark Mode**: Complete dark theme support
- [ ] **Accessibility**: Full WCAG 2.1 compliance
- [ ] **Keyboard Navigation**: Complete keyboard-only operation
- [ ] **Voice Commands**: Voice-controlled design operations
- [ ] **Gesture Support**: Touch gestures for tablets and touch screens
- [ ] **Customizable UI**: User-configurable interface layouts
- [ ] **Progressive Web App**: Full PWA capabilities with offline support

### 📊 Analytics & Business Features
- [ ] **Usage Analytics**: Detailed usage statistics and insights
- [ ] **A/B Testing**: Built-in A/B testing for designs
- [ ] **Performance Metrics**: Canvas performance monitoring
- [ ] **User Behavior Tracking**: Heat maps and interaction analytics
- [ ] **Subscription Management**: Tiered pricing and feature access
- [ ] **White-label Solution**: Customizable branding for enterprises
- [ ] **API Rate Limiting**: Advanced rate limiting and quotas

### 🤖 AI & Machine Learning
- [ ] **AI Design Assistant**: Intelligent design suggestions
- [ ] **Auto-layout**: AI-powered automatic element arrangement
- [ ] **Color Palette Generation**: AI-generated color schemes
- [ ] **Content Generation**: AI-powered text and image suggestions
- [ ] **Design Optimization**: AI recommendations for better designs
- [ ] **Smart Cropping**: Intelligent image cropping and resizing
- [ ] **Style Transfer**: Apply artistic styles to designs

### 📱 Mobile & Cross-Platform
- [ ] **Native Mobile Apps**: iOS and Android applications
- [ ] **Tablet Optimization**: Enhanced experience for tablets
- [ ] **Apple Pencil Support**: Advanced stylus input for iPad
- [ ] **Desktop Applications**: Electron-based desktop apps
- [ ] **Chrome Extension**: Quick canvas creation from browser
- [ ] **Figma Plugin**: Export/import designs from Figma

### 🔐 Security & Enterprise Features
- [ ] **Single Sign-On (SSO)**: SAML, OAuth 2.0 integration
- [ ] **Two-Factor Authentication**: Enhanced account security
- [ ] **Audit Logs**: Comprehensive activity logging
- [ ] **Data Encryption**: End-to-end encryption for designs
- [ ] **Compliance**: GDPR, CCPA, SOC 2 compliance
- [ ] **Private Cloud**: On-premises deployment options
- [ ] **Custom Domains**: White-label domain support

### 🎓 Educational & Learning
- [ ] **Tutorial System**: Interactive design tutorials
- [ ] **Design Guidelines**: Built-in design principle guides
- [ ] **Video Tutorials**: Integrated video learning content
- [ ] **Community Forums**: User community and support
- [ ] **Design Challenges**: Weekly design contests and challenges
- [ ] **Certification Program**: Design skills certification
- [ ] **Educational Discounts**: Special pricing for schools and students

---

**Built with ❤️ for the developer community**

*Star ⭐ this repo if you found it helpful!*
