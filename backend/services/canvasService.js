const puppeteer = require('puppeteer');
const axios = require('axios');

class CanvasService {
  constructor() {
    this.browser = null;
    this.fallbackService = null;
  }

  async initBrowser() {
    try {
      if (!this.browser) {
        this.browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
      }
      return this.browser;
    } catch (error) {
      console.error('Failed to initialize puppeteer, using fallback service:', error.message);
      if (!this.fallbackService) {
        this.fallbackService = require('./fallbackCanvasService');
      }
      throw error;
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Generate canvas image from canvas data
   * @param {Object} canvasData - Canvas configuration and elements
   * @returns {Buffer} PNG image buffer
   */
  async generateImage(canvasData) {
    try {
      const { width, height, backgroundColor, elements } = canvasData;
      
      // Store background color for use in drawing elements (especially eraser)
      this.canvasBackgroundColor = backgroundColor;
      
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set viewport size
      await page.setViewport({ width, height });
      
      // Process images to ensure they're loaded as base64
      const processedCanvasData = await this.processImagesForRendering(canvasData);
      
      // Generate HTML content
      const html = this.generateHTML(processedCanvasData);
      
      // Set content and wait for images to load
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Wait for all images to load completely
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images, img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve, reject) => {
              img.addEventListener('load', resolve);
              img.addEventListener('error', resolve); // Resolve even on error to not block
              setTimeout(resolve, 3000); // Timeout after 3 seconds
            });
          })
        );
      });
      
      const imageBuffer = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width, height }
      });
      
      await page.close();
      
      return imageBuffer;
    } catch (error) {
      console.error('Error generating canvas image with puppeteer, trying fallback:', error);
      
      // Use fallback service for serverless environments
      if (!this.fallbackService) {
        this.fallbackService = require('./fallbackCanvasService');
      }
      
      return await this.fallbackService.generateImage(canvasData);
    }
  }

  /**
   * Generate HTML representation of canvas
   * @param {Object} canvasData - Canvas configuration and elements
   * @returns {string} HTML string
   */
  generateHTML(canvasData) {
    const { width, height, backgroundColor, elements } = canvasData;
    
    // Sort elements by zIndex
    const sortedElements = elements.sort((a, b) => a.zIndex - b.zIndex);
    
    let elementsHTML = '';
    
    sortedElements.forEach(element => {
      elementsHTML += this.generateElementHTML(element);
    });
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          .canvas-container {
            position: relative;
            width: ${width}px;
            height: ${height}px;
            background-color: ${backgroundColor};
            overflow: hidden;
          }
          .element {
            position: absolute;
          }
          .rectangle {
            border-radius: 0;
          }
          .circle {
            border-radius: 50%;
          }
          .text {
            display: flex;
            align-items: center;
            justify-content: center;
            word-wrap: break-word;
            white-space: pre-wrap;
          }
          .image {
            object-fit: contain;
            opacity: 1;
          }
        </style>
      </head>
      <body>
        <div class="canvas-container">
          ${elementsHTML}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML for individual element
   * @param {Object} element - Element to render
   * @returns {string} HTML string
   */
  generateElementHTML(element) {
    const { type, x, y, width, height, rotation = 0 } = element;
    
    const baseStyle = `
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      height: ${height}px;
      transform: rotate(${rotation}deg);
      z-index: ${element.zIndex || 0};
    `;
    
    switch (type) {
      case 'rectangle':
        const rectFill = element.fillColor || element.fill || '#000';
        const rectStroke = element.strokeColor ? `border: ${element.strokeWidth || 1}px solid ${element.strokeColor};` : '';
        return `<div class="element rectangle" style="${baseStyle} background-color: ${rectFill}; ${rectStroke}"></div>`;
        
      case 'circle':
        const circleFill = element.fillColor || element.fill || '#000';
        const circleStroke = element.strokeColor ? `border: ${element.strokeWidth || 1}px solid ${element.strokeColor};` : '';
        return `<div class="element circle" style="${baseStyle} background-color: ${circleFill}; ${circleStroke}"></div>`;
        
      case 'text':
        const textColor = element.color || element.fill || '#000';
        return `<div class="element text" style="${baseStyle} 
          color: ${textColor};
          font-size: ${element.fontSize || 16}px;
          font-family: ${element.fontFamily || 'Arial'};
          font-weight: ${element.fontWeight || 'normal'};
          text-align: ${element.textAlign || 'center'};
        ">${element.text || ''}</div>`;
        case 'image':
        // Handle both imageUrl and src properties, plus imageData for base64
        const imgSrc = element.imageData || element.imageUrl || element.src || '';
        const imgStyle = `${baseStyle} object-fit: ${element.objectFit || 'contain'};`;
        return `<img class="element image" src="${imgSrc}" style="${imgStyle}" alt="Canvas Image" />`;
        
      case 'drawing':
        // Handle drawing paths (draw and erase)
        return this.generateDrawingHTML(element, baseStyle);
        
      default:
        return '';
    }
  }

  /**
   * Generate HTML for drawing element (paths)
   * @param {Object} element - Drawing element to render
   * @param {string} baseStyle - Base CSS style
   * @returns {string} HTML string with SVG path
   */
  generateDrawingHTML(element, baseStyle) {
    const { path, color, brushSize, tool } = element;
    
    if (!path || path.length < 2) return '';
    
    // Calculate bounding box for the path
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    path.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
    
    // Add padding for stroke width
    const padding = Math.max(brushSize || 3, 10);
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Generate SVG path string
    let pathString = '';
    if (path.length < 3) {
      // Simple line for short paths
      pathString = `M ${path[0].x - minX} ${path[0].y - minY}`;
      for (let i = 1; i < path.length; i++) {
        pathString += ` L ${path[i].x - minX} ${path[i].y - minY}`;
      }
    } else {
      // Smooth curves for longer paths
      pathString = `M ${path[0].x - minX} ${path[0].y - minY}`;
      
      for (let i = 1; i < path.length - 2; i++) {
        const xc = (path[i].x + path[i + 1].x) / 2 - minX;
        const yc = (path[i].y + path[i + 1].y) / 2 - minY;
        pathString += ` Q ${path[i].x - minX} ${path[i].y - minY} ${xc} ${yc}`;
      }
      
      // Last segment
      if (path.length > 2) {
        pathString += ` Q ${path[path.length - 2].x - minX} ${path[path.length - 2].y - minY} ${path[path.length - 1].x - minX} ${path[path.length - 1].y - minY}`;
      }
    }
    
    // For eraser, use the canvas background color instead of trying to actually erase
    const strokeColor = tool === 'eraser' ? (this.canvasBackgroundColor || '#ffffff') : (color || '#000000');
    const strokeWidth = tool === 'eraser' ? (brushSize || 3) * 2 : (brushSize || 3);
    
    return `
      <div class="element drawing" style="
        position: absolute;
        left: ${minX}px;
        top: ${minY}px;
        width: ${width}px;
        height: ${height}px;
        z-index: ${element.zIndex || 0};
        pointer-events: none;
      ">
        <svg width="${width}" height="${height}" style="display: block;">
          <path 
            d="${pathString}" 
            stroke="${strokeColor}" 
            stroke-width="${strokeWidth}" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            fill="none"
          />
        </svg>
      </div>
    `;
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
        case 'circle':
          maxX = Math.max(maxX, element.x + element.width);
          maxY = Math.max(maxY, element.y + element.height);
          break;
        case 'text':
          // Estimate text dimensions (rough approximation)
          const textWidth = element.text.length * (element.fontSize || 16) * 0.6;
          maxX = Math.max(maxX, element.x + textWidth);
          maxY = Math.max(maxY, element.y + (element.fontSize || 16));
          break;
        case 'image':
          maxX = Math.max(maxX, element.x + element.width);
          maxY = Math.max(maxY, element.y + element.height);
          break;
        case 'drawing':
          // For drawing elements, calculate from path bounds
          if (element.path && element.path.length > 0) {
            element.path.forEach(point => {
              maxX = Math.max(maxX, point.x + (element.brushSize || 3));
              maxY = Math.max(maxY, point.y + (element.brushSize || 3));
            });
          }
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
   * Process canvas data to convert image URLs to base64 for reliable rendering
   * @param {Object} canvasData - Original canvas data
   * @returns {Object} Processed canvas data with base64 images
   */
  async processImagesForRendering(canvasData) {
    const { elements, ...rest } = canvasData;
    
    const processedElements = await Promise.all(elements.map(async (element) => {
      if (element.type === 'image') {
        // Handle different image property names from frontend
        const imageUrl = element.imageUrl || element.src;
        const imageData = element.imageData;
        
        // If we already have base64 data, use it
        if (imageData && imageData.startsWith('data:')) {
          return { ...element, imageData, imageUrl: undefined, src: imageData };
        }
        
        // If we have a URL and it's not already base64, convert it
        if (imageUrl && !imageUrl.startsWith('data:')) {
          try {
            const base64Src = await this.convertImageToBase64(imageUrl);
            return { ...element, imageData: base64Src, imageUrl: undefined, src: base64Src };
          } catch (error) {
            console.error('Failed to load image:', imageUrl, error);
            // Keep original properties on failure
            return element;
          }
        }
      }
      return element;
    }));
    
    return { ...rest, elements: processedElements };
  }

  /**
   * Convert image URL to base64 data URL
   * @param {string} imageUrl - URL of the image
   * @returns {Promise<string>} Base64 data URL
   */
  async convertImageToBase64(imageUrl) {
    try {
      if (!this.isValidImageUrl(imageUrl)) {
        throw new Error('Invalid image URL');
      }

      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        maxContentLength: 10 * 1024 * 1024, // 10MB limit
        headers: {
          'User-Agent': 'Canvas-Builder/1.0'
        }
      });

      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('URL does not point to an image');
      }

      const base64 = Buffer.from(response.data).toString('base64');
      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }
}

module.exports = new CanvasService();
