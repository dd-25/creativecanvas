const express = require('express');
const router = express.Router();
const elementsController = require('../controllers/elementsController');
const { upload } = require('../config/multer');

// Element-specific routes
router.post('/api/canvas/:sessionId/rectangle', elementsController.addRectangle);
router.post('/api/canvas/:sessionId/circle', elementsController.addCircle);
router.post('/api/canvas/:sessionId/text', elementsController.addText);
router.post('/api/canvas/:sessionId/image-url', elementsController.addImageUrl);
router.post('/api/canvas/:sessionId/image-upload', upload.single('image'), elementsController.addImageUpload);

// Generic element routes
router.post('/api/canvas/:sessionId/element', elementsController.addElement);
router.put('/api/canvas/:sessionId/element/:elementId', elementsController.updateElement);
router.delete('/api/canvas/:sessionId/element/:elementId', elementsController.deleteElement);

module.exports = router;
