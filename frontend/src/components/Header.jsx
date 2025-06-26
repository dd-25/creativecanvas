import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  FiDownload, 
  FiImage, 
  FiRotateCcw, 
  FiRotateCw, 
  FiPlus,
  FiSave,
  FiFileText,
  FiCopy,
  FiLayers,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiGrid,
  FiEye,
  FiEyeOff,
  FiEdit3,
  FiSquare
} from 'react-icons/fi';
import './Header.css';

const Header = ({ 
  canvasData, 
  onExportPNG, 
  onExportPDF, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo,
  onNewCanvas,
  onDuplicateCanvas,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onToggleGrid,
  onToggleRuler,
  showGrid,
  showRuler,
  zoomLevel = 100,
  selectedTool,
  onToolSelect,
  drawColor = '#000000',
  onDrawColorChange,
  brushSize = 3,
  onBrushSizeChange
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const drawingColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
  ];

  // Track unsaved changes
  useEffect(() => {
    if (canvasData && lastSavedState) {
      const hasChanges = JSON.stringify(canvasData) !== JSON.stringify(lastSavedState);
      setHasUnsavedChanges(hasChanges);
    }
  }, [canvasData, lastSavedState]);

  // Handle new canvas with save confirmation
  const handleNewCanvas = () => {
    if (hasUnsavedChanges && canvasData?.elements?.length > 0) {
      setShowSaveDialog(true);
    } else {
      onNewCanvas();
    }
  };

  // Handle save operations
  const handleSave = async (format) => {
    try {
      toast.loading(`Saving as ${format.toUpperCase()}...`, { id: 'save' });
      
      if (format === 'png') {
        await onExportPNG();
        toast.success('Canvas saved as PNG!', { id: 'save' });
      } else if (format === 'pdf') {
        await onExportPDF();
        toast.success('Canvas saved as PDF!', { id: 'save' });
      }
      setLastSavedState(canvasData);
      setHasUnsavedChanges(false);
      setShowSaveDialog(false);
      onNewCanvas();
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save canvas', { id: 'save' });
    }
  };

  // Handle discard changes
  const handleDiscard = () => {
    setShowSaveDialog(false);
    setHasUnsavedChanges(false);
    onNewCanvas();
    toast.success('Changes discarded, new canvas created');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            onExportPNG();
            break;
          case 'p':
            e.preventDefault();
            onExportPDF();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              onRedo();
            } else {
              onUndo();
            }
            break;
          case 'n':
            e.preventDefault();
            handleNewCanvas();
            break;
          case 'd':
            e.preventDefault();
            break;
          case '=':
          case '+':
            e.preventDefault();
            onZoomIn && onZoomIn();
            break;
          case '-':
            e.preventDefault();
            onZoomOut && onZoomOut();
            break;
          case '0':
            e.preventDefault();
            onFitToScreen && onFitToScreen();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [onExportPNG, onExportPDF, onUndo, onRedo, onNewCanvas, onDuplicateCanvas, onZoomIn, onZoomOut, onFitToScreen]);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showColorPicker && !e.target.closest('.color-picker-container')) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showColorPicker]);

  return (
    <>
      <header className="header">
        <div className="header-content">
          {/* Logo and title */}
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">🎨</div>
              <h1 className="logo-text">Canvas Builder</h1>
            </div>
            
            {canvasData && (
              <div className="canvas-info">
                <span className="canvas-dimensions">
                  {canvasData.width} × {canvasData.height}
                </span>
                <span className="element-count">
                  {canvasData.elements.length} element{canvasData.elements.length !== 1 ? 's' : ''}
                </span>
                {hasUnsavedChanges && (
                  <span className="unsaved-indicator" title="Unsaved changes">
                    ● Unsaved
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="header-right">
            {/* Zoom Controls - moved to a prominent position */}
            <div className="button-group zoom-section">
              <button
                className="header-btn zoom-btn"
                onClick={onZoomOut}
                disabled={zoomLevel <= 25}
                title="Zoom Out (Ctrl+-)"
              >
                <FiZoomOut />
              </button>
              <span className="zoom-level">{Math.round(zoomLevel)}%</span>
              <button
                className="header-btn zoom-btn"
                onClick={onZoomIn}
                disabled={zoomLevel >= 500}
                title="Zoom In (Ctrl++)"
              >
                <FiZoomIn />
              </button>
              <button
                className="header-btn"
                onClick={onFitToScreen}
                title="Fit to Screen (Ctrl+0)"
              >
                <FiMaximize2 />
              </button>
            </div>

            {/* Drawing Tools */}
            <div className="button-group drawing-tools">
              <button
                className={`header-btn ${selectedTool === 'draw' ? 'active' : ''}`}
                onClick={() => onToolSelect('draw')}
                title="Draw (Pencil)"
              >
                <FiEdit3 />
                <span className="btn-text">Draw</span>
              </button>
              
              <button
                className={`header-btn ${selectedTool === 'eraser' ? 'active' : ''}`}
                onClick={() => onToolSelect('eraser')}
                title="Eraser"
              >
                <FiSquare />
                <span className="btn-text">Erase</span>
              </button>
              
              <div className="color-picker-container">
                <button
                  className="color-btn"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  style={{ backgroundColor: drawColor }}
                  title="Choose Color"
                />
                {showColorPicker && (
                  <div className="color-palette">
                    {drawingColors.map(color => (
                      <button
                        key={color}
                        className={`color-option ${drawColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          onDrawColorChange(color);
                          setShowColorPicker(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="brush-size-container">
                <label className="brush-size-label">Size:</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
                  className="brush-size-slider"
                />
                <span className="brush-size-display">{brushSize}px</span>
              </div>
            </div>

            {/* View Controls */}
            <div className="button-group view-controls">
              <button
                className={`header-btn ${showGrid ? 'active' : ''}`}
                onClick={onToggleGrid}
                title="Toggle Grid"
              >
                <FiGrid />
                <span className="btn-text">Grid</span>
              </button>
              
              <button
                className={`header-btn ${showRuler ? 'active' : ''}`}
                onClick={onToggleRuler}
                title="Toggle Ruler"
              >
                <FiLayers />
                <span className="btn-text">Ruler</span>
              </button>
            </div>

            {/* Undo/Redo */}
            <div className="button-group">
              <button
                className="header-btn"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                <FiRotateCcw />
              </button>
              <button
                className="header-btn"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
              >
                <FiRotateCw />
              </button>
            </div>

            {/* Canvas Actions */}
            <div className="button-group">
              <button
                className="header-btn"
                onClick={handleNewCanvas}
                title="New Canvas (Ctrl+N)"
              >
                <FiPlus />
                <span className="btn-text">New</span>
              </button>
            </div>

            {/* Export buttons */}
            <div className="button-group">
              <button
                className="header-btn export-btn"
                onClick={onExportPNG}
                title="Export as PNG (Ctrl+S)"
              >
                <FiImage />
                <span className="btn-text">PNG</span>
              </button>
              <button
                className="header-btn export-btn primary"
                onClick={onExportPDF}
                title="Export as PDF (Ctrl+P)"
              >
                <FiFileText />
                <span className="btn-text">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Save Confirmation Dialog */}
      {showSaveDialog && (
        <div className="save-dialog-overlay">
          <div className="save-dialog">
            <div className="save-dialog-header">
              <h3>Save Changes?</h3>
              <p>You have unsaved changes. Would you like to save them before creating a new canvas?</p>
            </div>
            
            <div className="save-dialog-actions">
              <div className="save-options">
                <button
                  className="dialog-btn save-png"
                  onClick={() => handleSave('png')}
                >
                  <FiImage />
                  Save as PNG
                </button>
                <button
                  className="dialog-btn save-pdf"
                  onClick={() => handleSave('pdf')}
                >
                  <FiFileText />
                  Save as PDF
                </button>
              </div>
              
              <div className="discard-options">
                <button
                  className="dialog-btn discard"
                  onClick={handleDiscard}
                >
                  Discard Changes
                </button>
                <button
                  className="dialog-btn cancel"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
