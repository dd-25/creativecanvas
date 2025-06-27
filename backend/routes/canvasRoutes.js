const express = require('express');
const router = express.Router();
const canvasController = require('../controllers/canvasController');

// Health check endpoint
router.get('/health', canvasController.healthCheck);

// Canvas management routes
router.post('/init', canvasController.initCanvas);
router.get('/:sessionId', canvasController.getCanvas);
router.delete('/:sessionId/clear', canvasController.clearCanvas);
router.get('/:sessionId/metadata', canvasController.getCanvasMetadata);

// Export routes - support both GET with sessionId and POST with canvas data
router.get('/:sessionId/export/png', canvasController.exportPNG);
router.post('/export/png', canvasController.exportPNGFromData);
router.get('/:sessionId/export/pdf', canvasController.exportPDF);
router.post('/export/pdf', canvasController.exportPDFFromData);

module.exports = router;
