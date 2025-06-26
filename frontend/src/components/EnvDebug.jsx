// Debug component to check environment variables
import React from 'react';

const EnvDebug = () => {
  const envVars = {
    'import.meta.env exists': typeof import.meta !== 'undefined' && !!import.meta.env,
    'VITE_API_BASE_URL': import.meta.env?.VITE_API_BASE_URL || 'NOT FOUND',
    'NODE_ENV': import.meta.env?.NODE_ENV || 'NOT FOUND',
    'MODE': import.meta.env?.MODE || 'NOT FOUND',
    'All env vars': import.meta.env || {},
  };

  // Only show in development or when there's an error
  if (import.meta.env?.NODE_ENV === 'production' && import.meta.env?.VITE_API_BASE_URL) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#ff6b6b',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <h4>Environment Debug Info</h4>
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {JSON.stringify(value)}
        </div>
      ))}
      <p style={{marginTop: '10px', fontSize: '10px'}}>
        This debug info shows when VITE_API_BASE_URL is missing.
        Set it in Vercel Dashboard under Settings → Environment Variables.
      </p>
    </div>
  );
};

export default EnvDebug;
