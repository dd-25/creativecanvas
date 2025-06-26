// Application constants and configuration values

module.exports = {
  // Canvas constraints
  CANVAS: {
    MIN_WIDTH: 100,
    MAX_WIDTH: 4000,
    MIN_HEIGHT: 100,
    MAX_HEIGHT: 4000,
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    DEFAULT_BACKGROUND_COLOR: '#ffffff'
  },

  // File upload limits
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },

  // Element validation
  ELEMENTS: {
    VALID_TYPES: ['rectangle', 'circle', 'text', 'image', 'drawing'],
    DEFAULT_FONT_SIZE: 16,
    DEFAULT_FONT_FAMILY: 'Arial',
    DEFAULT_COLOR: '#000000',
    DEFAULT_FONT_WEIGHT: 'normal',
    MIN_FONT_SIZE: 8,
    MAX_FONT_SIZE: 200,
    DEFAULT_BRUSH_SIZE: 3
  },

  // Session management
  SESSION: {
    DEFAULT_TIMEOUT: 3600000, // 1 hour in milliseconds
    MAX_ELEMENTS_PER_CANVAS: 1000
  },

  // API responses
  RESPONSES: {
    SUCCESS: 'success',
    ERROR: 'error',
    MESSAGES: {
      CANVAS_CREATED: 'Canvas created successfully',
      ELEMENT_ADDED: 'Element added successfully',
      ELEMENT_UPDATED: 'Element updated successfully',
      ELEMENT_DELETED: 'Element deleted successfully',
      CANVAS_CLEARED: 'Canvas cleared successfully',
      EXPORT_SUCCESS: 'Export completed successfully'
    }
  },

  // Error messages
  ERRORS: {
    CANVAS_NOT_FOUND: 'Canvas session not found',
    ELEMENT_NOT_FOUND: 'Element not found',
    INVALID_DIMENSIONS: 'Invalid canvas dimensions',
    INVALID_ELEMENT_TYPE: 'Invalid element type',
    INVALID_COORDINATES: 'Invalid coordinates',
    FILE_TOO_LARGE: 'File too large. Maximum size is 10MB.',
    INVALID_FILE_TYPE: 'Only image files are allowed',
    EXPORT_FAILED: 'Export failed',
    INTERNAL_ERROR: 'Internal server error'
  }
};
