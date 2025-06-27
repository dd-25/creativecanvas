const PDFDocument = require('pdfkit');

class FallbackCanvasService {
  constructor() {
    this.isServerless = true;
  }

  /**
   * Generate simple PDF without images for serverless environment
   * @param {Object} canvasData - Canvas configuration and elements
   * @returns {Buffer} PDF buffer
   */
  async generatePDF(canvasData) {
    try {
      let { width, height, backgroundColor, elements } = canvasData;
      
      // Sanitize dimensions
      width = Number(width) || 800;
      height = Number(height) || 600;
      
      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        width = 800;
        height = 600;
      }
      
      // Sanitize elements
      elements = (elements || []).filter(element => element && element.type && element.id);
      
      // Create PDF document
      const doc = new PDFDocument({
        size: [width, height],
        margin: 0
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        doc.on('error', reject);

        // Set background
        if (backgroundColor && backgroundColor !== '#ffffff') {
          doc.rect(0, 0, width, height)
             .fill(backgroundColor);
        }

        // Draw elements
        elements.forEach(element => {
          try {
            this.drawElementToPDF(doc, this.sanitizeElementBasic(element));
          } catch (err) {
            console.warn(`Failed to draw element ${element.id}:`, err.message);
          }
        });

        doc.end();
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Generate simple image representation (base64 SVG)
   * @param {Object} canvasData - Canvas configuration and elements
   * @returns {Buffer} SVG as buffer
   */
  async generateImage(canvasData) {
    try {
      let { width, height, backgroundColor, elements } = canvasData;
      
      // Sanitize dimensions
      width = Number(width) || 800;
      height = Number(height) || 600;
      
      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        width = 800;
        height = 600;
      }
      
      // Sanitize elements
      elements = (elements || []).filter(element => element && element.type && element.id);
      
      let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
      
      // Background
      if (backgroundColor) {
        svgContent += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
      }
      
      // Elements
      elements.forEach(element => {
        try {
          svgContent += this.elementToSVG(this.sanitizeElementBasic(element));
        } catch (err) {
          console.warn(`Failed to convert element ${element.id} to SVG:`, err.message);
        }
      });
      
      svgContent += '</svg>';
      
      return Buffer.from(svgContent, 'utf8');
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image');
    }
  }

  /**
   * Basic element sanitization for fallback service
   * @param {Object} element - Element to sanitize
   * @returns {Object} Sanitized element
   */
  sanitizeElementBasic(element) {
    const sanitized = { ...element };
    
    // Sanitize numeric properties
    ['x', 'y', 'width', 'height', 'radius', 'fontSize', 'strokeWidth', 'brushSize'].forEach(prop => {
      if (prop in sanitized) {
        const value = Number(sanitized[prop]);
        if (isNaN(value) || !isFinite(value)) {
          sanitized[prop] = prop === 'fontSize' ? 16 : (prop === 'width' || prop === 'height') ? 100 : 0;
        } else {
          sanitized[prop] = value;
        }
      }
    });
    
    return sanitized;
  }

  drawElementToPDF(doc, element) {
    switch (element.type) {
      case 'rectangle':
        const rectFill = element.fillColor || element.fill || '#000000';
        doc.rect(element.x, element.y, element.width, element.height)
           .fill(rectFill);
        
        if (element.strokeColor) {
          doc.rect(element.x, element.y, element.width, element.height)
             .stroke(element.strokeColor);
        }
        break;

      case 'circle':
        const circleFill = element.fillColor || element.fill || '#000000';
        const radius = Math.min(element.width, element.height) / 2;
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        
        doc.circle(centerX, centerY, radius)
           .fill(circleFill);
        
        if (element.strokeColor) {
          doc.circle(centerX, centerY, radius)
             .stroke(element.strokeColor);
        }
        break;

      case 'text':
        const textColor = element.color || element.fill || '#000000';
        doc.fillColor(textColor)
           .fontSize(element.fontSize || 16)
           .font(element.fontFamily || 'Helvetica')
           .text(element.text || '', element.x, element.y, {
             width: element.width || 200,
             align: element.textAlign || 'left'
           });
        break;

      case 'image':
        // For serverless, just draw a placeholder rectangle
        doc.rect(element.x, element.y, element.width, element.height)
           .stroke('#cccccc')
           .fillColor('#f5f5f5')
           .fill();
        
        doc.fillColor('#666666')
           .fontSize(12)
           .text('Image', element.x + 10, element.y + element.height/2, {
             width: element.width - 20,
             align: 'center'
           });
        break;
    }
  }

  elementToSVG(element) {
    switch (element.type) {
      case 'rectangle':
        const rectFill = element.fillColor || element.fill || '#000000';
        const rectStroke = element.strokeColor || 'none';
        return `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${rectFill}" stroke="${rectStroke}" stroke-width="${element.strokeWidth || 0}"/>`;

      case 'circle':
        const circleFill = element.fillColor || element.fill || '#000000';
        const circleStroke = element.strokeColor || 'none';
        const cx = element.x + element.width / 2;
        const cy = element.y + element.height / 2;
        const r = Math.min(element.width, element.height) / 2;
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${circleFill}" stroke="${circleStroke}" stroke-width="${element.strokeWidth || 0}"/>`;

      case 'text':
        const textColor = element.color || element.fill || '#000000';
        return `<text x="${element.x}" y="${element.y + (element.fontSize || 16)}" fill="${textColor}" font-size="${element.fontSize || 16}" font-family="${element.fontFamily || 'Arial'}">${element.text || ''}</text>`;

      case 'image':
        return `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="#f5f5f5" stroke="#cccccc" stroke-width="1"/>
                <text x="${element.x + element.width/2}" y="${element.y + element.height/2}" fill="#666666" font-size="12" text-anchor="middle">Image</text>`;

      case 'drawing':
        if (!element.path || element.path.length < 2) return '';
        
        let pathString = `M ${element.path[0].x} ${element.path[0].y}`;
        for (let i = 1; i < element.path.length; i++) {
          pathString += ` L ${element.path[i].x} ${element.path[i].y}`;
        }
        
        const strokeColor = element.tool === 'eraser' ? 'none' : (element.color || '#000000');
        return `<path d="${pathString}" stroke="${strokeColor}" stroke-width="${element.brushSize || 3}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

      default:
        return '';
    }
  }
}

module.exports = new FallbackCanvasService();
