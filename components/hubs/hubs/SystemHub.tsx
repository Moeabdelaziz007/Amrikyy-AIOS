import React from 'react';
import HubShell from '../HubShell.tsx';

export default function SystemHub() {
  return (
    <HubShell title="System Center">
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded">Control Panel</div>
        <div className="p-4 bg-white/5 rounded">Notifications & Event Log</div>
        <div className="p-4 bg-white/5 rounded">Developer Docs</div>
      </div>
    </HubShell>
  );
}

