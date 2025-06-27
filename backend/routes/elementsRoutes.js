const express = require('express');
const router = express.Router();
const elementsController = require('../controllers/elementsController');
const { upload } = require('../config/multer');

// Element-specific routes - these should be mounted at /api/canvas from main app
router.post('/:sessionId/rectangle', elementsController.addRectangle);
router.post('/:sessionId/circle', elementsController.addCircle);
router.post('/:sessionId/text', elementsController.addText);
router.post('/:sessionId/image-url', elementsController.addImageUrl);
router.post('/:sessionId/image-upload', upload.single('image'), elementsController.addImageUpload);

// Generic element routes
router.post('/:sessionId/element', elementsController.addElement);
router.put('/:sessionId/element/:elementId', elementsController.updateElement);
router.delete('/:sessionId/element/:elementId', elementsController.deleteElement);

module.exports = router;
