const PDFDocument = require('pdfkit');
const canvasService = require('./canvasService');

class PDFService {
  constructor() {
    this.defaultOptions = {
      compress: true,
      quality: 90,
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    };
  }

  /**
   * Generate PDF from canvas data with improved consistency
   * @param {Object} canvasData - Canvas configuration and elements
   * @param {Object} options - PDF generation options
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generatePDF(canvasData, options = {}) {
    try {
      const opts = { ...this.defaultOptions, ...options };
      const { width, height, backgroundColor, elements } = canvasData;

      // Try to use canvas service to generate image, fallback to direct PDF generation
      try {
        const imageBuffer = await canvasService.generateImage(canvasData);

        // If we got an SVG buffer (fallback), use direct PDF generation instead
        if (imageBuffer.toString().startsWith('<svg')) {
          console.log('Using direct PDF generation (SVG fallback detected)');
          return await this.generateDirectPDF(canvasData, options);
        }

        // Use the image in PDF
        const pageWidth = width;
        const pageHeight = height;

        const doc = new PDFDocument({
          size: [pageWidth, pageHeight],
          margin: 0,
          compress: opts.compress,
          info: {
            Title: `Canvas Export - ${canvasData.id || 'Untitled'}`,
            Author: 'Canvas Builder',
            Subject: 'Canvas Design Export',
            Creator: 'Canvas Builder API',
            Producer: 'Canvas Builder PDF Service',
            CreationDate: new Date(),
            ModDate: new Date()
          }
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));

        return new Promise((resolve, reject) => {
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);

          // Set background
          if (backgroundColor && backgroundColor !== '#ffffff') {
            doc.rect(0, 0, pageWidth, pageHeight).fill(backgroundColor);
          }

          // Add the generated image
          doc.image(imageBuffer, 0, 0, { width: pageWidth, height: pageHeight });
          doc.end();
        });

      } catch (imageError) {
        console.log('Image generation failed, using direct PDF generation:', imageError.message);
        return await this.generateDirectPDF(canvasData, options);
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  /**
   * Generate PDF directly from canvas elements (fallback method)
   */
  async generateDirectPDF(canvasData, options = {}) {
    const fallbackService = require('./fallbackCanvasService');
    return await fallbackService.generatePDF(canvasData);
  }

  /**
   * Draw individual element to PDF
   * @param {PDFDocument} doc - PDF document
   * @param {Object} element - Element to draw
   * @param {Object} margins - Page margins
   */
  async drawElementToPDF(doc, element, margins) {
    try {
      // Validate element data before drawing
      if (!this.validateElement(element)) {
        console.warn(`Invalid element data for PDF: ${element.id}`, element);
        return;
      }

      const offsetX = margins.left;
      const offsetY = margins.top;

      switch (element.type) {
        case 'rectangle':
          this.drawRectangleToPDF(doc, element, offsetX, offsetY);
          break;
        case 'circle':
          this.drawCircleToPDF(doc, element, offsetX, offsetY);
          break;
        case 'text':
          this.drawTextToPDF(doc, element, offsetX, offsetY);
          break;
        case 'image':
          await this.drawImageToPDF(doc, element, offsetX, offsetY);
          break;
        case 'drawing':
          this.drawPathToPDF(doc, element, offsetX, offsetY);
          break;
        default:
          console.warn(`Unknown element type for PDF: ${element.type}`);
      }
    } catch (error) {
      console.error(`Error drawing element ${element.id} to PDF:`, error);
      // Continue with other elements
    }
  }

  /**
   * Validate element data
   * @param {Object} element - Element to validate
   * @returns {boolean} Whether element is valid
   */
  validateElement(element) {
    if (!element || !element.type || !element.id) {
      return false;
    }

    // Check for required numeric properties
    const requiredNumbers = ['x', 'y'];
    for (const prop of requiredNumbers) {
      if (typeof element[prop] !== 'number' || isNaN(element[prop]) || !isFinite(element[prop])) {
        console.warn(`Invalid ${prop} for element ${element.id}:`, element[prop]);
        return false;
      }
    }

    // Type-specific validation
    switch (element.type) {
      case 'rectangle':
      case 'image':
        if (typeof element.width !== 'number' || isNaN(element.width) || element.width <= 0 ||
            typeof element.height !== 'number' || isNaN(element.height) || element.height <= 0) {
          console.warn(`Invalid dimensions for ${element.type} ${element.id}:`, {
            width: element.width,
            height: element.height
          });
          return false;
        }
        break;
      case 'circle':
        if (typeof element.radius !== 'number' || isNaN(element.radius) || element.radius <= 0) {
          console.warn(`Invalid radius for circle ${element.id}:`, element.radius);
          return false;
        }
        break;
      case 'text':
        if (!element.text || typeof element.text !== 'string' || element.text.trim().length === 0) {
          console.warn(`Invalid text for text element ${element.id}:`, element.text);
          return false;
        }
        break;
      case 'drawing':
        if (!element.path || !Array.isArray(element.path) || element.path.length < 2) {
          console.warn(`Invalid path for drawing element ${element.id}:`, element.path);
          return false;
        }
        // Validate path points
        for (const point of element.path) {
          if (typeof point.x !== 'number' || typeof point.y !== 'number' || 
              isNaN(point.x) || isNaN(point.y)) {
            console.warn(`Invalid path point in drawing element ${element.id}:`, point);
            return false;
          }
        }
        break;
    }

    return true;
  }

