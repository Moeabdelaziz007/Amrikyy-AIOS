import React from 'react';
import HubShell from '../HubShell.tsx';

export default function ConversationHub() {
  return (
    <HubShell title="Conversational Core">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded">Global Voice Control</div>
        <div className="p-4 bg-white/5 rounded">AI Chat & Live Sessions</div>
        <div className="p-4 bg-white/5 rounded">Translate & Live Transcribe</div>
      </div>
    </HubShell>
  );
}

