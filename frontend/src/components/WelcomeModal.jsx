import React, { useState } from 'react';
import { FiX, FiSettings } from 'react-icons/fi';
import './WelcomeModal.css';

const WelcomeModal = ({ onCreateCanvas }) => {
  const [canvasSettings, setCanvasSettings] = useState({
    width: 800,
    height: 600,
    backgroundColor: '#ffffff'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const presets = [
    { name: 'Square', width: 600, height: 600 },
    { name: 'Landscape', width: 800, height: 600 },
    { name: 'Portrait', width: 600, height: 800 },
    { name: 'HD', width: 1280, height: 720 },
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'Facebook Cover', width: 1200, height: 628 },
    { name: 'Twitter Header', width: 1500, height: 500 },
    { name: 'A4', width: 595, height: 842 }
  ];

  const handlePresetSelect = (preset) => {
    setCanvasSettings(prev => ({
      ...prev,
      width: preset.width,
      height: preset.height
    }));
  };

  const handleInputChange = (field, value) => {
    setCanvasSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateCanvas = () => {
    onCreateCanvas(
      canvasSettings.width,
      canvasSettings.height,
      canvasSettings.backgroundColor
    );
  };

  return (
    <div className="welcome-modal-overlay">
      <div className="welcome-modal">
        <div className="modal-header">
          <h1 className="modal-title">🎨 Welcome to Canvas Builder</h1>
          <p className="modal-subtitle">
            Create beautiful designs and export them as high-quality PDFs
          </p>
        </div>

        <div className="modal-content">
          <div className="canvas-setup">
            <h2 className="section-title">Create New Canvas</h2>
            
            {/* Presets */}
            <div className="presets-section">
              <h3 className="subsection-title">Quick Presets</h3>
              <div className="presets-grid">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    className="preset-btn"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <div className="preset-name">{preset.name}</div>
                    <div className="preset-dimensions">
                      {preset.width} × {preset.height}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom dimensions */}
            <div className="custom-section">
              <button
                className="advanced-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <FiSettings />
                Custom Dimensions
              </button>

              {showAdvanced && (
                <div className="custom-settings">
                  <div className="settings-row">
                    <div className="setting-group">
                      <label htmlFor="width">Width (px)</label>
                      <input
                        type="number"
                        id="width"
                        value={canvasSettings.width}
                        onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 100)}
                        min="100"
                        max="4000"
                      />
                    </div>
                    <div className="setting-group">
                      <label htmlFor="height">Height (px)</label>
                      <input
                        type="number"
                        id="height"
                        value={canvasSettings.height}
                        onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 100)}
                        min="100"
                        max="4000"
                      />
                    </div>
                  </div>
                  
                  <div className="setting-group">
                    <label htmlFor="backgroundColor">Background Color</label>
                    <div className="color-input">
                      <input
                        type="color"
                        id="backgroundColor"
                        value={canvasSettings.backgroundColor}
                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={canvasSettings.backgroundColor}
                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Current settings display */}
            <div className="current-settings">
              <h3 className="subsection-title">Canvas Preview</h3>
              <div className="settings-preview">
                <div className="preview-canvas" style={{
                  backgroundColor: canvasSettings.backgroundColor,
                  aspectRatio: `${canvasSettings.width} / ${canvasSettings.height}`
                }}>
                  <div className="preview-content">
                    {canvasSettings.width} × {canvasSettings.height}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="create-btn"
            onClick={handleCreateCanvas}
          >
            Create Canvas
          </button>
        </div>

        {/* Features showcase */}
        <div className="features-section">
          <h3 className="features-title">What you can do:</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🟨</span>
              <span>Add shapes & text</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🖼️</span>
              <span>Insert images</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <span>Customize colors</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📄</span>
              <span>Export as PDF</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Real-time preview</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">↩️</span>
              <span>Undo/Redo support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