  /**
   * Draw rectangle to PDF
   * @param {PDFDocument} doc - PDF document
   * @param {Object} element - Rectangle element
   * @param {number} offsetX - X offset
   * @param {number} offsetY - Y offset
   */
  drawRectangleToPDF(doc, element, offsetX, offsetY) {
    const { x, y, width, height, fillColor, strokeColor, strokeWidth } = element;
    
    const rect = doc.rect(x + offsetX, y + offsetY, width, height);

    if (fillColor) {
      rect.fill(fillColor);
    }

    if (strokeColor && strokeWidth > 0) {
      rect.lineWidth(strokeWidth).stroke(strokeColor);
    }
  }

  /**
   * Draw circle to PDF
   * @param {PDFDocument} doc - PDF document
   * @param {Object} element - Circle element
   * @param {number} offsetX - X offset
   * @param {number} offsetY - Y offset
   */
  drawCircleToPDF(doc, element, offsetX, offsetY) {
    const { x, y, radius, fillColor, strokeColor, strokeWidth } = element;
    
    const circle = doc.circle(x + offsetX, y + offsetY, radius);

    if (fillColor) {
      circle.fill(fillColor);
    }

    if (strokeColor && strokeWidth > 0) {
      circle.lineWidth(strokeWidth).stroke(strokeColor);
    }
  }

  /**
   * Draw text to PDF
   * @param {PDFDocument} doc - PDF document
   * @param {Object} element - Text element
   * @param {number} offsetX - X offset
   * @param {number} offsetY - Y offset
   */
  drawTextToPDF(doc, element, offsetX, offsetY) {
    const { x, y, text, fontSize, fontFamily, color, fontWeight } = element;

    // Set font (PDFKit has limited font support)
    let fontName = 'Helvetica';
    if (fontFamily.toLowerCase().includes('times')) {
      fontName = 'Times-Roman';
    } else if (fontFamily.toLowerCase().includes('courier')) {
      fontName = 'Courier';
    }

    if (fontWeight === 'bold') {
      fontName += '-Bold';
    }

    try {
      doc.font(fontName);
    } catch (error) {
      // Fallback to Helvetica if font not found
      doc.font('Helvetica');
    }

    doc.fontSize(fontSize)
       .fillColor(color)
       .text(text, x + offsetX, y + offsetY, {
         lineBreak: false
       });
  }

  /**
   * Draw image to PDF
   * @param {PDFDocument} doc - PDF document
   * @param {Object} element - Image element
   * @param {number} offsetX - X offset
   * @param {number} offsetY - Y offset
   */
  async drawImageToPDF(doc, element, offsetX, offsetY) {
    const { x, y, width, height, imageUrl, imageData } = element;

    try {
      // Validate dimensions
      if (!width || !height || width <= 0 || height <= 0 || isNaN(width) || isNaN(height)) {
        throw new Error(`Invalid image dimensions: ${width}x${height}`);
      }

      if (imageData) {
        // Handle base64 image data
        const base64Data = imageData.split(',')[1]; // Remove data URL prefix
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        doc.image(imageBuffer, x + offsetX, y + offsetY, {
          width: width,
          height: height,
          fit: [width, height]
        });
      } else if (imageUrl) {
        // For URLs, we need to download the image first
        const imageBuffer = await this.downloadImageForPDF(imageUrl);
        
        doc.image(imageBuffer, x + offsetX, y + offsetY, {
          width: width,
          height: height,
          fit: [width, height]
        });
      }
    } catch (error) {
      console.error('Error adding image to PDF:', error);
      
      // Draw placeholder rectangle for failed images with valid dimensions
      const safeWidth = width && !isNaN(width) && width > 0 ? width : 100;
      const safeHeight = height && !isNaN(height) && height > 0 ? height : 100;
      const safeX = x && !isNaN(x) ? x : 0;
      const safeY = y && !isNaN(y) ? y : 0;
      
      doc.rect(safeX + offsetX, safeY + offsetY, safeWidth, safeHeight)
         .lineWidth(2)
         .dash(5, { space: 5 })
         .stroke('#ff0000');
      
      // Add error text
      doc.fontSize(12)
         .fillColor('#ff0000')
         .text('Image Load Error', safeX + offsetX + 10, safeY + offsetY + safeHeight/2 - 6);
    }
  }

