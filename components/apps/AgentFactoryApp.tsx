import React from 'react';
import { creatorTeamTemplates, travelTeamTemplates } from '../../data/agentTemplates';
import { CustomAgent } from '../../types';

export default function AgentFactoryApp({ onAddAgent, onOpenApp }: { onAddAgent?: (agent: CustomAgent) => void, onOpenApp?: (appId: any, props?: any) => void }) {
  const createAgent = async (template: CustomAgent) => {
    const agent = { ...template, id: `${template.id}-${Date.now()}` };
    try {
      const resp = await fetch('/api/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(agent) });
      if (!resp.ok) {
        const text = await resp.text();
        alert('Failed to create agent: ' + text);
        return;
      }
      const created = await resp.json();
      if (onAddAgent) onAddAgent(created as CustomAgent);
      if (onOpenApp) onOpenApp(created.id);
      // close modal or show success
    } catch (e: any) {
      console.error('Create agent failed', e);
      alert('Create agent failed: ' + (e.message || e));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Agent Factory</h1>
      <p className="text-sm text-muted">Create sub-agents for Creator and Travel teams easily.</p>

      <section className="mt-4">
        <h2 className="font-semibold">Creator Team</h2>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {creatorTeamTemplates.map(t => (
            <div key={t.id} className="p-2 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-muted">{t.role}</div>
              </div>
              <button className="btn" onClick={() => createAgent(t)}>Create</button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4">
        <h2 className="font-semibold">Travel Team</h2>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {travelTeamTemplates.map(t => (
            <div key={t.id} className="p-2 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-muted">{t.role}</div>
              </div>
              <button className="btn" onClick={() => createAgent(t)}>Create</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
