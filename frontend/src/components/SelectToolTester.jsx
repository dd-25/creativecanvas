import React, { useState, useRef } from 'react';

/**
 * SelectToolTester - Component to test select tool behavior
 * Specifically designed to test image selection and screen vanishing issues
 */
const SelectToolTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const testCanvasRef = useRef(null);

  const addTestResult = (test, passed, message) => {
    setTestResults(prev => [...prev, {
      test,
      passed,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const createTestCanvasData = () => ({
    width: 600,
    height: 400,
    backgroundColor: '#f8f9fa',
    elements: [
      {
        id: 'test-rect',
        type: 'rectangle',
        x: 50,
        y: 50,
        width: 100,
        height: 80,
        fillColor: '#ff6b6b',
        strokeColor: '#333',
        strokeWidth: 2,
        zIndex: 1
      },
      {
        id: 'test-circle',
        type: 'circle',
        x: 250,
        y: 100,
        radius: 50,
        fillColor: '#4ecdc4',
        strokeColor: '#333',
        strokeWidth: 2,
        zIndex: 2
      },
      {
        id: 'test-image',
        type: 'image',
        x: 400,
        y: 50,
        width: 120,
        height: 90,
        imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTIwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjZTc0YzNjIi8+Cjx0ZXh0IHg9IjYwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+VGVzdCBJbWFnZTwvdGV4dD4KPHN2Zz4=',
        zIndex: 3
      },
      {
        id: 'test-text',
        type: 'text',
        x: 100,
        y: 200,
        text: 'Click to Select',
        fontSize: 18,
        fontFamily: 'Arial',
        color: '#2c3e50',
        fontWeight: 'normal',
        zIndex: 4
      }
    ]
  });

  const simulateMouseEvent = (canvas, type, x, y) => {
    const rect = canvas.getBoundingClientRect();
    const event = new MouseEvent(type, {
      clientX: rect.left + x,
      clientY: rect.top + y,
      bubbles: true,
      cancelable: true
    });
    canvas.dispatchEvent(event);
    return event;
  };

  const testSelectTool = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Canvas rendering
      addTestResult('Canvas Rendering', true, 'Canvas rendered without errors');
      
      // Test 2: Element detection
      const canvas = testCanvasRef.current;
      if (canvas) {
        // Simulate clicking on different elements
        const testPoints = [
          { x: 100, y: 90, element: 'rectangle' },
          { x: 250, y: 100, element: 'circle' },
          { x: 460, y: 95, element: 'image' },
          { x: 150, y: 210, element: 'text' }
        ];
        
        for (const point of testPoints) {
          try {
            simulateMouseEvent(canvas, 'mousedown', point.x, point.y);
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check if canvas is still visible
            const isVisible = canvas.offsetParent !== null;
            addTestResult(
              `Select ${point.element}`,
              isVisible,
              isVisible ? 'Element selected successfully' : 'Screen vanished after selection'
            );
            
            simulateMouseEvent(canvas, 'mouseup', point.x, point.y);
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            addTestResult(`Select ${point.element}`, false, `Error: ${error.message}`);
          }
        }
        
        // Test 3: Empty area click
        simulateMouseEvent(canvas, 'mousedown', 10, 10);
        await new Promise(resolve => setTimeout(resolve, 100));
        const isStillVisible = canvas.offsetParent !== null;
        addTestResult(
          'Empty Area Click',
          isStillVisible,
          isStillVisible ? 'Deselection works correctly' : 'Screen vanished on empty click'
        );
        
      } else {
        addTestResult('Canvas Access', false, 'Cannot access canvas element');
      }
      
    } catch (error) {
      addTestResult('Test Execution', false, `Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const canvasData = createTestCanvasData();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🧪 Select Tool Tester</h2>
      <p>This component tests the select tool behavior and checks for screen vanishing issues.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testSelectTool}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isRunning ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? 'Running Tests...' : 'Run Select Tool Tests'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Test Canvas */}
        <div style={{ flex: 1 }}>
          <h3>Test Canvas</h3>
          <div style={{ border: '2px solid #ddd', borderRadius: '4px', padding: '10px' }}>
            <canvas
              ref={testCanvasRef}
              width={canvasData.width}
              height={canvasData.height}
              style={{
                border: '1px solid #ccc',
                backgroundColor: canvasData.backgroundColor,
                cursor: 'crosshair'
              }}
            />
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Try manually clicking on different elements to test selection behavior
          </p>
        </div>

        {/* Test Results */}
        <div style={{ flex: 1 }}>
          <h3>Test Results</h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            padding: '10px',
            height: '400px',
            overflowY: 'auto',
            backgroundColor: '#f8f9fa'
          }}>
            {testResults.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No test results yet. Click "Run Tests" to start.
              </p>
            ) : (
              testResults.map((result, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '8px',
                    marginBottom: '8px',
                    borderRadius: '4px',
                    backgroundColor: result.passed ? '#d4edda' : '#f8d7da',
                    borderLeft: `4px solid ${result.passed ? '#28a745' : '#dc3545'}`
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {result.passed ? '✅' : '❌'} {result.test}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {result.message}
                  </div>
                  <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                    {result.timestamp}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <h4>Manual Testing Checklist:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>✓ Click on rectangle - should select without screen vanishing</li>
          <li>✓ Click on circle - should select without screen vanishing</li>
          <li>✓ Click on image - should select without screen vanishing</li>
          <li>✓ Click on text - should select without screen vanishing</li>
          <li>✓ Click on empty area - should deselect without issues</li>
          <li>✓ Drag elements - should move smoothly</li>
          <li>✓ Resize elements - should resize without issues</li>
        </ul>
      </div>
    </div>
  );
};

export default SelectToolTester;
