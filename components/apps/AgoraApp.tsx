import React from 'react';

/**
 * AgoraApp - Marketplace for AI agents and workflows
 */
const AgoraApp: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🏛️</span>
        <h1 className="font-display text-2xl font-bold">Agora Marketplace</h1>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center text-text-secondary">
          <p className="text-lg mb-2">Agora Marketplace</p>
          <p className="text-sm">Buy and sell AI agents and workflows</p>
        </div>
      </div>
    </div>
  );
};

export default AgoraApp;