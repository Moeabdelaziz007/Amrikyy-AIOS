import React from 'react';
import HubShell from '../HubShell.tsx';

export default function CreativeHub() {
  return (
    <HubShell title="Creative Hub">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded">Image Generation (Sub Agent)</div>
        <div className="p-4 bg-white/5 rounded">Voice Generation (Sub Agent)</div>
        <div className="p-4 bg-white/5 rounded">Video Studio (Sub Agent)</div>
        <div className="p-4 bg-white/5 rounded">Translate & Localization (Sub Agent)</div>
      </div>
    </HubShell>
  );
}

