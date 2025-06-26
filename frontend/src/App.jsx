import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import LoadingSpinner from './components/LoadingSpinner';
import WelcomeModal from './components/WelcomeModal';
import ErrorBoundary from './components/ErrorBoundary';
import EnvDebug from './components/EnvDebug';
import { canvasAPI, apiUtils } from './services/api';
import './App.css';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [canvasData, setCanvasData] = useState(null);
  const [selectedTool, setSelectedTool] = useState('draw');
  const [selectedElement, setSelectedElement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // New state for enhanced features
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [drawColor, setDrawColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);

  // Initialize canvas
  const initializeCanvas = async (width = 1200, height = 800, backgroundColor = '#ffffff') => {
    setIsLoading(true);
    try {
      const response = await canvasAPI.initCanvas(width, height, backgroundColor);
      setSessionId(response.sessionId);
      setCanvasData(response.canvas);
      setHistory([response.canvas]);
      setHistoryIndex(0);
      setShowWelcome(false);
    } catch (error) {
      console.error('Failed to initialize canvas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load canvas data
  const loadCanvasData = async () => {
    if (!sessionId) return;
    
    try {
      const response = await canvasAPI.getCanvas(sessionId);
      setCanvasData(response.canvas);
    } catch (error) {
      console.error('Failed to load canvas data:', error);
    }
  };

  // Add element to canvas
  const addElement = async (elementData) => {
    if (!sessionId) return;

    // Don't show loading for drawing elements to avoid performance issues
    if (elementData.type !== 'drawing') {
      setIsLoading(true);
    }
    
    try {
      let response;
      
      switch (elementData.type) {
        case 'rectangle':
          response = await canvasAPI.addRectangle(sessionId, elementData);
          break;
        case 'circle':
          response = await canvasAPI.addCircle(sessionId, elementData);
          break;
        case 'text':
          response = await canvasAPI.addText(sessionId, elementData);
          break;
        case 'image':
          if (elementData.imageFile) {
            response = await canvasAPI.addImageUpload(sessionId, elementData);
          } else {
            response = await canvasAPI.addImageUrl(sessionId, elementData);
          }
          break;
        case 'drawing':
          response = await canvasAPI.addElement(sessionId, elementData.type, elementData);
          // For drawings, reload data in background without loading indicator
          loadCanvasData();
          return; // Early return to avoid the reload below
        default:
          throw new Error(`Unknown element type: ${elementData.type}`);
      }

      // Reload canvas data to get updated state
      await loadCanvasData();
      
      // Update history
      const updatedCanvas = await canvasAPI.getCanvas(sessionId);
      addToHistory(updatedCanvas.canvas);
      
    } catch (error) {
      console.error('Failed to add element:', error);
      throw error;
    } finally {
      if (elementData.type !== 'drawing') {
        setIsLoading(false);
      }
    }
  };

  // Delete element
  const deleteElement = async (elementId) => {
    if (!sessionId) return;

    // Don't show loading for drawing elements to keep eraser responsive
    const element = canvasData?.elements?.find(el => el.id === elementId);
    const isDrawingElement = element?.type === 'drawing';
    
    // Immediately update UI for drawing elements to prevent double-erase
    if (isDrawingElement) {
      setCanvasData(prev => ({
        ...prev,
        elements: prev.elements.filter(el => el.id !== elementId)
      }));
    } else {
      setIsLoading(true);
    }
    
    try {
      await canvasAPI.deleteElement(sessionId, elementId);
      
      if (!isDrawingElement) {
        await loadCanvasData();
        // Update history
        const updatedCanvas = await canvasAPI.getCanvas(sessionId);
        addToHistory(updatedCanvas.canvas);
      } else {
        // For drawing elements, just sync in background
        setTimeout(async () => {
          try {
            const updatedCanvas = await canvasAPI.getCanvas(sessionId);
            setCanvasData(updatedCanvas.canvas);
            addToHistory(updatedCanvas.canvas);
          } catch (error) {
            console.error('Background sync failed:', error);
          }
        }, 100);
      }
      
      setSelectedElement(null);
    } catch (error) {
      console.error('Failed to delete element:', error);
      toast.error('Failed to delete element');
      
      // Revert UI update if API call failed
      if (isDrawingElement && element) {
        setCanvasData(prev => ({
          ...prev,
          elements: [...prev.elements, element]
        }));
      }
    } finally {
      if (!isDrawingElement) {
        setIsLoading(false);
      }
    }
  };

  // Clear canvas
  const clearCanvas = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      await canvasAPI.clearCanvas(sessionId);
      await loadCanvasData();
      
      // Update history
      const updatedCanvas = await canvasAPI.getCanvas(sessionId);
      addToHistory(updatedCanvas.canvas);
      
      setSelectedElement(null);
    } catch (error) {
      console.error('Failed to clear canvas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Export functions
  const exportAsPNG = async () => {
    if (!canvasData) return;

    try {
      setIsLoading(true);
      toast.loading('Exporting as PNG...', { id: 'export-png' });
      
      const blob = await canvasAPI.exportPNG(canvasData);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `canvas-export.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PNG exported successfully!', { id: 'export-png' });
    } catch (error) {
      console.error('Failed to export PNG:', error);
      toast.error('Failed to export PNG', { id: 'export-png' });
    } finally {
      setIsLoading(false);
    }
  };

  const exportAsPDF = async () => {
    if (!canvasData) return;

    try {
      setIsLoading(true);
      toast.loading('Exporting as PDF...', { id: 'export-pdf' });
      
      const blob = await canvasAPI.exportPDF(canvasData);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `canvas-export.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF exported successfully!', { id: 'export-pdf' });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('Failed to export PDF', { id: 'export-pdf' });
    } finally {
      setIsLoading(false);
    }
  };

  // History management
  const addToHistory = (newCanvasData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newCanvasData);
    
    // Limit history to 50 items
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCanvasData(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCanvasData(history[historyIndex + 1]);
    }
  };

  // Enhanced canvas functions
  const duplicateCanvas = async () => {
    if (!canvasData) return;
    
    setIsLoading(true);
    toast.loading('Duplicating canvas...', { id: 'duplicate' });
    
    try {
      // Create a new canvas with the same settings
      const response = await canvasAPI.initCanvas(
        canvasData.width, 
        canvasData.height, 
        canvasData.backgroundColor || '#ffffff'
      );
      
      // Copy all elements to the new canvas
      for (const element of canvasData.elements) {
        const elementCopy = {
          ...element,
          x: element.x + 20, // Offset slightly
          y: element.y + 20
        };
        
        // Remove properties that shouldn't be copied
        delete elementCopy.id;
        delete elementCopy.createdAt;
        delete elementCopy.zIndex;
        
        await canvasAPI.addElement(response.sessionId, element.type, elementCopy);
      }
      
      setSessionId(response.sessionId);
      const updatedCanvas = await canvasAPI.getCanvas(response.sessionId);
      setCanvasData(updatedCanvas.canvas);
      setHistory([updatedCanvas.canvas]);
      setHistoryIndex(0);
      
      toast.success('Canvas duplicated successfully!', { id: 'duplicate' });
    } catch (error) {
      console.error('Failed to duplicate canvas:', error);
      toast.error('Failed to duplicate canvas', { id: 'duplicate' });
    } finally {
      setIsLoading(false);
    }
  };

  // Zoom functions
  const zoomIn = () => {
    const newLevel = Math.min(zoomLevel + 25, 500);
    setZoomLevel(newLevel);
    toast.success(`Zoomed to ${newLevel}%`, { duration: 1000 });
  };

  const zoomOut = () => {
    const newLevel = Math.max(zoomLevel - 25, 25);
    setZoomLevel(newLevel);
    toast.success(`Zoomed to ${newLevel}%`, { duration: 1000 });
  };

  const fitToScreen = () => {
    setZoomLevel(100);
    toast.success('Zoom reset to 100%', { duration: 1000 });
  };

  // View toggles
  const toggleGrid = () => {
    const newState = !showGrid;
    setShowGrid(newState);
    toast.success(`Grid ${newState ? 'enabled' : 'disabled'}`, { duration: 1000 });
  };

  const toggleRuler = () => {
    const newState = !showRuler;
    setShowRuler(newState);
    toast.success(`Ruler ${newState ? 'enabled' : 'disabled'}`, { duration: 1000 });
  };

  // New canvas function
  const createNewCanvas = () => {
    setShowWelcome(true);
    setZoomLevel(100);
    setShowGrid(false);
    setShowRuler(false);
    toast.success('Ready to create new canvas');
  };

  // Handle tool selection with special case for image tool
  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
  };

  // Handle image URL
  const handleImageUrl = async (url) => {
    if (!sessionId) return;

    try {
      // Validate URL
      const validation = apiUtils.validateImageUrl(url);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      setIsLoading(true);
      toast.loading('Loading image from URL...', { id: 'image-url' });

      // Create image element to get dimensions
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          // Calculate placement position (center of canvas)
          const canvasCenter = {
            x: canvasData ? canvasData.width / 2 : 400,
            y: canvasData ? canvasData.height / 2 : 300
          };

          // Calculate size (maintain aspect ratio, max 300px)
          const maxSize = 300;
          let width = img.width;
          let height = img.height;
          
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = width * ratio;
            height = height * ratio;
          }

          // Create element data for URL
          const elementData = {
            type: 'image',
            x: canvasCenter.x - width / 2,
            y: canvasCenter.y - height / 2,
            width,
            height,
            imageUrl: url
          };

          // Add image element
          await addElement(elementData);
          toast.success('Image loaded successfully!', { id: 'image-url' });
          
          // Switch back to select tool
          setSelectedTool('select');
          
        } catch (error) {
          console.error('Image URL loading failed:', error);
          toast.error('Failed to load image from URL', { id: 'image-url' });
        } finally {
          setIsLoading(false);
        }
      };
      
      img.onerror = () => {
        toast.error('Invalid image URL or unable to load image', { id: 'image-url' });
        setIsLoading(false);
      };
      
      img.src = url;
      
    } catch (error) {
      console.error('Image URL loading failed:', error);
      toast.error('Failed to load image from URL');
      setIsLoading(false);
    }
  };

  // Handle image upload and placement
  const handleImageUpload = async (file) => {
    if (!sessionId) {
      toast.error('No active canvas session');
      return;
    }

    try {
      // Validate file
      const validation = apiUtils.validateImageFile(file);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      setIsLoading(true);
      toast.loading('Uploading image...', { id: 'image-upload' });

      // Convert file to base64 for preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;
        
        // Create image element to get dimensions
        const img = new Image();
        img.onload = async () => {
          try {
            // Calculate placement position (center of canvas)
            const canvasCenter = {
              x: canvasData ? canvasData.width / 2 : 400,
              y: canvasData ? canvasData.height / 2 : 300
            };

            // Calculate size (maintain aspect ratio, max 300px)
            const maxSize = 300;
            let width = img.width;
            let height = img.height;
            
            if (width > maxSize || height > maxSize) {
              const ratio = Math.min(maxSize / width, maxSize / height);
              width = width * ratio;
              height = height * ratio;
            }

            // Add image element via API
            const response = await canvasAPI.addImageUpload(sessionId, {
              x: Math.round(canvasCenter.x - width / 2),
              y: Math.round(canvasCenter.y - height / 2),
              width: Math.round(width),
              height: Math.round(height),
              imageFile: file
            });
            
            console.log('Image upload response:', response);
            toast.success('Image uploaded successfully!', { id: 'image-upload' });
            
            // Reload canvas data to show the uploaded image
            await loadCanvasData();
            
            // Switch back to draw tool
            setSelectedTool('draw');
            
          } catch (error) {
            console.error('Image upload failed:', error);
            toast.error('Failed to upload image', { id: 'image-upload' });
          } finally {
            setIsLoading(false);
          }
        };
        
        img.onerror = () => {
          toast.error('Invalid image file', { id: 'image-upload' });
          setIsLoading(false);
        };
        
        img.src = imageData;
      };
      
      reader.onerror = () => {
        toast.error('Failed to read image file', { id: 'image-upload' });
        setIsLoading(false);
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
      setIsLoading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            exportAsPNG();
            break;
          case 'p':
            e.preventDefault();
            exportAsPDF();
            break;
          default:
            break;
        }
      }
      
      // Delete key
      if (e.key === 'Delete' && selectedElement) {
        deleteElement(selectedElement.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, historyIndex, history]);

  return (
    <ErrorBoundary>
      <div className="app">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />

      {showWelcome && (
        <WelcomeModal onCreateCanvas={initializeCanvas} />
      )}

      {!showWelcome && (
        <>
          <Header
            canvasData={canvasData}
            onExportPNG={exportAsPNG}
            onExportPDF={exportAsPDF}
            onUndo={undo}
            onRedo={redo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onNewCanvas={createNewCanvas}
            onDuplicateCanvas={duplicateCanvas}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onFitToScreen={fitToScreen}
            onToggleGrid={toggleGrid}
            onToggleRuler={toggleRuler}
            showGrid={showGrid}
            showRuler={showRuler}
            zoomLevel={zoomLevel}
            selectedTool={selectedTool}
            onToolSelect={handleToolSelect}
            drawColor={drawColor}
            onDrawColorChange={setDrawColor}
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
          />

          <div className="app-body">
            <Sidebar
              selectedTool={selectedTool}
              onToolSelect={handleToolSelect}
              onAddElement={addElement}
              selectedElement={selectedElement}
              onDeleteElement={deleteElement}
              onClearCanvas={clearCanvas}
              sessionId={sessionId}
              onImageUpload={handleImageUpload}
              onImageUrl={handleImageUrl}
            />

            <main className="canvas-container">
              {canvasData ? (
                <Canvas
                  canvasData={canvasData}
                  selectedTool={selectedTool}
                  selectedElement={selectedElement}
                  onElementSelect={setSelectedElement}
                  onAddElement={addElement}
                  onDeleteElement={deleteElement}
                  zoomLevel={zoomLevel}
                  showGrid={showGrid}
                  showRuler={showRuler}
                  drawColor={drawColor}
                  brushSize={brushSize}
                  onCanvasChange={loadCanvasData}
                />
              ) : (
                <div className="canvas-placeholder">
                  <p>Loading canvas...</p>
                </div>
              )}
            </main>
          </div>
        </>
      )}

      {isLoading && <LoadingSpinner />}
      <EnvDebug />
      </div>
    </ErrorBoundary>
  );
}

export default App;
