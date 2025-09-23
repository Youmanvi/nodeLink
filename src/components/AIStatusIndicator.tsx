import React, { useState, useEffect } from 'react';

interface AIStatusIndicatorProps {
  processor: any;
}

const AIStatusIndicator: React.FC<AIStatusIndicatorProps> = ({ processor }) => {
  const [status, setStatus] = useState(processor?.getStatus?.() || {
    isSupported: false,
    isInitialized: false,
    hasActiveSession: false,
    browserSupport: false
  });
  
  useEffect(() => {
    if (!processor) return;
    
    const interval = setInterval(() => {
      const newStatus = processor.getStatus();
      setStatus(newStatus);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [processor]);

  return (
    <div className="space-y-2 text-sm" style={{ color: '#B8B8B8' }}>
      <div className="flex items-center gap-2">
        <div 
          className={`w-2 h-2 rounded-full ${
            status.isSupported ? 'bg-green-400' : 'bg-red-400'
          }`}
        />
        <span>
          Browser Support: {status.isSupported ? 'Available' : 'Not Available'}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <div 
          className={`w-2 h-2 rounded-full ${
            status.isInitialized ? 'bg-green-400' : 'bg-yellow-400'
          }`}
        />
        <span>
          AI Status: {status.isInitialized ? 'Ready' : 'Initializing...'}
        </span>
      </div>
      
      {status.isInitialized && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span>
            Session: {status.hasActiveSession ? 'Active' : 'Inactive'}
          </span>
        </div>
      )}
      
      {!status.browserSupport && (
        <div className="mt-3 p-2 rounded border" style={{ 
          backgroundColor: '#3A3A3A',
          borderColor: '#4A4A4A'
        }}>
          <p className="text-yellow-400 text-xs">
            <strong>Chrome AI Required:</strong> For AI enhancement, use Chrome with experimental AI features enabled.
          </p>
          <p className="text-xs mt-1" style={{ color: '#B8B8B8' }}>
            Enable at: chrome://flags/#optimization-guide-on-device-model
          </p>
        </div>
      )}
      
      {status.isSupported && !status.isInitialized && (
        <div className="mt-3 p-2 rounded border" style={{ 
          backgroundColor: '#3A3A3A',
          borderColor: '#4A4A4A'
        }}>
          <p className="text-blue-400 text-xs">
            <strong>Initializing AI:</strong> Setting up on-device processing...
          </p>
        </div>
      )}
      
      {status.isInitialized && (
        <div className="mt-3 p-2 rounded border" style={{ 
          backgroundColor: '#3A3A3A',
          borderColor: '#4A4A4A'
        }}>
          <p className="text-green-400 text-xs">
            <strong>AI Ready:</strong> Enhanced text analysis available
          </p>
          <p className="text-xs mt-1" style={{ color: '#B8B8B8' }}>
            All processing happens locally on your device
          </p>
        </div>
      )}
    </div>
  );
};

export default AIStatusIndicator;