  /**
   * Download image for PDF inclusion
   * @param {string} imageUrl - Image URL
   * @returns {Promise<Buffer>} Image buffer
   */
  async downloadImageForPDF(imageUrl) {
    const axios = require('axios');
    
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        maxContentLength: 10 * 1024 * 1024
      });

      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  /**
   * Add metadata page to PDF
   * @param {PDFDocument} doc - PDF document
   * @param {Object} canvasData - Canvas data
   * @param {Object} options - Options
   */
  addMetadataPage(doc, canvasData, options) {
    doc.addPage();
    
    const pageWidth = doc.page.width;
    const margin = 50;
    let yPosition = margin;

    // Title
    doc.fontSize(24)
       .fillColor('#333333')
       .text('Canvas Export Metadata', margin, yPosition);
    
    yPosition += 40;

    // Canvas information
    const metadata = [
      ['Canvas ID', canvasData.id],
      ['Dimensions', `${canvasData.width} × ${canvasData.height} pixels`],
      ['Background Color', canvasData.backgroundColor],
      ['Total Elements', canvasData.elements.length.toString()],
      ['Created At', new Date(canvasData.createdAt).toLocaleString()],
      ['Last Modified', new Date(canvasData.lastModified).toLocaleString()]
    ];

    doc.fontSize(12).fillColor('#666666');

    metadata.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(`${label}:`, margin, yPosition);
      doc.font('Helvetica').text(value, margin + 120, yPosition);
      yPosition += 20;
    });

    yPosition += 20;

    // Elements breakdown
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('Elements Breakdown', margin, yPosition);
    
    yPosition += 25;

    const elementTypes = canvasData.elements.reduce((acc, el) => {
      acc[el.type] = (acc[el.type] || 0) + 1;
      return acc;
    }, {});

    doc.fontSize(12).fillColor('#666666').font('Helvetica');

    Object.entries(elementTypes).forEach(([type, count]) => {
      doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)}: ${count}`, margin, yPosition);
      yPosition += 18;
    });

    // Generation info
    yPosition += 30;
    doc.fontSize(10)
       .fillColor('#999999')
       .text(`Generated by Canvas Builder API on ${new Date().toLocaleString()}`, margin, yPosition);
  }

  /**
   * Generate preview image as PDF page
   * @param {Object} canvasData - Canvas data
   * @returns {Promise<Buffer>} PDF buffer with preview
   */
  async generatePreviewPDF(canvasData) {
    try {
      // Generate canvas image first
      const imageBuffer = await canvasService.generateImage(canvasData);
      
      // Create PDF with the image
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffer => buffers.push(buffer));
      
      const pdfPromise = new Promise((resolve) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
      });

      // Add title
      doc.fontSize(18)
         .text('Canvas Preview', 50, 50);

      // Add canvas image (scaled to fit page)
      const maxWidth = doc.page.width - 100;
      const maxHeight = doc.page.height - 200;
      
      const scaleX = maxWidth / canvasData.width;
      const scaleY = maxHeight / canvasData.height;
      const scale = Math.min(scaleX, scaleY, 1); // Don't upscale

      const scaledWidth = canvasData.width * scale;
      const scaledHeight = canvasData.height * scale;
      
      const centerX = (doc.page.width - scaledWidth) / 2;
      const centerY = 100;

      doc.image(imageBuffer, centerX, centerY, {
        width: scaledWidth,
        height: scaledHeight
      });

      // Add info
      doc.fontSize(10)
         .text(`Original Size: ${canvasData.width} × ${canvasData.height}px`, 50, doc.page.height - 50);

      doc.end();
      return await pdfPromise;
    } catch (error) {
      console.error('Error generating preview PDF:', error);
      throw error;
    }
  }

  /**
   * Draw path to PDF (freehand drawing)
   * @param {PDFDocument} doc - PDF document
   * @param {Object} element - Path element
   * @param {number} offsetX - X offset
   * @param {number} offsetY - Y offset
   */
  drawPathToPDF(doc, element, offsetX, offsetY) {
    const { path, color, brushSize, tool } = element;
    
    if (!path || path.length < 2) return;
    
    // Skip eraser paths in PDF (they can't be properly represented)
    if (tool === 'eraser') return;
    
    // Start the path
    doc.moveTo(path[0].x + offsetX, path[0].y + offsetY);
    
    // Draw the path
    for (let i = 1; i < path.length; i++) {
      doc.lineTo(path[i].x + offsetX, path[i].y + offsetY);
    }
    
    // Set stroke properties and draw
    doc.lineWidth(brushSize)
       .strokeColor(color || '#000000')
       .stroke();
  }
}

module.exports = new PDFService();
