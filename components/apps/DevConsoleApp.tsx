import React from 'react';

/**
 * DevConsoleApp - Developer console for API management
 */
const DevConsoleApp: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">⚙️</span>
        <h1 className="font-display text-2xl font-bold">Developer Console</h1>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center text-text-secondary">
          <p className="text-lg mb-2">Developer Console</p>
          <p className="text-sm">Manage API keys and developer settings</p>
        </div>
      </div>
    </div>
  );
};

export default DevConsoleApp;