const { v4: uuidv4 } = require('uuid');
const { canvasSessions } = require('./canvasController');

// Add rectangle to canvas
const addRectangle = (req, res) => {
  try {
    const { sessionId } = req.params;
    const { x, y, width, height, fillColor = '#000000', strokeColor, strokeWidth = 0 } = req.body;

    const canvasData = canvasSessions.get(sessionId);
    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas session not found' });
    }

    // Validate and parse rectangle data
    const parsedX = parseFloat(x);
    const parsedY = parseFloat(y);
    const parsedWidth = parseFloat(width);
    const parsedHeight = parseFloat(height);
    const parsedStrokeWidth = parseFloat(strokeWidth);

    if (isNaN(parsedX) || isNaN(parsedY) || isNaN(parsedWidth) || isNaN(parsedHeight) ||
        parsedX < 0 || parsedY < 0 || parsedWidth <= 0 || parsedHeight <= 0) {
      return res.status(400).json({ error: 'Invalid rectangle dimensions' });
    }

    const element = {
      id: uuidv4(),
      type: 'rectangle',
      x: parsedX,
      y: parsedY,
      width: parsedWidth,
      height: parsedHeight,
      fillColor,
      strokeColor,
      strokeWidth: isNaN(parsedStrokeWidth) ? 0 : parsedStrokeWidth,
      zIndex: canvasData.elements.length,
      createdAt: new Date().toISOString()
    };

    canvasData.elements.push(element);
    canvasData.lastModified = new Date().toISOString();

    res.json({
      success: true,
      element,
      totalElements: canvasData.elements.length
    });
  } catch (error) {
    console.error('Error adding rectangle:', error);
    res.status(500).json({ error: 'Failed to add rectangle' });
  }
};

// Add circle to canvas
const addCircle = (req, res) => {
  try {
    const { sessionId } = req.params;
    const { x, y, radius, fillColor = '#000000', strokeColor, strokeWidth = 0 } = req.body;

    const canvasData = canvasSessions.get(sessionId);
    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas session not found' });
    }

    // Validate and parse circle data
    const parsedX = parseFloat(x);
    const parsedY = parseFloat(y);
    const parsedRadius = parseFloat(radius);
    const parsedStrokeWidth = parseFloat(strokeWidth);

    if (isNaN(parsedX) || isNaN(parsedY) || isNaN(parsedRadius) ||
        parsedX < 0 || parsedY < 0 || parsedRadius <= 0) {
      return res.status(400).json({ error: 'Invalid circle dimensions' });
    }

    const element = {
      id: uuidv4(),
      type: 'circle',
      x: parsedX,
      y: parsedY,
      radius: parsedRadius,
      fillColor,
      strokeColor,
      strokeWidth: isNaN(parsedStrokeWidth) ? 0 : parsedStrokeWidth,
      zIndex: canvasData.elements.length,
      createdAt: new Date().toISOString()
    };

    canvasData.elements.push(element);
    canvasData.lastModified = new Date().toISOString();

    res.json({
      success: true,
      element,
      totalElements: canvasData.elements.length
    });
  } catch (error) {
    console.error('Error adding circle:', error);
    res.status(500).json({ error: 'Failed to add circle' });
  }
};

