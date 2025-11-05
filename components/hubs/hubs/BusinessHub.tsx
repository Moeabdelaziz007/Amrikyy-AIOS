import React from 'react';
import HubShell from '../HubShell.tsx';

export default function BusinessHub() {
  return (
    <HubShell title="Business Suite">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded">Finance Dashboard</div>
        <div className="p-4 bg-white/5 rounded">Marketing Automations</div>
        <div className="p-4 bg-white/5 rounded">Project Workspace</div>
        <div className="p-4 bg-white/5 rounded">CRM & Contacts</div>
      </div>
    </HubShell>
  );
}

