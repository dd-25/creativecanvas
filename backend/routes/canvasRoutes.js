const express = require('express');
const router = express.Router();
const canvasController = require('../controllers/canvasController');

// Health check endpoint
router.get('/health', canvasController.healthCheck);

// Canvas management routes
router.post('/api/canvas/init', canvasController.initCanvas);
router.get('/api/canvas/:sessionId', canvasController.getCanvas);
router.delete('/api/canvas/:sessionId/clear', canvasController.clearCanvas);
router.get('/api/canvas/:sessionId/metadata', canvasController.getCanvasMetadata);

// Export routes - support both GET with sessionId and POST with canvas data
router.get('/api/canvas/:sessionId/export/png', canvasController.exportPNG);
router.post('/api/canvas/export/png', canvasController.exportPNGFromData);
router.get('/api/canvas/:sessionId/export/pdf', canvasController.exportPDF);
router.post('/api/canvas/export/pdf', canvasController.exportPDFFromData);

module.exports = router;