// Add text to canvas
const addText = (req, res) => {
  try {
    const { sessionId } = req.params;
    const { x, y, text, fontSize = 16, fontFamily = 'Arial', color = '#000000', fontWeight = 'normal' } = req.body;

    const canvasData = canvasSessions.get(sessionId);
    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas session not found' });
    }

    // Validate and parse text data
    const parsedX = parseFloat(x);
    const parsedY = parseFloat(y);
    const parsedFontSize = parseInt(fontSize);

    if (isNaN(parsedX) || isNaN(parsedY) || parsedX < 0 || parsedY < 0 || 
        !text || text.toString().trim().length === 0 || isNaN(parsedFontSize) || parsedFontSize <= 0) {
      return res.status(400).json({ error: 'Invalid text data' });
    }

    const element = {
      id: uuidv4(),
      type: 'text',
      x: parsedX,
      y: parsedY,
      text: text.toString().trim(),
      fontSize: parsedFontSize,
      fontFamily,
      color,
      fontWeight,
      zIndex: canvasData.elements.length,
      createdAt: new Date().toISOString()
    };

    canvasData.elements.push(element);
    canvasData.lastModified = new Date().toISOString();

    res.json({
      success: true,
      element,
      totalElements: canvasData.elements.length
    });
  } catch (error) {
    console.error('Error adding text:', error);
    res.status(500).json({ error: 'Failed to add text' });
  }
};

// Add image via URL
const addImageUrl = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { x, y, width, height, imageUrl } = req.body;

    const canvasData = canvasSessions.get(sessionId);
    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas session not found' });
    }

    // Validate image data
    if (x < 0 || y < 0 || width <= 0 || height <= 0 || !imageUrl) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    const element = {
      id: uuidv4(),
      type: 'image',
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width),
      height: parseInt(height),
      imageUrl,
      zIndex: canvasData.elements.length,
      createdAt: new Date().toISOString()
    };

    canvasData.elements.push(element);
    canvasData.lastModified = new Date().toISOString();

    res.json({
      success: true,
      element,
      totalElements: canvasData.elements.length
    });
  } catch (error) {
    console.error('Error adding image:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
};

// Add image via file upload
const addImageUpload = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { x, y, width, height } = req.body;

    const canvasData = canvasSessions.get(sessionId);
    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas session not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate image data
    if (x < 0 || y < 0 || width <= 0 || height <= 0) {
      return res.status(400).json({ error: 'Invalid image dimensions' });
    }

    // Convert buffer to base64 for storage
    const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const element = {
      id: uuidv4(),
      type: 'image',
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width),
      height: parseInt(height),
      imageData: imageBase64,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      zIndex: canvasData.elements.length,
      createdAt: new Date().toISOString()
    };

    canvasData.elements.push(element);
    canvasData.lastModified = new Date().toISOString();

    res.json({
      success: true,
      element: {
        ...element,
        imageData: '[BASE64_DATA]' // Don't send back the full base64 data
      },
      totalElements: canvasData.elements.length
    });
  } catch (error) {
    console.error('Error adding uploaded image:', error);
    res.status(500).json({ error: 'Failed to add uploaded image' });
  }
};

// Update element on canvas
const updateElement = (req, res) => {
  try {
    const { sessionId, elementId } = req.params;
    const updateData = req.body;

    const canvasData = canvasSessions.get(sessionId);
    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas session not found' });
    }

    const elementIndex = canvasData.elements.findIndex(el => el.id === elementId);
    if (elementIndex === -1) {
      return res.status(404).json({ error: 'Element not found' });
    }

    // Update the element with new data
    canvasData.elements[elementIndex] = {
      ...canvasData.elements[elementIndex],
      ...updateData,
      id: elementId, // Preserve the original ID
      lastModified: new Date().toISOString()
    };
    
    canvasData.lastModified = new Date().toISOString();

    res.json({
      success: true,
      message: 'Element updated successfully',
      element: canvasData.elements[elementIndex],
      totalElements: canvasData.elements.length
    });
  } catch (error) {
    console.error('Error updating element:', error);
    res.status(500).json({ error: 'Failed to update element' });
  }
};

// Delete element from canvas
const deleteElement = (req, res) => {
  try {
    const { sessionId, elementId } = req.params;

    const canvasData = canvasSessions.get(sessionId);
    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas session not found' });
    }

    const elementIndex = canvasData.elements.findIndex(el => el.id === elementId);
    if (elementIndex === -1) {
      return res.status(404).json({ error: 'Element not found' });
    }

    canvasData.elements.splice(elementIndex, 1);
    canvasData.lastModified = new Date().toISOString();

    res.json({
      success: true,
      message: 'Element deleted successfully',
      totalElements: canvasData.elements.length
    });
  } catch (error) {
    console.error('Error deleting element:', error);
    res.status(500).json({ error: 'Failed to delete element' });
  }
};

