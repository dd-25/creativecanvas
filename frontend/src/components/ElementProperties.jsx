import React from 'react';
import { FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import './ElementProperties.css';

const ElementProperties = ({ element, onDeleteElement }) => {
  if (!element) {
    return (
      <div className="element-properties">
        <p className="no-selection">No element selected</p>
      </div>
    );
  }

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string' && value.length > 20) {
      return value.substring(0, 20) + '...';
    }
    return value;
  };

  const renderProperty = (label, value, unit = '') => (
    <div className="property-row">
      <span className="property-label">{label}:</span>
      <span className="property-value">
        {formatValue(value)}{unit}
      </span>
    </div>
  );

  const renderColorProperty = (label, color) => (
    <div className="property-row">
      <span className="property-label">{label}:</span>
      <div className="color-property">
        <div
          className="color-swatch"
          style={{ backgroundColor: color }}
        />
        <span className="property-value">{color}</span>
      </div>
    </div>
  );

  const renderElementSpecificProperties = () => {
    switch (element.type) {
      case 'rectangle':
        return (
          <>
            {renderProperty('Width', element.width, 'px')}
            {renderProperty('Height', element.height, 'px')}
            {renderColorProperty('Fill Color', element.fillColor)}
            {element.strokeColor && renderColorProperty('Stroke Color', element.strokeColor)}
            {element.strokeWidth > 0 && renderProperty('Stroke Width', element.strokeWidth, 'px')}
          </>
        );
      
      case 'circle':
        return (
          <>
            {renderProperty('Radius', element.radius, 'px')}
            {renderColorProperty('Fill Color', element.fillColor)}
            {element.strokeColor && renderColorProperty('Stroke Color', element.strokeColor)}
            {element.strokeWidth > 0 && renderProperty('Stroke Width', element.strokeWidth, 'px')}
          </>
        );
      
      case 'text':
        return (
          <>
            {renderProperty('Text', element.text)}
            {renderProperty('Font Size', element.fontSize, 'px')}
            {renderProperty('Font Family', element.fontFamily)}
            {renderProperty('Font Weight', element.fontWeight)}
            {renderColorProperty('Color', element.color)}
          </>
        );
      
      case 'image':
        return (
          <>
            {renderProperty('Width', element.width, 'px')}
            {renderProperty('Height', element.height, 'px')}
            {element.imageUrl && renderProperty('URL', element.imageUrl)}
            {element.originalName && renderProperty('File', element.originalName)}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="element-properties">
      <div className="element-header">
        <div className="element-type">
          <span className="type-badge">{element.type}</span>
          <span className="element-id">#{element.id.slice(-8)}</span>
        </div>
      </div>

      <div className="properties-list">
        <div className="property-section">
          <h4 className="section-title">Position</h4>
          {renderProperty('X', element.x, 'px')}
          {renderProperty('Y', element.y, 'px')}
          {renderProperty('Z-Index', element.zIndex)}
        </div>

        <div className="property-section">
          <h4 className="section-title">Properties</h4>
          {renderElementSpecificProperties()}
        </div>

        <div className="property-section">
          <h4 className="section-title">Metadata</h4>
          {renderProperty('Created', new Date(element.createdAt).toLocaleString())}
        </div>
      </div>

      <div className="element-actions">
        <button
          className="action-btn danger"
          onClick={() => onDeleteElement(element.id)}
          title="Delete element"
        >
          <FiTrash2 />
          Delete Element
        </button>
      </div>
    </div>
  );
};

export default ElementProperties;
