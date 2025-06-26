const { CANVAS, ELEMENTS } = require('../config/constants');

/**
 * Validates canvas dimensions
 */
const validateCanvasDimensions = (width, height) => {
  const parsedWidth = parseInt(width);
  const parsedHeight = parseInt(height);
  
  if (isNaN(parsedWidth) || isNaN(parsedHeight)) {
    return { valid: false, error: 'Dimensions must be numbers' };
  }
  
  if (parsedWidth < CANVAS.MIN_WIDTH || parsedWidth > CANVAS.MAX_WIDTH ||
      parsedHeight < CANVAS.MIN_HEIGHT || parsedHeight > CANVAS.MAX_HEIGHT) {
    return { 
      valid: false, 
      error: `Canvas dimensions must be between ${CANVAS.MIN_WIDTH} and ${CANVAS.MAX_WIDTH} pixels` 
    };
  }
  
  return { valid: true, width: parsedWidth, height: parsedHeight };
};

/**
 * Validates element coordinates
 */
const validateCoordinates = (x, y) => {
  const parsedX = parseFloat(x);
  const parsedY = parseFloat(y);
  
  if (isNaN(parsedX) || isNaN(parsedY) || parsedX < 0 || parsedY < 0) {
    return { valid: false, error: 'Invalid coordinates' };
  }
  
  return { valid: true, x: parsedX, y: parsedY };
};

/**
 * Validates element type
 */
const validateElementType = (type) => {
  if (!ELEMENTS.VALID_TYPES.includes(type)) {
    return { valid: false, error: 'Invalid element type' };
  }
  return { valid: true };
};

/**
 * Sanitizes and validates text input
 */
const validateText = (text, fontSize) => {
  const sanitizedText = String(text || '').trim();
  const parsedFontSize = parseInt(fontSize) || ELEMENTS.DEFAULT_FONT_SIZE;
  
  if (!sanitizedText) {
    return { valid: false, error: 'Text content is required' };
  }
  
  if (parsedFontSize < ELEMENTS.MIN_FONT_SIZE || parsedFontSize > ELEMENTS.MAX_FONT_SIZE) {
    return { 
      valid: false, 
      error: `Font size must be between ${ELEMENTS.MIN_FONT_SIZE} and ${ELEMENTS.MAX_FONT_SIZE}` 
    };
  }
  
  return { valid: true, text: sanitizedText, fontSize: parsedFontSize };
};

/**
 * Validates rectangle dimensions
 */
const validateRectangle = (x, y, width, height, strokeWidth = 0) => {
  const coordsResult = validateCoordinates(x, y);
  if (!coordsResult.valid) return coordsResult;
  
  const parsedWidth = parseFloat(width);
  const parsedHeight = parseFloat(height);
  const parsedStrokeWidth = parseFloat(strokeWidth) || 0;
  
  if (isNaN(parsedWidth) || isNaN(parsedHeight) || parsedWidth <= 0 || parsedHeight <= 0) {
    return { valid: false, error: 'Invalid rectangle dimensions' };
  }
  
  return { 
    valid: true, 
    x: coordsResult.x, 
    y: coordsResult.y, 
    width: parsedWidth, 
    height: parsedHeight,
    strokeWidth: parsedStrokeWidth
  };
};

/**
 * Validates circle dimensions
 */
const validateCircle = (x, y, radius, strokeWidth = 0) => {
  const coordsResult = validateCoordinates(x, y);
  if (!coordsResult.valid) return coordsResult;
  
  const parsedRadius = parseFloat(radius);
  const parsedStrokeWidth = parseFloat(strokeWidth) || 0;
  
  if (isNaN(parsedRadius) || parsedRadius <= 0) {
    return { valid: false, error: 'Invalid circle radius' };
  }
  
  return { 
    valid: true, 
    x: coordsResult.x, 
    y: coordsResult.y, 
    radius: parsedRadius,
    strokeWidth: parsedStrokeWidth
  };
};

/**
 * Creates standardized API response
 */
const createResponse = (success, data = null, message = null, error = null) => {
  const response = { success };
  
  if (data) response.data = data;
  if (message) response.message = message;
  if (error) response.error = error;
  
  return response;
};

/**
 * Creates standardized error response
 */
const createErrorResponse = (error, details = null) => {
  const response = { success: false, error };
  if (details) response.details = details;
  return response;
};

module.exports = {
  validateCanvasDimensions,
  validateCoordinates,
  validateElementType,
  validateText,
  validateRectangle,
  validateCircle,
  createResponse,
  createErrorResponse
};
