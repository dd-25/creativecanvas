const { v4: uuidv4 } = require('uuid');
const canvasService = require('../services/canvasService');
const pdfService = require('../services/pdfService');

// In-memory storage for canvas sessions
const canvasSessions = new Map();

// Health check controller
const healthCheck = (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

// Initialize a new canvas session
const initCanvas = (req, res) => {
  try {
    const { width = 800, height = 600, backgroundColor = '#ffffff' } = req.body;
    
    // Validate dimensions
    if (width < 100 || width > 4000 || height < 100 || height > 4000) {
      return res.status(400).json({
        error: 'Canvas dimensions must be between 100 and 4000 pixels'
      });
    }

    const sessionId = uuidv4();
    const canvasData = {
      id: sessionId,
      width: parseInt(width),
      height: parseInt(height),
      backgroundColor,
      elements: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    canvasSessions.set(sessionId, canvasData);

    res.json({
      success: true,
      sessionId,
      canvas: canvasData
    });
  } catch (error) {
    console.error('Error initializing canvas:', error);
    res.status(500).json({ error: 'Failed to initialize canvas' });
  }
};

// Get canvas session data
const getCanvas = (req, res) => {
  try {
    const { sessionId } = req.params;
    const canvasData = canvasSessions.get(sessionId);

    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas session not found' });
    }

    res.json({
      success: true,
      canvas: canvasData
    });
  } catch (error) {
    console.error('Error fetching canvas:', error);
    res.status(500).json({ error: 'Failed to fetch canvas data' });
  }
};

// Clear all elements from canvas
const clearCanvas = (req, res) => {
  try {
    const { sessionId } = req.params;

    const canvasData = canvasSessions.get(sessionId);
    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas session not found' });
    }

    canvasData.elements = [];
    canvasData.lastModified = new Date().toISOString();

    res.json({
      success: true,
      message: 'Canvas cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing canvas:', error);
    res.status(500).json({ error: 'Failed to clear canvas' });
  }
};

// Get canvas metadata
const getCanvasMetadata = (req, res) => {
  try {
    const { sessionId } = req.params;
    const canvasData = canvasSessions.get(sessionId);

    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas session not found' });
    }

    const metadata = {
      sessionId,
      dimensions: {
        width: canvasData.width,
        height: canvasData.height
      },
      backgroundColor: canvasData.backgroundColor,
      totalElements: canvasData.elements.length,
      elementTypes: canvasData.elements.reduce((acc, el) => {
        acc[el.type] = (acc[el.type] || 0) + 1;
        return acc;
      }, {}),
      createdAt: canvasData.createdAt,
      lastModified: canvasData.lastModified,
      elements: canvasData.elements.map(el => ({
        id: el.id,
        type: el.type,
        position: { x: el.x, y: el.y },
        zIndex: el.zIndex,
        createdAt: el.createdAt
      }))
    };

    res.json({
      success: true,
      metadata
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
};

// Export canvas as PNG
const exportPNG = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const canvasData = canvasSessions.get(sessionId);

    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas session not found' });
    }

    const imageBuffer = await canvasService.generateImage(canvasData);

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="canvas-${sessionId}.png"`,
      'Content-Length': imageBuffer.length
    });

    res.send(imageBuffer);
  } catch (error) {
    console.error('Error exporting PNG:', error);
    res.status(500).json({ error: 'Failed to export as PNG' });
  }
};

// Export canvas as PDF
const exportPDF = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { compress = true } = req.query;

    const canvasData = canvasSessions.get(sessionId);
    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas session not found' });
    }

    const pdfBuffer = await pdfService.generatePDF(canvasData, { compress: compress === 'true' });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="canvas-${sessionId}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ error: 'Failed to export as PDF' });
  }
};

// Export canvas as PNG from POST data
const exportPNGFromData = async (req, res) => {
  try {
    const canvasData = req.body;
    
    if (!canvasData || !canvasData.width || !canvasData.height) {
      return res.status(400).json({ error: 'Invalid canvas data' });
    }

    const imageBuffer = await canvasService.generateImage(canvasData);

    // Check if we got SVG instead of PNG (fallback scenario)
    const isSVG = imageBuffer.toString().startsWith('<svg');
    
    res.set({
      'Content-Type': isSVG ? 'image/svg+xml' : 'image/png',
      'Content-Disposition': `attachment; filename="canvas-export.${isSVG ? 'svg' : 'png'}"`,
      'Content-Length': imageBuffer.length
    });

    res.send(imageBuffer);
  } catch (error) {
    console.error('Error exporting PNG from data:', error);
    res.status(500).json({ error: 'Failed to export as PNG' });
  }
};

// Export canvas as PDF from POST data
const exportPDFFromData = async (req, res) => {
  try {
    const canvasData = req.body;
    const { compress = true } = req.query;
    
    if (!canvasData || !canvasData.width || !canvasData.height) {
      return res.status(400).json({ error: 'Invalid canvas data' });
    }

    const pdfBuffer = await pdfService.generatePDF(canvasData, { compress: compress === 'true' });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="canvas-export.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting PDF from data:', error);
    res.status(500).json({ error: 'Failed to export as PDF' });
  }
};

// Export the canvasSessions Map for use in other controllers
module.exports = {
  canvasSessions,
  healthCheck,
  initCanvas,
  getCanvas,
  clearCanvas,
  getCanvasMetadata,
  exportPNG,
  exportPDF,
  exportPNGFromData,
  exportPDFFromData
};
