import React from 'react';
import HubShell from '../HubShell.tsx';

export default function IntegrationsHub() {
  return (
    <HubShell title="Gemini Connect">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded">Google Workspace</div>
        <div className="p-4 bg-white/5 rounded">API Integrations</div>
        <div className="p-4 bg-white/5 rounded">Marketplace Connectors</div>
      </div>
    </HubShell>
  );
}

