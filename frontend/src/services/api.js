import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for loading states
api.interceptors.request.use(
  (config) => {
    // You can add loading logic here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || 'An error occurred';
      toast.error(message);
    } else if (error.request) {
      // Request was made but no response received
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// Canvas API endpoints
export const canvasAPI = {
  // Initialize canvas
  async initCanvas(width = 800, height = 600, backgroundColor = '#ffffff') {
    const response = await api.post('/api/canvas/init', {
      width,
      height,
      backgroundColor
    });
    return response.data;
  },

  // Get canvas data
  async getCanvas(sessionId) {
    const response = await api.get(`/api/canvas/${sessionId}`);
    return response.data;
  },

  // Add rectangle
  async addRectangle(sessionId, data) {
    const response = await api.post(`/api/canvas/${sessionId}/rectangle`, data);
    return response.data;
  },

  // Add circle
  async addCircle(sessionId, data) {
    const response = await api.post(`/api/canvas/${sessionId}/circle`, data);
    return response.data;
  },

  // Add text
  async addText(sessionId, data) {
    const response = await api.post(`/api/canvas/${sessionId}/text`, data);
    return response.data;
  },

  // Add image from URL
  async addImageUrl(sessionId, data) {
    const response = await api.post(`/api/canvas/${sessionId}/image-url`, data);
    return response.data;
  },

  // Add image from file upload
  async addImageUpload(sessionId, data) {
    const formData = new FormData();
    formData.append('image', data.imageFile);
    formData.append('x', data.x);
    formData.append('y', data.y);
    formData.append('width', data.width);
    formData.append('height', data.height);

    const response = await api.post(`/api/canvas/${sessionId}/image-upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete element
  async deleteElement(sessionId, elementId) {
    const response = await api.delete(`/api/canvas/${sessionId}/element/${elementId}`);
    return response.data;
  },

  // Clear canvas
  async clearCanvas(sessionId) {
    const response = await api.delete(`/api/canvas/${sessionId}/clear`);
    return response.data;
  },

  // Export as PNG
  async exportPNG(canvasData) {
    const response = await api.post('/api/canvas/export/png', canvasData, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export as PDF
  async exportPDF(canvasData, compress = true) {
    const response = await api.post('/api/canvas/export/pdf', canvasData, {
      params: { compress },
      responseType: 'blob',
    });
    return response.data;
  },

  // Get canvas metadata
  async getMetadata(sessionId) {
    const response = await api.get(`/api/canvas/${sessionId}/metadata`);
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },

  // Generic add element
  async addElement(sessionId, type, data) {
    const response = await api.post(`/api/canvas/${sessionId}/element`, {
      type,
      ...data
    });
    return response.data;
  },

  // Update element
  async updateElement(sessionId, elementId, elementData) {
    const response = await api.put(`/api/canvas/${sessionId}/element/${elementId}`, elementData);
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Check if API is available
  async checkConnection() {
    try {
      await canvasAPI.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Validate image file
  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    if (!validTypes.includes(file.type)) {
      return { isValid: false, error: 'Invalid file type. Please upload a valid image file.' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'File too large. Maximum size is 10MB.' };
    }

    return { isValid: true };
  },

  // Validate URL
  validateImageUrl(url) {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  },

  // Generate random color
  generateRandomColor() {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Download file
  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

export default api;
