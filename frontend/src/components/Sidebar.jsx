import React, { useState, useEffect } from 'react';
import { 
  FiMousePointer, 
  FiSquare, 
  FiCircle, 
  FiType, 
  FiImage, 
  FiTrash2,
  FiRotateCcw,
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiEdit3,
  FiUpload,
  FiLink
} from 'react-icons/fi';
import ElementForm from './ElementForm';
import ElementProperties from './ElementProperties';
import './Sidebar.css';

const TOOLS = [
  { id: 'draw', icon: FiEdit3, label: 'Draw', shortcut: 'D' },
  { id: 'eraser', icon: FiSquare, label: 'Eraser', shortcut: 'E' },
  { id: 'rectangle', icon: FiSquare, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: FiCircle, label: 'Circle', shortcut: 'C' },
  { id: 'text', icon: FiType, label: 'Text', shortcut: 'T' },
  { id: 'image', icon: FiImage, label: 'Image', shortcut: 'I' },
];

const Sidebar = ({ 
  selectedTool, 
  onToolSelect, 
  onAddElement, 
  selectedElement, 
  onDeleteElement, 
  onClearCanvas,
  sessionId,
  onImageUpload,
  onImageUrl
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('tools');
  const [imageUrl, setImageUrl] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState('file'); // 'file' or 'url'

  // Reset active section when tool changes
  useEffect(() => {
    // Always show tool options for active tools
    setActiveSection('tool-options');
    
    // Clear image URL when switching away from image tool
    if (selectedTool !== 'image') {
      setImageUrl('');
    }
  }, [selectedTool]);

  const handleToolSelect = (toolId) => {
    onToolSelect(toolId);
    
    // Always show tool options for active tools
    setActiveSection('tool-options');
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim() && onImageUrl) {
      onImageUrl(imageUrl.trim());
      setImageUrl('');
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Tools</h2>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="sidebar-content">
          {/* Tools Section */}
          <section className="sidebar-section">
            <div className="section-header">
              <h3 className="section-title">Tools</h3>
            </div>
            <div className="tools-grid">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    className={`tool-btn ${selectedTool === tool.id ? 'active' : ''}`}
                    onClick={() => handleToolSelect(tool.id)}
                    title={`${tool.label} (${tool.shortcut})`}
                  >
                    <Icon />
                    <span className="tool-label">{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Tool Options Section - Show for all tools except select */}
          {selectedTool !== 'select' && (
            <section className="sidebar-section">
              <button
                className="section-header clickable"
                onClick={() => toggleSection('tool-options')}
              >
                <h3 className="section-title">
                  {selectedTool === 'image' ? 'Image Upload' : 
                   selectedTool === 'draw' ? 'Drawing Options' :
                   selectedTool === 'eraser' ? 'Eraser Options' :
                   `${TOOLS.find(t => t.id === selectedTool)?.label || 'Tool'} Options`}
                </h3>
                {activeSection === 'tool-options' ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              
              {activeSection === 'tool-options' && (
                <div className="section-content">
                  {selectedTool === 'image' && (
                    <div className="image-upload-section">
                      {/* Toggle between File Upload and URL */}
                      <div className="image-upload-toggle">
                        <button 
                          className={`toggle-btn ${imageUploadMode === 'file' ? 'active' : ''}`}
                          onClick={() => setImageUploadMode('file')}
                        >
                          File Upload
                        </button>
                        <button 
                          className={`toggle-btn ${imageUploadMode === 'url' ? 'active' : ''}`}
                          onClick={() => setImageUploadMode('url')}
                        >
                          URL
                        </button>
                      </div>

                      {imageUploadMode === 'file' ? (
                        <div className="upload-method">
                          <h4>Upload from File</h4>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="file-input"
                          />
                        </div>
                      ) : (
                        <div className="upload-method">
                          <h4>Upload from URL</h4>
                          <div className="url-input-group">
                            <input
                              type="url"
                              placeholder="Enter image URL..."
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              className="url-input"
                              onKeyPress={(e) => e.key === 'Enter' && handleImageUrlSubmit()}
                            />
                            <button
                              onClick={handleImageUrlSubmit}
                              disabled={!imageUrl.trim()}
                              className="url-submit-btn"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {(selectedTool === 'draw' || selectedTool === 'eraser') && (
                    <div className="drawing-options">
                      <p className="tool-description">
                        {selectedTool === 'draw' 
                          ? 'Draw freehand on the canvas. Use the brush size and color controls in the header.'
                          : 'Erase drawing elements by clicking on them or drawing over them.'
                        }
                      </p>
                    </div>
                  )}
                  
                  {(selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'text') && (
                    <ElementForm
                      elementType={selectedTool}
                      onAddElement={onAddElement}
                      sessionId={sessionId}
                    />
                  )}
                </div>
              )}
            </section>
          )}

          {/* Element Properties Section */}
          {selectedElement && (
            <section className="sidebar-section">
              <button
                className="section-header clickable"
                onClick={() => toggleSection('properties')}
              >
                <h3 className="section-title">Properties</h3>
                {activeSection === 'properties' ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              
              {activeSection === 'properties' && (
                <div className="section-content">
                  <ElementProperties
                    element={selectedElement}
                    onDeleteElement={onDeleteElement}
                  />
                </div>
              )}
            </section>
          )}

          {/* Actions Section */}
          <section className="sidebar-section">
            <button
              className="section-header clickable"
              onClick={() => toggleSection('actions')}
            >
              <h3 className="section-title">Actions</h3>
              {activeSection === 'actions' ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            
            {activeSection === 'actions' && (
              <div className="section-content">
                <div className="action-buttons">
                  <button
                    className="action-btn danger"
                    onClick={onClearCanvas}
                    title="Clear all elements"
                  >
                    <FiRotateCcw />
                    Clear Canvas
                  </button>
                  
                  {selectedElement && (
                    <button
                      className="action-btn danger"
                      onClick={() => onDeleteElement(selectedElement.id)}
                      title="Delete selected element"
                    >
                      <FiTrash2 />
                      Delete Element
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Help Section */}
          <section className="sidebar-section help-section">
            <div className="section-header">
              <h3 className="section-title">Shortcuts</h3>
            </div>
            <div className="shortcuts-list">
              <div className="shortcut-item">
                <span className="shortcut-key">Ctrl+Z</span>
                <span className="shortcut-desc">Undo</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Ctrl+Y</span>
                <span className="shortcut-desc">Redo</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Ctrl+S</span>
                <span className="shortcut-desc">Export PNG</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Ctrl+P</span>
                <span className="shortcut-desc">Export PDF</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Del</span>
                <span className="shortcut-desc">Delete Element</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
