import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error('Canvas Builder Error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>🚨 Something went wrong</h2>
            <p>Canvas Builder encountered an unexpected error.</p>
            
            <div className="error-actions">
              <button 
                onClick={this.handleReset}
                className="btn btn-primary"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="btn btn-secondary"
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre className="error-stack">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>

          <style jsx>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .error-container {
              background: white;
              padding: 2rem;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
              text-align: center;
              max-width: 500px;
              margin: 1rem;
            }

            .error-container h2 {
              color: #e74c3c;
              margin-bottom: 1rem;
              font-size: 1.5rem;
            }

            .error-container p {
              color: #666;
              margin-bottom: 1.5rem;
              line-height: 1.6;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              margin-bottom: 1rem;
            }

            .btn {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              transition: all 0.2s ease;
            }

            .btn-primary {
              background: #3b82f6;
              color: white;
            }

            .btn-primary:hover {
              background: #2563eb;
            }

            .btn-secondary {
              background: #6b7280;
              color: white;
            }

            .btn-secondary:hover {
              background: #4b5563;
            }

            .error-details {
              margin-top: 1rem;
              text-align: left;
            }

            .error-details summary {
              cursor: pointer;
              color: #666;
              margin-bottom: 0.5rem;
            }

            .error-stack {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 4px;
              padding: 1rem;
              font-size: 0.875rem;
              color: #495057;
              white-space: pre-wrap;
              overflow-x: auto;
            }

            @media (max-width: 768px) {
              .error-actions {
                flex-direction: column;
              }
              
              .error-container {
                padding: 1.5rem;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
