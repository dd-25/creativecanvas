import React, { useRef, useEffect, useState } from 'react';
import { FiMove, FiTrash2 } from 'react-icons/fi';
import './Canvas.css';

const Canvas = ({ 
  canvasData, 
  selectedTool, 
  selectedElement, 
  onElementSelect, 
  onAddElement,
  onDeleteElement,
  zoomLevel = 100,
  showGrid = false,
  showRuler = false,
  drawColor = '#000000',
  brushSize = 3,
  onCanvasChange
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState([]);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [previewElement, setPreviewElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [initialBounds, setInitialBounds] = useState(null);
  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, text: '', fontSize: 24, color: drawColor });
  const [imagesLoading, setImagesLoading] = useState(new Set());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Calculate canvas scale and positioning
  useEffect(() => {
    const updateCanvasPosition = () => {
      if (!canvasData) return;

      // Calculate scale based on zoom level, but ensure initial fit
      let newScale = zoomLevel / 100;
      
      // On initial load, scale to fit screen nicely
      if (zoomLevel === 100) {
        const maxWidth = window.innerWidth * 0.7; // 70% of viewport width
        const maxHeight = window.innerHeight * 0.6; // 60% of viewport height
        const scaleX = maxWidth / canvasData.width;
        const scaleY = maxHeight / canvasData.height;
        newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
      }
      
      setScale(newScale);
      setPan({ x: 0, y: 0 });
    };

    updateCanvasPosition();
    
    const handleResize = () => {
      setTimeout(updateCanvasPosition, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasData, zoomLevel]);

  // Draw canvas content with improved stability
  useEffect(() => {
    if (!canvasRef.current || !canvasData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Prevent unnecessary redraws
    if (canvas.width === canvasData.width && 
        canvas.height === canvasData.height && 
        !previewElement && 
        currentPath.length === 0) {
      // Only redraw if something actually changed
      const lastDrawnElements = canvas.lastDrawnElements;
      const currentElements = JSON.stringify(canvasData.elements);
      const lastSelectedId = canvas.lastSelectedId;
      const currentSelectedId = selectedElement?.id;
      
      if (lastDrawnElements === currentElements && 
          lastSelectedId === currentSelectedId) {
        return; // Skip redraw if nothing changed
      }
    }
    
    // Set canvas size
    canvas.width = canvasData.width;
    canvas.height = canvasData.height;
    
    // Store state for comparison
    canvas.lastDrawnElements = JSON.stringify(canvasData.elements);
    canvas.lastSelectedId = selectedElement?.id;
    
    // Clear canvas with background color
    ctx.fillStyle = canvasData.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvasData.width, canvasData.height);
    
    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx);
    }
    
    // Draw elements
    canvasData.elements
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      .forEach(element => {
        drawElement(ctx, element);
      });
    
    // Draw preview element
    if (previewElement) {
      drawElement(ctx, previewElement);
    }
    
    // Draw current drawing path preview with smooth curves
    if (currentPath.length > 0 && (selectedTool === 'draw' || selectedTool === 'eraser')) {
      ctx.save();
      ctx.beginPath();
      
      if (currentPath.length < 3) {
        // For short paths, use simple line
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
      } else {
        // For longer paths, use smooth curves
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        
        for (let i = 1; i < currentPath.length - 2; i++) {
          const xc = (currentPath[i].x + currentPath[i + 1].x) / 2;
          const yc = (currentPath[i].y + currentPath[i + 1].y) / 2;
          ctx.quadraticCurveTo(currentPath[i].x, currentPath[i].y, xc, yc);
        }
        
        // Last segment
        if (currentPath.length > 2) {
          ctx.quadraticCurveTo(
            currentPath[currentPath.length - 2].x,
            currentPath[currentPath.length - 2].y,
            currentPath[currentPath.length - 1].x,
            currentPath[currentPath.length - 1].y
          );
        }
      }
      
      if (selectedTool === 'draw') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = brushSize;
      } else if (selectedTool === 'eraser') {
        // For eraser preview, use background color
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = canvasData?.backgroundColor || '#ffffff';
        ctx.lineWidth = brushSize * 2;
      }
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }
    
    // Draw eraser cursor
    if (selectedTool === 'eraser' && mousePosition && !isDrawing) {
      ctx.save();
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.globalCompositeOperation = 'source-over';
      
      // Draw eraser circle
      const eraserRadius = (brushSize * 2) / 2;
      ctx.beginPath();
      ctx.arc(mousePosition.x, mousePosition.y, eraserRadius, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Draw crosshair in center
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mousePosition.x - 5, mousePosition.y);
      ctx.lineTo(mousePosition.x + 5, mousePosition.y);
      ctx.moveTo(mousePosition.x, mousePosition.y - 5);
      ctx.lineTo(mousePosition.x, mousePosition.y + 5);
      ctx.stroke();
      
      ctx.restore();
    }
  }, [canvasData, showGrid, previewElement, selectedElement, scale, currentPath, selectedTool, drawColor, brushSize]);

  // Update text input color when drawColor changes
  useEffect(() => {
    if (textInput.visible) {
      setTextInput(prev => ({ ...prev, color: drawColor }));
    }
  }, [drawColor]);

  const drawGrid = (ctx) => {
    const gridSize = 20;
    const { width, height } = canvasData;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const drawElement = (ctx, element) => {
    ctx.save();

    switch (element.type) {
      case 'rectangle':
        drawRectangle(ctx, element);
        break;
      case 'circle':
        drawCircle(ctx, element);
        break;
      case 'text':
        drawText(ctx, element);
        break;
      case 'image':
        drawImage(ctx, element);
        break;
      case 'drawing':
        drawPath(ctx, element);
        break;
      default:
        console.warn('Unknown element type:', element.type);
    }
    
    // Draw preview outline
    if (element.isPreview) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      if (element.type === 'rectangle') {
        ctx.strokeRect(element.x, element.y, element.width, element.height);
      } else if (element.type === 'circle') {
        ctx.beginPath();
        ctx.arc(element.x, element.y, element.radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  const drawRectangle = (ctx, element) => {
    const { x, y, width, height, fillColor, strokeColor, strokeWidth } = element;
    
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, width, height);
    }
    
    if (strokeColor && strokeWidth > 0) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.strokeRect(x, y, width, height);
    }
  };

  const drawCircle = (ctx, element) => {
    const { x, y, radius, fillColor, strokeColor, strokeWidth } = element;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    
    if (strokeColor && strokeWidth > 0) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  };

  const drawText = (ctx, element) => {
    const { x, y, text, fontSize, fontFamily, color, fontWeight } = element;
    
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
  };

  const drawImage = (ctx, element) => {
    const { x, y, width, height, imageUrl, imageData } = element;
    
    if (!imageData && !imageUrl) return;
    
    // Use cached images to avoid reload issues
    const imageKey = imageData || imageUrl;
    if (window.imageCache && window.imageCache[imageKey]) {
      const cachedImg = window.imageCache[imageKey];
      if (cachedImg.complete && cachedImg.naturalHeight !== 0) {
        try {
          ctx.drawImage(cachedImg, x, y, width, height);
          return;
        } catch (error) {
          console.error('Failed to draw cached image:', error);
        }
      }
    }
    
    // Don't create new image if already loading
    if (imagesLoading.has(imageKey)) {
      drawImagePlaceholder(ctx, element, 'Loading...');
      return;
    }
    
    // Create new image if not cached or cache failed
    const img = new Image();
    
    // Initialize cache if needed
    if (!window.imageCache) {
      window.imageCache = {};
    }
    
    // Mark as loading
    setImagesLoading(prev => new Set(prev).add(imageKey));
    
    img.onload = () => {
      try {
        // Remove from loading set
        setImagesLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageKey);
          return newSet;
        });
        
        // Cache the loaded image
        window.imageCache[imageKey] = img;
        
        // Force canvas redraw to show the image
        if (onCanvasChange) {
          requestAnimationFrame(() => onCanvasChange());
        }
      } catch (error) {
        console.error('Failed to draw image:', error);
        setImagesLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageKey);
          return newSet;
        });
      }
    };
    
    img.onerror = () => {
      console.error('Failed to load image:', imageUrl || 'base64 data');
      setImagesLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageKey);
        return newSet;
      });
      delete window.imageCache[imageKey]; // Remove from cache if failed
      
      // Force redraw to show error placeholder
      if (onCanvasChange) {
        requestAnimationFrame(() => onCanvasChange());
      }
    };
    
    if (imageData) {
      img.src = imageData;
    } else if (imageUrl) {
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    }
  };

  const drawImagePlaceholder = (ctx, element, message = 'Image failed to load') => {
    const { x, y, width, height } = element;
    
    // Draw background
    ctx.fillStyle = message.includes('Loading') ? '#f0f8ff' : '#ffeeee';
    ctx.fillRect(x, y, width, height);
    
    // Draw dashed border
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = message.includes('Loading') ? '#3b82f6' : '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    if (!message.includes('Loading')) {
      // Draw X for error
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 10);
      ctx.lineTo(x + width - 10, y + height - 10);
      ctx.moveTo(x + width - 10, y + 10);
      ctx.lineTo(x + 10, y + height - 10);
      ctx.stroke();
    }
    
    // Reset line dash
    ctx.setLineDash([]);
    
    // Draw message text
    ctx.fillStyle = message.includes('Loading') ? '#3b82f6' : '#ff0000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, x + width/2, y + height/2);
    ctx.restore();
  };

  const drawPath = (ctx, element) => {
    const { path, color, brushSize, tool } = element;
    
    if (!path || path.length < 2) return;
    
    ctx.save();
    ctx.beginPath();
    
    if (path.length < 3) {
      // For short paths, use simple line
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
    } else {
      // For longer paths, use smooth curves
      ctx.moveTo(path[0].x, path[0].y);
      
      for (let i = 1; i < path.length - 2; i++) {
        const xc = (path[i].x + path[i + 1].x) / 2;
        const yc = (path[i].y + path[i + 1].y) / 2;
        ctx.quadraticCurveTo(path[i].x, path[i].y, xc, yc);
      }
      
      // Last segment
      if (path.length > 2) {
        ctx.quadraticCurveTo(
          path[path.length - 2].x,
          path[path.length - 2].y,
          path[path.length - 1].x,
          path[path.length - 1].y
        );
      }
    }
    
    if (tool === 'eraser') {
      // For eraser, use background color instead of destination-out
      // This allows layer-by-layer erasing
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = canvasData?.backgroundColor || '#ffffff';
      ctx.lineWidth = brushSize * 2; // Make eraser wider
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  };

  // Cleanup effect for image cache
  useEffect(() => {
    return () => {
      // Clear image cache when component unmounts to prevent memory leaks
      if (window.imageCache) {
        const cacheSize = Object.keys(window.imageCache).length;
        if (cacheSize > 50) { // Limit cache size
          console.log('Clearing image cache to prevent memory leaks');
          window.imageCache = {};
        }
      }
    };
  }, []);

  const getCanvasCoordinates = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    
    // Calculate mouse position relative to the canvas
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;
    
    // Account for canvas scaling - convert from display coordinates to actual canvas coordinates
    const canvasX = mouseX / scale;
    const canvasY = mouseY / scale;
    
    // Ensure coordinates are within canvas bounds
    const clampedX = Math.max(0, Math.min(canvasX, canvas.width));
    const clampedY = Math.max(0, Math.min(canvasY, canvas.height));
    
    return { x: clampedX, y: clampedY };
  };

  const getElementAt = (x, y) => {
    // Check elements in reverse z-index order (top to bottom)
    const sortedElements = [...canvasData.elements].sort((a, b) => b.zIndex - a.zIndex);
    
    for (const element of sortedElements) {
      if (isPointInElement(x, y, element)) {
        return element;
      }
    }
    
    return null;
  };

  const isPointInElement = (x, y, element) => {
    switch (element.type) {
      case 'rectangle':
        return x >= element.x && x <= element.x + element.width &&
               y >= element.y && y <= element.y + element.height;
      case 'circle':
        const dx = x - element.x;
        const dy = y - element.y;
        return Math.sqrt(dx * dx + dy * dy) <= element.radius;
      case 'text':
        // Approximate text bounds
        const textWidth = element.text.length * element.fontSize * 0.6;
        return x >= element.x && x <= element.x + textWidth &&
               y >= element.y && y <= element.y + element.fontSize;
      case 'image':
        return x >= element.x && x <= element.x + element.width &&
               y >= element.y && y <= element.y + element.height;
      case 'drawing':
        // Check if point is near any part of the path
        if (!element.path || element.path.length < 2) return false;
        const threshold = element.brushSize / 2 + 5; // Add some tolerance
        
        for (let i = 0; i < element.path.length - 1; i++) {
          const p1 = element.path[i];
          const p2 = element.path[i + 1];
          
          // Distance from point to line segment
          const dist = distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
          if (dist <= threshold) return true;
        }
        return false;
      default:
        return false;
    }
  };

  // Helper function to calculate distance from point to line segment
  const distanceToLineSegment = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleMouseDown = (e) => {
    const coords = getCanvasCoordinates(e);
    setIsMouseDown(true);
    
    e.preventDefault();
    
    // Cancel text input if clicking outside
    if (textInput.visible && !e.target.closest('.text-input-overlay')) {
      handleTextCancel();
      return;
    }
    
    if (selectedTool === 'draw') {
      setIsDrawing(true);
      setCurrentPath([coords]);
      startDrawing(coords);
    } else if (selectedTool === 'eraser') {
      // Start erasing by drawing with background color (layer-by-layer)
      setIsDrawing(true);
      setCurrentPath([coords]);
      startDrawing(coords);
    } else {
      setIsDrawing(true);
      setDragStart(coords);
    }
  };

  const handleMouseMove = (e) => {
    const coords = getCanvasCoordinates(e);
    
    // Always track mouse position for cursor updates (with throttling for performance)
    if (Date.now() - (window.lastMouseUpdate || 0) > 16) { // ~60fps
      setMousePosition(coords);
      window.lastMouseUpdate = Date.now();
    }
    
    if (!isMouseDown) return;
    
    if (isDrawing && (selectedTool === 'draw' || selectedTool === 'eraser')) {
      // Continue drawing/erasing
      const newPath = [...currentPath, coords];
      setCurrentPath(newPath);
      continueDrawing(coords);
    } else if (isDrawing && dragStart) {
      // Show preview for shapes
      const width = Math.abs(coords.x - dragStart.x);
      const height = Math.abs(coords.y - dragStart.y);
      const x = Math.min(coords.x, dragStart.x);
      const y = Math.min(coords.y, dragStart.y);

      if (selectedTool === 'rectangle') {
        setPreviewElement({
          id: 'preview',
          type: 'rectangle',
          x,
          y,
          width,
          height,
          fillColor: drawColor,
          strokeColor: drawColor,
          strokeWidth: 1,
          isPreview: true
        });
      } else if (selectedTool === 'circle') {
        const radius = Math.sqrt(width * width + height * height);
        setPreviewElement({
          id: 'preview',
          type: 'circle',
          x: dragStart.x,
          y: dragStart.y,
          radius,
          fillColor: drawColor,
          strokeColor: drawColor,
          strokeWidth: 1,
          isPreview: true
        });
      }
    }
  };

  const handleMouseUp = (e) => {
    setIsMouseDown(false);
    
    if (!isDrawing) return;
    
    const coords = getCanvasCoordinates(e);
    setIsDrawing(false);
    
    if (selectedTool === 'draw' || selectedTool === 'eraser') {
      finishDrawing();
      return;
    }
    
    if (!dragStart) return;
    
    // Calculate element properties based on tool
    let elementData;
    
    switch (selectedTool) {
      case 'rectangle':
        const width = Math.abs(coords.x - dragStart.x);
        const height = Math.abs(coords.y - dragStart.y);
        if (width < 5 || height < 5) return; // Minimum size
        
        elementData = {
          type: 'rectangle',
          x: Math.min(dragStart.x, coords.x),
          y: Math.min(dragStart.y, coords.y),
          width,
          height,
          fillColor: drawColor + '80', // Add transparency
          strokeColor: drawColor,
          strokeWidth: 2
        };
        break;
        
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(coords.x - dragStart.x, 2) + Math.pow(coords.y - dragStart.y, 2)
        );
        if (radius < 5) return; // Minimum radius
        
        elementData = {
          type: 'circle',
          x: dragStart.x,
          y: dragStart.y,
          radius,
          fillColor: drawColor + '80', // Add transparency
          strokeColor: drawColor,
          strokeWidth: 2
        };
        break;
        
      default:
        return;
    }
    
    if (elementData && onAddElement) {
      onAddElement(elementData);
    }
    
    setDragStart(null);
    setPreviewElement(null);
  };

  // Drawing functions for freehand drawing
  const startDrawing = (coords) => {
    // Just track the starting point, main render will handle drawing
    setCurrentPath([coords]);
  };

  const continueDrawing = (coords) => {
    // Add point to path with simple distance-based filtering for smoother lines
    setCurrentPath(prev => {
      if (prev.length === 0) return [coords];
      
      const lastPoint = prev[prev.length - 1];
      const distance = Math.sqrt(
        Math.pow(coords.x - lastPoint.x, 2) + Math.pow(coords.y - lastPoint.y, 2)
      );
      
      // Only add point if it's far enough from the last point (reduces noise)
      if (distance > 1) {
        return [...prev, coords];
      }
      
      return prev;
    });
  };

  const finishDrawing = async () => {
    if (currentPath.length < 2) {
      setCurrentPath([]);
      return;
    }
    
    // Create a drawing element to save the path
    const elementData = {
      type: 'drawing',
      path: [...currentPath], // Make a copy of the path
      color: selectedTool === 'draw' ? drawColor : 'eraser',
      brushSize: selectedTool === 'draw' ? brushSize : brushSize * 2,
      tool: selectedTool,
      zIndex: Date.now() // Ensure unique z-index
    };
    
    setCurrentPath([]);
    
    // Add the drawing element to persist it WITHOUT waiting (to avoid loading indicator)
    if (onAddElement) {
      try {
        // Fire and forget - don't wait for response to avoid loading delays
        onAddElement(elementData);
      } catch (error) {
        console.error('Failed to add drawing element:', error);
      }
    }
  };

  const drawPreview = (coords) => {
    if (!dragStart) return;
    
    let preview;
    
    switch (selectedTool) {
      case 'rectangle':
        const width = Math.abs(coords.x - dragStart.x);
        const height = Math.abs(coords.y - dragStart.y);
        
        preview = {
          type: 'rectangle',
          x: Math.min(dragStart.x, coords.x),
          y: Math.min(dragStart.y, coords.y),
          width,
          height,
          fillColor: drawColor + '40', // Semi-transparent
          strokeColor: drawColor,
          strokeWidth: 2,
          isPreview: true
        };
        break;
        
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(coords.x - dragStart.x, 2) + Math.pow(coords.y - dragStart.y, 2)
        );
        
        preview = {
          type: 'circle',
          x: dragStart.x,
          y: dragStart.y,
          radius,
          fillColor: drawColor + '40', // Semi-transparent
          strokeColor: drawColor,
          strokeWidth: 2,
          isPreview: true
        };
        break;
    }
    
    setPreviewElement(preview);
  };

  const updateElementPosition = async (elementId, newX, newY) => {
    // This would need to be implemented in the API
    // For now, we'll update locally and then refresh from server
    if (onCanvasChange) {
      onCanvasChange();
    }
  };

  const updateElementDimensions = async (elementId, updatedElement) => {
    try {
      await canvasAPI.updateElement(sessionId, elementId, updatedElement);
      await loadCanvasData();
    } catch (error) {
      console.error('Failed to update element dimensions:', error);
      // Revert to original state if update fails
      setPreviewElement(null);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.text.trim()) {
      setTextInput({ ...textInput, visible: false });
      return;
    }

    const elementData = {
      type: 'text',
      x: textInput.x,
      y: textInput.y,
      text: textInput.text,
      fontSize: textInput.fontSize,
      fontFamily: 'Arial',
      color: drawColor,
      fontWeight: 'normal'
    };

    onAddElement(elementData);
    setTextInput({ visible: false, x: 0, y: 0, text: '', fontSize: 24, color: drawColor });
  };

  const handleTextCancel = () => {
    setTextInput({ visible: false, x: 0, y: 0, text: '', fontSize: 24, color: drawColor });
  };

  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleTextCancel();
    }
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    setTextInput({ ...textInput, text: value });
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const handleCanvasClick = (e) => {
    // Don't create new text input if one is already visible
    if (textInput.visible) return;
    
    if (selectedTool === 'text') {
      const coords = getCanvasCoordinates(e);
      
      // Create text input anywhere on the scroll area
      setTextInput({
        visible: true,
        x: coords.x,
        y: coords.y,
        text: '',
        fontSize: 24,
        color: drawColor,
      });
    }
  };

  // Get cursor based on selected tool and mouse position
  const getCurrentCursor = () => {
    // Return appropriate cursor for each tool
    switch (selectedTool) {
      case 'draw': return 'crosshair';
      case 'eraser': return 'none'; // Hide default cursor, we draw custom eraser cursor
      case 'rectangle':
      case 'circle': return 'crosshair';
      case 'text': return 'text';
      case 'image': return 'copy';
      default: return 'default';
    }
  };

  const handleCanvasMouseEnter = () => {
    // No special handling needed for eraser cursor since it's drawn on canvas
  };

  const handleCanvasMouseLeave = () => {
    // No special handling needed for eraser cursor since it's drawn on canvas
  };

  // Reset cursor when tool changes
  useEffect(() => {
    // Hide text input when switching away from text tool
    if (selectedTool !== 'text' && textInput.visible) {
      handleTextCancel();
    }
  }, [selectedTool]);

  const getResizeHandle = (x, y, element) => {
    const bounds = getElementBounds(element);
    if (!bounds) return null;

    const handleSize = 8 / scale;
    const tolerance = handleSize;
    
    const handles = [
      { id: 'tl', x: bounds.x, y: bounds.y }, // Top-left
      { id: 'tr', x: bounds.x + bounds.width, y: bounds.y }, // Top-right
      { id: 'bl', x: bounds.x, y: bounds.y + bounds.height }, // Bottom-left
      { id: 'br', x: bounds.x + bounds.width, y: bounds.y + bounds.height }, // Bottom-right
      { id: 'tc', x: bounds.x + bounds.width/2, y: bounds.y }, // Top-center
      { id: 'bc', x: bounds.x + bounds.width/2, y: bounds.y + bounds.height }, // Bottom-center
      { id: 'lc', x: bounds.x, y: bounds.y + bounds.height/2 }, // Left-center
      { id: 'rc', x: bounds.x + bounds.width, y: bounds.y + bounds.height/2 }, // Right-center
    ];

    for (const handle of handles) {
      if (Math.abs(x - handle.x) < tolerance && Math.abs(y - handle.y) < tolerance) {
        return handle.id;
      }
    }
    
    return null;
  };

  // Check if coordinates are within canvas bounds
  const isWithinCanvasBounds = (coords) => {
    return coords.x >= 0 && coords.y >= 0 && 
           coords.x <= (canvasData?.width || 0) && 
           coords.y <= (canvasData?.height || 0);
  };

  const getElementBounds = (element) => {
    if (!element) return null;

    switch (element.type) {
      case 'rectangle':
        return {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height
        };
      case 'circle':
        return {
          x: element.x - element.radius,
          y: element.y - element.radius,
          width: element.radius * 2,
          height: element.radius * 2
        };
      case 'text':
        const textWidth = element.text.length * element.fontSize * 0.6;
        return {
          x: element.x,
          y: element.y,
          width: textWidth,
          height: element.fontSize
        };
      case 'image':
        return {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height
        };
      default:
        return null;
    }
  };

  if (!canvasData) {
    return (
      <div className="canvas-placeholder">
        <p>No canvas data available</p>
      </div>
    );
  }

  return (
    <div className={`canvas-wrapper ${showRuler ? 'with-rulers' : ''}`}>
      {/* Text Input Overlay */}
      {textInput.visible && (
        <div
          className="text-input-overlay"
          style={{
            left: textInput.x * scale + pan.x,
            top: textInput.y * scale + pan.y,
            fontSize: textInput.fontSize * scale,
            color: drawColor,
            transform: 'scale(1)', // Don't scale the input itself
          }}
        >
          <textarea
            className="canvas-text-input"
            value={textInput.text}
            onChange={handleTextChange}
            onKeyDown={handleTextKeyDown}
            placeholder="Type your text..."
            autoFocus
            rows={1}
            style={{
              fontSize: textInput.fontSize,
              color: drawColor,
              fontFamily: 'Arial',
            }}
          />
          <div className="text-input-controls">
            <button
              className="text-btn text-btn-primary"
              onClick={handleTextSubmit}
            >
              ✓
            </button>
            <button
              className="text-btn text-btn-secondary"
              onClick={handleTextCancel}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Rulers */}
      {showRuler && (
        <>
          <div className="ruler ruler-horizontal" style={{ left: pan.x, width: canvasData.width * scale }}>
            {Array.from({ length: Math.ceil(canvasData.width / 50) + 1 }, (_, i) => (
              <div key={i} className="ruler-tick" style={{ left: `${i * 50 * scale}px` }}>
                <span>{i * 50}</span>
              </div>
            ))}
          </div>
          <div className="ruler ruler-vertical" style={{ top: pan.y, height: canvasData.height * scale }}>
            {Array.from({ length: Math.ceil(canvasData.height / 50) + 1 }, (_, i) => (
              <div key={i} className="ruler-tick" style={{ top: `${i * 50 * scale}px` }}>
                <span>{i * 50}</span>
              </div>
            ))}
          </div>
        </>
      )}
      
      <div className="canvas-toolbar">
        <div className="canvas-info">
          <span>Zoom: {Math.round(zoomLevel)}%</span>
          <span>Scale: {Math.round(scale * 100)}%</span>
          <span>Size: {canvasData.width} × {canvasData.height}</span>
          {showGrid && <span className="grid-indicator">Grid: ON</span>}
          {previewElement && previewElement.type === 'rectangle' && (
            <span className="preview-info">
              Preview: {Math.round(previewElement.width)} × {Math.round(previewElement.height)}
            </span>
          )}
          {previewElement && previewElement.type === 'circle' && (
            <span className="preview-info">
              Preview: R={Math.round(previewElement.radius)}
            </span>
          )}
        </div>
        
        {selectedElement && (
          <div className="selected-element-info">
            <FiMove />
            <span>{selectedElement.type}</span>
            <button
              className="delete-btn"
              onClick={() => onElementSelect(null)}
              title="Deselect"
            >
              ✕
            </button>
          </div>
        )}
      </div>
      
      <div className="canvas-container">
        <div 
          className={`canvas-scroll-area ${isDrawing ? (selectedTool === 'eraser' ? 'erasing' : 'drawing') : ''} ${selectedTool === 'eraser' ? 'eraser-active' : ''}`}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            padding: '20px'
          }}
        >
          <canvas
            ref={canvasRef}
            className={`canvas ${selectedTool}`}
            style={{
              cursor: getCurrentCursor(),
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              border: '1px solid #ddd',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              backgroundColor: canvasData.backgroundColor || '#ffffff',
              maxWidth: '90vw',
              maxHeight: '70vh'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseEnter={handleCanvasMouseEnter}
            onMouseLeave={handleCanvasMouseLeave}
            onClick={handleCanvasClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Canvas;
