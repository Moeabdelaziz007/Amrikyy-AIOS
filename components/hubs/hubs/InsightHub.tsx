import React from 'react';
import HubShell from '../HubShell.tsx';

export default function InsightHub() {
  return (
    <HubShell title="Insight Lab">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded">Analytics Dashboards</div>
        <div className="p-4 bg-white/5 rounded">Avatar Studio</div>
        <div className="p-4 bg-white/5 rounded">Model Training</div>
      </div>
    </HubShell>
  );
}

