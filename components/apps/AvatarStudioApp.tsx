import React from 'react';

/**
 * AvatarStudioApp - Create and customize agent avatars
 */
const AvatarStudioApp: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🎨</span>
        <h1 className="font-display text-2xl font-bold">Avatar Studio</h1>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center text-text-secondary">
          <p className="text-lg mb-2">Avatar Studio</p>
          <p className="text-sm">Create custom avatars for your AI agents</p>
        </div>
      </div>
    </div>
  );
};

export default AvatarStudioApp;