import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import { FiUpload, FiLink } from 'react-icons/fi';
import { apiUtils } from '../services/api';
import toast from 'react-hot-toast';
import './ElementForm.css';

const ElementForm = ({ elementType, onAddElement, sessionId }) => {
  const [formData, setFormData] = useState(getDefaultFormData(elementType));
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [useUrl, setUseUrl] = useState(true);

  function getDefaultFormData(type) {
    const base = { x: 50, y: 50 };
    
    switch (type) {
      case 'rectangle':
        return {
          ...base,
          width: 100,
          height: 60,
          fillColor: '#3b82f6',
          strokeColor: '#1e40af',
          strokeWidth: 2
        };
      case 'circle':
        return {
          ...base,
          radius: 40,
          fillColor: '#10b981',
          strokeColor: '#059669',
          strokeWidth: 2
        };
      case 'text':
        return {
          ...base,
          text: 'Sample Text',
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#374151',
          fontWeight: 'normal'
        };
      case 'image':
        return {
          ...base,
          width: 150,
          height: 100
        };
      default:
        return base;
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColorChange = (field, color) => {
    handleInputChange(field, color.hex);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      apiUtils.validateImageFile(file);
      setImageFile(file);
      toast.success('Image file selected');
    } catch (error) {
      toast.error(error.message);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let elementData = {
        type: elementType,
        ...formData
      };

      if (elementType === 'image') {
        if (useUrl) {
          if (!imageUrl) {
            toast.error('Please enter an image URL');
            return;
          }
          if (!apiUtils.validateImageUrl(imageUrl)) {
            toast.error('Please enter a valid image URL');
            return;
          }
          elementData.imageUrl = imageUrl;
        } else {
          if (!imageFile) {
            toast.error('Please select an image file');
            return;
          }
          elementData.imageFile = imageFile;
        }
      }

      await onAddElement(elementData);
      toast.success(`${elementType.charAt(0).toUpperCase() + elementType.slice(1)} added successfully`);
      
      // Reset form
      setFormData(getDefaultFormData(elementType));
      setImageFile(null);
      setImageUrl('');
    } catch (error) {
      console.error('Error adding element:', error);
      toast.error('Failed to add element');
    }
  };

  const renderPositionFields = () => (
    <div className="form-row">
      <div className="form-group">
        <label htmlFor="x">X Position</label>
        <input
          type="number"
          id="x"
          value={formData.x}
          onChange={(e) => handleInputChange('x', parseInt(e.target.value) || 0)}
          min="0"
        />
      </div>
      <div className="form-group">
        <label htmlFor="y">Y Position</label>
        <input
          type="number"
          id="y"
          value={formData.y}
          onChange={(e) => handleInputChange('y', parseInt(e.target.value) || 0)}
          min="0"
        />
      </div>
    </div>
  );

  const renderColorField = (field, label) => (
    <div className="form-group">
      <label>{label}</label>
      <div className="color-input-group">
        <div
          className="color-preview"
          style={{ backgroundColor: formData[field] }}
          onClick={() => setShowColorPicker(showColorPicker === field ? null : field)}
        />
        <input
          type="text"
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder="#000000"
        />
      </div>
      {showColorPicker === field && (
        <div className="color-picker-popup">
          <div
            className="color-picker-overlay"
            onClick={() => setShowColorPicker(null)}
          />
          <ChromePicker
            color={formData[field]}
            onChange={(color) => handleColorChange(field, color)}
          />
        </div>
      )}
    </div>
  );

  const renderStrokeFields = () => (
    <>
      {renderColorField('strokeColor', 'Stroke Color')}
      <div className="form-group">
        <label htmlFor="strokeWidth">Stroke Width</label>
        <input
          type="number"
          id="strokeWidth"
          value={formData.strokeWidth}
          onChange={(e) => handleInputChange('strokeWidth', parseInt(e.target.value) || 0)}
          min="0"
          max="20"
        />
      </div>
    </>
  );

  const renderRectangleForm = () => (
    <>
      {renderPositionFields()}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="width">Width</label>
          <input
            type="number"
            id="width"
            value={formData.width}
            onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="height">Height</label>
          <input
            type="number"
            id="height"
            value={formData.height}
            onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
      </div>
      {renderColorField('fillColor', 'Fill Color')}
      {renderStrokeFields()}
    </>
  );

  const renderCircleForm = () => (
    <>
      {renderPositionFields()}
      <div className="form-group">
        <label htmlFor="radius">Radius</label>
        <input
          type="number"
          id="radius"
          value={formData.radius}
          onChange={(e) => handleInputChange('radius', parseInt(e.target.value) || 1)}
          min="1"
        />
      </div>
      {renderColorField('fillColor', 'Fill Color')}
      {renderStrokeFields()}
    </>
  );

  const renderTextForm = () => (
    <>
      {renderPositionFields()}
      <div className="form-group">
        <label htmlFor="text">Text Content</label>
        <textarea
          id="text"
          value={formData.text}
          onChange={(e) => handleInputChange('text', e.target.value)}
          rows="3"
          placeholder="Enter your text..."
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fontSize">Font Size</label>
          <input
            type="number"
            id="fontSize"
            value={formData.fontSize}
            onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value) || 12)}
            min="8"
            max="200"
          />
        </div>
        <div className="form-group">
          <label htmlFor="fontFamily">Font Family</label>
          <select
            id="fontFamily"
            value={formData.fontFamily}
            onChange={(e) => handleInputChange('fontFamily', e.target.value)}
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fontWeight">Font Weight</label>
          <select
            id="fontWeight"
            value={formData.fontWeight}
            onChange={(e) => handleInputChange('fontWeight', e.target.value)}
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
        {renderColorField('color', 'Text Color')}
      </div>
    </>
  );

  const renderImageForm = () => (
    <>
      {renderPositionFields()}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="width">Width</label>
          <input
            type="number"
            id="width"
            value={formData.width}
            onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="height">Height</label>
          <input
            type="number"
            id="height"
            value={formData.height}
            onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
      </div>
      
      <div className="image-source-tabs">
        <button
          type="button"
          className={`tab-btn ${useUrl ? 'active' : ''}`}
          onClick={() => setUseUrl(true)}
        >
          <FiLink />
          URL
        </button>
        <button
          type="button"
          className={`tab-btn ${!useUrl ? 'active' : ''}`}
          onClick={() => setUseUrl(false)}
        >
          <FiUpload />
          Upload
        </button>
      </div>

      {useUrl ? (
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      ) : (
        <div className="form-group">
          <label htmlFor="imageFile">Upload Image</label>
          <div className="file-upload-area">
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={handleFileUpload}
              className="file-input"
            />
            <div className="file-upload-content">
              {imageFile ? (
                <div className="file-selected">
                  <span>{imageFile.name}</span>
                  <span className="file-size">
                    ({apiUtils.formatFileSize(imageFile.size)})
                  </span>
                </div>
              ) : (
                <div className="file-placeholder">
                  <FiUpload />
                  <span>Click to select image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderFormContent = () => {
    switch (elementType) {
      case 'rectangle':
        return renderRectangleForm();
      case 'circle':
        return renderCircleForm();
      case 'text':
        return renderTextForm();
      case 'image':
        return renderImageForm();
      default:
        return <p>Unknown element type</p>;
    }
  };

  return (
    <form className="element-form" onSubmit={handleSubmit}>
      {renderFormContent()}
      <button type="submit" className="submit-btn">
        Add {elementType.charAt(0).toUpperCase() + elementType.slice(1)}
      </button>
    </form>
  );
};

export default ElementForm;
