import React from 'react';
import HubShell from '../HubShell.tsx';

export default function DevLabHub() {
  return (
    <HubShell title="DevLab">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded">Code Assistant</div>
        <div className="p-4 bg-white/5 rounded">Workflow Builder</div>
        <div className="p-4 bg-white/5 rounded">Test Runner</div>
        <div className="p-4 bg-white/5 rounded">ChronoVault Logs</div>
      </div>
    </HubShell>
  );
}

