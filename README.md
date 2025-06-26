# 🎨 Canvas Builder API with PDF Export

A professional full-stack web application that allows users to create, design, and export beautiful canvases as high-quality PDF files. Built with **React** (frontend) and **Node.js/Express** (backend).

## 🚀 Live Demo

- **Frontend**: [Deployed on Vercel](https://your-frontend-domain.vercel.app)
- **Backend**: [Deployed on Render](https://your-backend-domain.onrender.com)

## ✨ Features

### 🎯 Core Features
- **Interactive Canvas**: Create custom canvases with adjustable dimensions
- **Shape Tools**: Add rectangles, circles with custom colors and strokes
- **Text Elements**: Insert text with customizable fonts, sizes, and colors
- **Image Support**: Upload images or use URLs with automatic validation
- **Real-time Preview**: See changes instantly as you design
- **PDF Export**: Generate high-quality, compressed PDF files
- **PNG Export**: Export designs as PNG images

### 🌟 Advanced Features
- **Undo/Redo System**: Full history management with 50-step memory
- **Keyboard Shortcuts**: Professional shortcuts for productivity
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Element Selection**: Click to select and view element properties
- **Layer Management**: Z-index based layering system
- **Color Picker**: Advanced color selection with hex input
- **File Validation**: Secure image upload with type and size validation
- **Error Handling**: Comprehensive error handling with user-friendly messages

### 🛡️ Security & Performance
- **Input Validation**: Server-side validation for all inputs
- **File Security**: Image upload restrictions and validation
- **URL Validation**: Secure image URL handling with private IP blocking
- **CORS Protection**: Configured for production environments
- **Compression**: PDF compression for optimal file sizes
- **Rate Limiting**: Built-in protection against abuse

## 🏗️ Architecture

```
copilot/
├── backend/                    # Node.js/Express API
│   ├── config/                 # Configuration files
│   │   ├── constants.js       # Application constants
│   │   └── multer.js          # File upload configuration
│   ├── controllers/           # Request handlers
│   │   ├── canvasController.js
│   │   └── elementsController.js
│   ├── middleware/            # Express middleware
│   │   └── errorHandler.js   # Error handling
│   ├── routes/                # API routes
│   │   ├── canvasRoutes.js
│   │   └── elementsRoutes.js
│   ├── services/              # Business logic
│   │   ├── canvasService.js   # Canvas rendering
│   │   └── pdfService.js      # PDF generation
│   ├── utils/                 # Utility functions
│   │   └── validation.js      # Input validation
│   ├── server.js              # Main server file
│   └── package.json           # Backend dependencies
└── frontend/                  # React application
    ├── src/
    │   ├── components/        # React components
    │   ├── services/       # API service layer
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # Entry point
    ├── public/             # Static assets
    └── package.json        # Frontend dependencies
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful notifications
- **React Color** - Advanced color picker
- **React Icons** - Comprehensive icon library
- **CSS3** - Modern styling with custom properties

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Canvas** - Server-side canvas rendering
- **PDFKit** - PDF generation library
- **Multer** - File upload handling
- **Sharp** - Image processing (for optimization)
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn**
- **Git** (for cloning)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/canvas-builder.git
cd canvas-builder/copilot
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Open Your Browser
Navigate to `http://localhost:3000` and start creating!

## 📚 API Documentation

### Base URL
```
Local: http://localhost:5000
Production: https://your-backend-domain.onrender.com
```

### Endpoints

#### Canvas Management
```http
POST /api/canvas/init
# Initialize a new canvas session
Body: { width: 800, height: 600, backgroundColor: "#ffffff" }

GET /api/canvas/:sessionId
# Get canvas data

DELETE /api/canvas/:sessionId/clear
# Clear all elements from canvas
```

#### Adding Elements
```http
POST /api/canvas/:sessionId/rectangle
Body: { x: 50, y: 50, width: 100, height: 60, fillColor: "#3b82f6" }

POST /api/canvas/:sessionId/circle
Body: { x: 100, y: 100, radius: 40, fillColor: "#10b981" }

POST /api/canvas/:sessionId/text
Body: { x: 50, y: 50, text: "Hello", fontSize: 24, color: "#374151" }

POST /api/canvas/:sessionId/image-url
Body: { x: 50, y: 50, width: 150, height: 100, imageUrl: "https://..." }

POST /api/canvas/:sessionId/image-upload
Content-Type: multipart/form-data
Body: FormData with image file and position/size data
```

#### Element Management
```http
DELETE /api/canvas/:sessionId/element/:elementId
# Delete specific element

GET /api/canvas/:sessionId/metadata
# Get canvas metadata and analytics
```

#### Export
```http
GET /api/canvas/:sessionId/export/png
# Export as PNG image

GET /api/canvas/:sessionId/export/pdf?compress=true
# Export as compressed PDF
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Format
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo last action |
| `Ctrl+Y` | Redo last action |
| `Ctrl+S` | Export as PNG |
| `Ctrl+P` | Export as PDF |
| `Delete` | Delete selected element |
| `V` | Select tool |
| `R` | Rectangle tool |
| `C` | Circle tool |
| `T` | Text tool |
| `I` | Image tool |

## 🎨 Usage Examples

### Creating a Simple Design
1. **Initialize Canvas**: Choose dimensions or use presets
2. **Add Shapes**: Use rectangle/circle tools with custom colors
3. **Insert Text**: Add headings and descriptions
4. **Upload Images**: Add logos or graphics
5. **Export**: Generate PDF or PNG file

### Advanced Workflow
1. **Plan Layout**: Use larger canvas for complex designs
2. **Layer Elements**: Utilize z-index for proper layering
3. **Color Coordination**: Use color picker for brand consistency
4. **Responsive Design**: Test on different screen sizes
5. **Export Options**: Choose between compressed PDF or high-res PNG

## 🚀 Deployment

### Frontend (Vercel)
1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Configure Build**: 
   ```bash
   Build Command: npm run build
   Output Directory: dist
   ```
3. **Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend-domain.onrender.com
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

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Canvas Builder
VITE_APP_VERSION=1.0.0
```

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=10485760
SESSION_TIMEOUT=3600000
```

### Customization Options
- **Canvas Limits**: Modify max dimensions in validation
- **File Upload**: Adjust size limits and allowed formats
- **UI Theme**: Customize CSS variables for branding
- **Export Quality**: Configure PDF compression settings

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                    # Run unit tests
npm run test:coverage      # Generate coverage report
npm run test:e2e          # Run end-to-end tests
```

### Frontend Testing
```bash
cd frontend
npm test                   # Run component tests
npm run test:coverage     # Generate coverage report
```

### Manual Testing Checklist
- [ ] Canvas initialization with different dimensions
- [ ] Adding all element types (rectangle, circle, text, image)
- [ ] Element selection and deletion
- [ ] Undo/redo functionality
- [ ] Export functionality (PNG and PDF)
- [ ] Mobile responsiveness
- [ ] Error handling scenarios

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

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- **Canvas API** - HTML5 Canvas for rendering
- **PDFKit** - PDF generation library
- **React Community** - Amazing ecosystem and tools
- **Express.js** - Fast and minimal web framework
- **Vercel & Render** - Excellent deployment platforms

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: your-email@example.com

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