// Generic add element endpoint
const addElement = (req, res) => {
  try {
    const { sessionId } = req.params;
    const { type, ...elementData } = req.body;

    const canvasData = canvasSessions.get(sessionId);
    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas session not found' });
    }

    // Validate element type
    const validTypes = ['rectangle', 'circle', 'text', 'image', 'drawing'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid element type' });
    }

    // Validate and sanitize common properties
    const element = {
      id: uuidv4(),
      type,
      x: parseFloat(elementData.x) || 0,
      y: parseFloat(elementData.y) || 0,
      zIndex: elementData.zIndex !== undefined ? parseInt(elementData.zIndex) : canvasData.elements.length,
      createdAt: new Date().toISOString()
    };

    // Validate coordinates
    if (isNaN(element.x) || isNaN(element.y)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Type-specific validation and properties
    switch (type) {
      case 'rectangle':
        element.width = parseFloat(elementData.width);
        element.height = parseFloat(elementData.height);
        if (isNaN(element.width) || isNaN(element.height) || element.width <= 0 || element.height <= 0) {
          return res.status(400).json({ error: 'Invalid rectangle dimensions' });
        }
        element.fillColor = elementData.fillColor || '#000000';
        element.strokeColor = elementData.strokeColor;
        element.strokeWidth = parseFloat(elementData.strokeWidth) || 0;
        break;

      case 'circle':
        element.radius = parseFloat(elementData.radius);
        if (isNaN(element.radius) || element.radius <= 0) {
          return res.status(400).json({ error: 'Invalid circle radius' });
        }
        element.fillColor = elementData.fillColor || '#000000';
        element.strokeColor = elementData.strokeColor;
        element.strokeWidth = parseFloat(elementData.strokeWidth) || 0;
        break;

      case 'text':
        element.text = String(elementData.text || '').trim();
        if (!element.text) {
          return res.status(400).json({ error: 'Text content is required' });
        }
        element.fontSize = parseInt(elementData.fontSize) || 16;
        element.fontFamily = elementData.fontFamily || 'Arial';
        element.color = elementData.color || '#000000';
        element.fontWeight = elementData.fontWeight || 'normal';
        break;

      case 'image':
        element.width = parseFloat(elementData.width);
        element.height = parseFloat(elementData.height);
        if (isNaN(element.width) || isNaN(element.height) || element.width <= 0 || element.height <= 0) {
          return res.status(400).json({ error: 'Invalid image dimensions' });
        }
        if (elementData.imageUrl) {
          element.imageUrl = elementData.imageUrl;
        } else if (elementData.imageData) {
          element.imageData = elementData.imageData;
        } else {
          return res.status(400).json({ error: 'Image URL or data is required' });
        }
        break;

      case 'drawing':
        element.path = elementData.path || [];
        element.color = elementData.color || '#000000';
        element.brushSize = parseFloat(elementData.brushSize) || 3;
        element.tool = elementData.tool || 'draw';
        if (!Array.isArray(element.path) || element.path.length === 0) {
          return res.status(400).json({ error: 'Invalid drawing path' });
        }
        break;
    }

    canvasData.elements.push(element);
    canvasData.lastModified = new Date().toISOString();

    res.json({
      success: true,
      element,
      totalElements: canvasData.elements.length
    });
  } catch (error) {
    console.error('Error adding element:', error);
    res.status(500).json({ error: 'Failed to add element' });
  }
};

module.exports = {
  addRectangle,
  addCircle,
  addText,
  addImageUrl,
  addImageUpload,
  updateElement,
  deleteElement,
  addElement
};
