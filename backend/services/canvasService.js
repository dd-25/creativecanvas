const { createCanvas, loadImage, registerFont } = require('canvas');
const axios = require('axios');

class CanvasService {
  constructor() {
    // Register custom fonts if needed
    // registerFont('path/to/font.ttf', { family: 'CustomFont' });
  }

  /**
   * Generate canvas image from canvas data
   * @param {Object} canvasData - Canvas configuration and elements
   * @returns {Buffer} PNG image buffer
   */
  async generateImage(canvasData) {
    try {
      const { width, height, backgroundColor, elements } = canvasData;
      
      // Create canvas
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Set background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Sort elements by zIndex to maintain layering
      const sortedElements = elements.sort((a, b) => a.zIndex - b.zIndex);

      // Draw each element
      for (const element of sortedElements) {
        await this.drawElement(ctx, element);
      }

      // Return as PNG buffer
      return canvas.toBuffer('image/png');
    } catch (error) {
      console.error('Error generating canvas image:', error);
      throw new Error('Failed to generate canvas image');
    }
  }

  /**
   * Draw individual element on canvas context
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} element - Element to draw
   */
  async drawElement(ctx, element) {
    try {
      ctx.save();

      switch (element.type) {
        case 'rectangle':
          await this.drawRectangle(ctx, element);
          break;
        case 'circle':
          await this.drawCircle(ctx, element);
          break;
        case 'text':
          await this.drawText(ctx, element);
          break;
        case 'image':
          await this.drawImage(ctx, element);
          break;
        case 'drawing':
          await this.drawPath(ctx, element);
          break;
        default:
          console.warn(`Unknown element type: ${element.type}`);
      }

      ctx.restore();
    } catch (error) {
      console.error(`Error drawing element ${element.id}:`, error);
      // Continue with other elements instead of failing completely
    }
  }

  /**
   * Draw rectangle element
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} element - Rectangle element data
   */
  async drawRectangle(ctx, element) {
    const { x, y, width, height, fillColor, strokeColor, strokeWidth } = element;

    // Fill rectangle
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, width, height);
    }

    // Stroke rectangle
    if (strokeColor && strokeWidth > 0) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.strokeRect(x, y, width, height);
    }
  }

  /**
   * Draw circle element
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} element - Circle element data
   */
  async drawCircle(ctx, element) {
    const { x, y, radius, fillColor, strokeColor, strokeWidth } = element;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    // Fill circle
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    // Stroke circle
    if (strokeColor && strokeWidth > 0) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  }

  /**
   * Draw text element
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} element - Text element data
   */
  async drawText(ctx, element) {
    const { x, y, text, fontSize, fontFamily, color, fontWeight } = element;

    // Set font properties
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';

    // Draw text
    ctx.fillText(text, x, y);
  }

  /**
   * Draw image element
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} element - Image element data
   */
  async drawImage(ctx, element) {
    const { x, y, width, height, imageUrl, imageData } = element;

    try {
      let image;

      if (imageData) {
        // Handle base64 image data
        image = await loadImage(imageData);
      } else if (imageUrl) {
        // Handle image URL - load from remote source
        image = await this.loadImageFromUrl(imageUrl);
      } else {
        throw new Error('No image source provided');
      }

      // Ensure image is loaded and valid
      if (!image || image.width === 0 || image.height === 0) {
        throw new Error('Invalid image dimensions');
      }

      // Draw image with specified dimensions using high-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, x, y, width, height);
    } catch (error) {
      console.error('Error loading image:', error);
      
      // Draw placeholder rectangle for failed images with better styling
      ctx.save();
      
      // Fill background
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(x, y, width, height);
      
      // Draw border
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      
      // Draw X mark
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      const padding = 10;
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + width - padding, y + height - padding);
      ctx.moveTo(x + width - padding, y + padding);
      ctx.lineTo(x + padding, y + height - padding);
      ctx.stroke();
      
      // Draw error text
      ctx.fillStyle = '#ff0000';
      ctx.font = `${Math.min(14, height / 4)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Image Load Error', x + width / 2, y + height / 2 + 10);
      
      ctx.restore();
    }
  }

  /**
   * Load image from URL with timeout and error handling
   * @param {string} imageUrl - URL of the image to load
   * @returns {Promise<Image>} Loaded image
   */
  async loadImageFromUrl(imageUrl) {
    try {
      // For security, you might want to validate the URL here
      if (!this.isValidImageUrl(imageUrl)) {
        throw new Error('Invalid image URL');
      }

      // Download image with timeout
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000, // 10 second timeout
        maxContentLength: 10 * 1024 * 1024, // 10MB limit
        headers: {
          'User-Agent': 'Canvas-Builder/1.0'
        }
      });

      // Verify content type
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('URL does not point to an image');
      }

      // Convert to base64 and load
      const base64 = `data:${contentType};base64,${Buffer.from(response.data).toString('base64')}`;
      return await loadImage(base64);
    } catch (error) {
      console.error('Error loading image from URL:', error);
      throw error;
    }
  }

  /**
   * Validate image URL for security
   * @param {string} url - URL to validate
   * @returns {boolean} Whether URL is valid
   */
  isValidImageUrl(url) {
    try {
      const parsedUrl = new URL(url);
      
      // Only allow HTTP and HTTPS protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false;
      }

      // Block private IP ranges for security
      const hostname = parsedUrl.hostname;
      if (this.isPrivateIP(hostname)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if hostname is a private IP address
   * @param {string} hostname - Hostname to check
   * @returns {boolean} Whether hostname is private
   */
  isPrivateIP(hostname) {
    // This is a basic check - in production, use a more comprehensive library
    const privateRanges = [
      /^127\./, // localhost
      /^10\./, // private class A
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // private class B
      /^192\.168\./, // private class C
      /^169\.254\./, // link-local
      /^::1$/, // IPv6 localhost
      /^fc00:/, // IPv6 private
      /^fe80:/ // IPv6 link-local
    ];

    return privateRanges.some(regex => regex.test(hostname));
  }

  /**
   * Get canvas dimensions that would fit all elements
   * @param {Array} elements - Array of elements
   * @returns {Object} Suggested canvas dimensions
   */
  getOptimalCanvasDimensions(elements) {
    if (!elements || elements.length === 0) {
      return { width: 800, height: 600 };
    }

    let maxX = 0;
    let maxY = 0;

    elements.forEach(element => {
      switch (element.type) {
        case 'rectangle':
          maxX = Math.max(maxX, element.x + element.width);
          maxY = Math.max(maxY, element.y + element.height);
          break;
        case 'circle':
          maxX = Math.max(maxX, element.x + element.radius);
          maxY = Math.max(maxY, element.y + element.radius);
          break;
        case 'text':
          // Estimate text dimensions (rough approximation)
          const textWidth = element.text.length * element.fontSize * 0.6;
          maxX = Math.max(maxX, element.x + textWidth);
          maxY = Math.max(maxY, element.y + element.fontSize);
          break;
        case 'image':
          maxX = Math.max(maxX, element.x + element.width);
          maxY = Math.max(maxY, element.y + element.height);
          break;
      }
    });

    // Add some padding
    return {
      width: Math.max(800, Math.ceil(maxX + 50)),
      height: Math.max(600, Math.ceil(maxY + 50))
    };
  }

  /**
   * Draw path element (freehand drawing)
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} element - Path element data
   */
  async drawPath(ctx, element) {
    const { path, color, brushSize, tool } = element;
    
    if (!path || path.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    
    // Set drawing properties
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw the path
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    
    ctx.stroke();
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }
}

module.exports = new CanvasService();
