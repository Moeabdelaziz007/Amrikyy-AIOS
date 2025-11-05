import React from 'react';
import HubShell from '../HubShell.tsx';

export default function CognitionHub() {
  return (
    <HubShell title="Cognition Hub">
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded">Identity & Profiles</div>
        <div className="p-4 bg-white/5 rounded">Personal Insights</div>
        <div className="p-4 bg-white/5 rounded">News & Feed Personalization</div>
      </div>
    </HubShell>
  );
}

