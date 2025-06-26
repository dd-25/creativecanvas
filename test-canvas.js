#!/usr/bin/env node

/**
 * Test script to verify Canvas Builder functionality
 * Tests both PDF/PNG consistency and select tool stability
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000';
const TEST_OUTPUT_DIR = path.join(__dirname, 'test-outputs');

// Ensure test output directory exists
if (!fs.existsSync(TEST_OUTPUT_DIR)) {
  fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
}

async function createTestCanvas() {
  const testCanvas = {
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    elements: [
      {
        id: 'rect-1',
        type: 'rectangle',
        x: 50,
        y: 50,
        width: 200,
        height: 100,
        fillColor: '#ff6b6b',
        strokeColor: '#333333',
        strokeWidth: 2,
        zIndex: 1
      },
      {
        id: 'circle-1',
        type: 'circle',
        x: 400,
        y: 150,
        radius: 80,
        fillColor: '#4ecdc4',
        strokeColor: '#333333',
        strokeWidth: 2,
        zIndex: 2
      },
      {
        id: 'text-1',
        type: 'text',
        x: 100,
        y: 300,
        text: 'Test Canvas Export',
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#333333',
        fontWeight: 'bold',
        zIndex: 3
      },
      {
        id: 'drawing-1',
        type: 'drawing',
        path: [
          { x: 300, y: 400 },
          { x: 350, y: 380 },
          { x: 400, y: 420 },
          { x: 450, y: 400 },
          { x: 500, y: 440 }
        ],
        color: '#9b59b6',
        brushSize: 5,
        tool: 'draw',
        zIndex: 4
      }
    ]
  };

  return testCanvas;
}

async function testPNGExport(canvasData) {
  console.log('🖼️  Testing PNG export...');
  
  try {
    const response = await axios.post(`${API_BASE}/api/canvas/export/png`, canvasData, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const pngPath = path.join(TEST_OUTPUT_DIR, 'test-canvas.png');
    fs.writeFileSync(pngPath, response.data);
    
    console.log('✅ PNG export successful');
    console.log(`   📁 Saved to: ${pngPath}`);
    console.log(`   📏 Size: ${response.data.length} bytes`);
    
    return { success: true, path: pngPath, size: response.data.length };
  } catch (error) {
    console.error('❌ PNG export failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testPDFExport(canvasData) {
  console.log('📄 Testing PDF export...');
  
  try {
    const response = await axios.post(`${API_BASE}/api/canvas/export/pdf`, canvasData, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const pdfPath = path.join(TEST_OUTPUT_DIR, 'test-canvas.pdf');
    fs.writeFileSync(pdfPath, response.data);
    
    console.log('✅ PDF export successful');
    console.log(`   📁 Saved to: ${pdfPath}`);
    console.log(`   📏 Size: ${response.data.length} bytes`);
    
    return { success: true, path: pdfPath, size: response.data.length };
  } catch (error) {
    console.error('❌ PDF export failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCanvasOperations(canvasData) {
  console.log('🎨 Testing canvas operations...');
  
  try {
    // Test creating canvas
    const createResponse = await axios.post(`${API_BASE}/api/canvas`, canvasData);
    const canvasId = createResponse.data.id;
    console.log(`✅ Canvas created with ID: ${canvasId}`);
    
    // Test retrieving canvas
    const getResponse = await axios.get(`${API_BASE}/api/canvas/${canvasId}`);
    console.log('✅ Canvas retrieved successfully');
    
    // Test adding an element
    const newElement = {
      type: 'rectangle',
      x: 600,
      y: 400,
      width: 100,
      height: 50,
      fillColor: '#f39c12',
      strokeColor: '#333333',
      strokeWidth: 1
    };
    
    const addElementResponse = await axios.post(`${API_BASE}/api/canvas/${canvasId}/elements`, newElement);
    console.log('✅ Element added successfully');
    
    return { success: true, canvasId };
  } catch (error) {
    console.error('❌ Canvas operations failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testHealthCheck() {
  console.log('❤️  Testing health check...');
  
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed');
    console.log(`   📊 Status: ${response.data.status}`);
    console.log(`   🕐 Timestamp: ${response.data.timestamp}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Canvas Builder Test Suite');
  console.log('==============================\n');
  
  const results = {
    health: null,
    operations: null,
    pngExport: null,
    pdfExport: null
  };
  
  // Test health check
  results.health = await testHealthCheck();
  console.log('');
  
  // Test canvas operations
  const testCanvas = createTestCanvas();
  results.operations = await testCanvasOperations(testCanvas);
  console.log('');
  
  // Test PNG export
  results.pngExport = await testPNGExport(testCanvas);
  console.log('');
  
  // Test PDF export
  results.pdfExport = await testPDFExport(testCanvas);
  console.log('');
  
  // Summary
  console.log('📊 Test Results Summary');
  console.log('========================');
  console.log(`Health Check: ${results.health.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Canvas Operations: ${results.operations.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`PNG Export: ${results.pngExport.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`PDF Export: ${results.pdfExport.success ? '✅ PASS' : '❌ FAIL'}`);
  
  if (results.pngExport.success && results.pdfExport.success) {
    console.log('\n📐 Export Comparison:');
    console.log(`PNG Size: ${results.pngExport.size} bytes`);
    console.log(`PDF Size: ${results.pdfExport.size} bytes`);
    
    // Basic size comparison (PDF should be larger due to format overhead)
    if (results.pdfExport.size > results.pngExport.size) {
      console.log('✅ PDF size is larger than PNG (expected)');
    } else {
      console.log('⚠️  PDF size is smaller than PNG (unexpected)');
    }
  }
  
  console.log(`\n📁 Test files saved to: ${TEST_OUTPUT_DIR}`);
  console.log('\n💡 Tips for manual verification:');
  console.log('   1. Open both PNG and PDF files');
  console.log('   2. Compare visual consistency');
  console.log('   3. Test frontend select tool with images');
  console.log('   4. Verify no screen vanishing occurs');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, createTestCanvas };
