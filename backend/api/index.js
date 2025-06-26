/**
 * Vercel-optimized server entry point
 * Handles serverless function constraints and native dependencies gracefully
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Import routes with error handling
let canvasRoutes, elementsRoutes;

try {
  canvasRoutes = require('./routes/canvasRoutes');
  elementsRoutes = require('./routes/elementsRoutes');
} catch (error) {
  console.warn('Route import warning:', error.message);
  // Create fallback routes
  canvasRoutes = express.Router();
  elementsRoutes = express.Router();
  
  canvasRoutes.all('*', (req, res) => {
    res.status(503).json({ 
      error: 'Canvas service temporarily unavailable',
      message: 'Native dependencies not available in this environment'
    });
  });
  
  elementsRoutes.all('*', (req, res) => {
    res.status(200).json({ 
      message: 'Elements service available',
      endpoints: ['/api/elements/list', '/api/elements/validate']
    });
  });
}

// Import middleware with fallbacks
let errorHandler, notFoundHandler;

try {
  const middleware = require('./middleware/errorHandler');
  errorHandler = middleware.errorHandler;
  notFoundHandler = middleware.notFoundHandler;
} catch (error) {
  console.warn('Middleware import warning:', error.message);
  
  // Fallback error handlers
  errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  };
  
  notFoundHandler = (req, res) => {
    res.status(404).json({ 
      error: 'Not found',
      path: req.path,
      message: 'The requested resource was not found'
    });
  };
}

const app = express();

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false
}));

app.use(compression());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          process.env.CORS_ORIGIN,
          'https://your-frontend-deployment.vercel.app',
          /\.vercel\.app$/,
          /localhost/
        ].filter(Boolean)
      : [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:5173'
        ];
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

app.use(cors(corsOptions));

// Body parsing with limits
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    dependencies: {}
  };
  
  // Check native dependencies
  try {
    require('canvas');
    health.dependencies.canvas = 'available';
  } catch (e) {
    health.dependencies.canvas = 'unavailable';
  }
  
  try {
    require('sharp');
    health.dependencies.sharp = 'available';
  } catch (e) {
    health.dependencies.sharp = 'unavailable';
  }
  
  res.json(health);
});

// API routes
app.use('/api/canvas', canvasRoutes);
app.use('/api/elements', elementsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Canvas Builder API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      canvas: '/api/canvas',
      elements: '/api/elements'
    },
    documentation: 'https://github.com/your-repo/canvas-builder'
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// For Vercel, export the app
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}
