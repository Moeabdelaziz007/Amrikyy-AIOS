import React from 'react';

/**
 * NexusChatApp - System-wide chat interface
 */
const NexusChatApp: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">💭</span>
        <h1 className="font-display text-2xl font-bold">Nexus Chat</h1>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center text-text-secondary">
          <p className="text-lg mb-2">Nexus Chat</p>
          <p className="text-sm">Real-time chat with the community</p>
        </div>
      </div>
    </div>
  );
};

export default NexusChatApp;