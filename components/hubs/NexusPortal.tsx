import React from 'react';
import { CreativeHubIcon, DevLabIcon, TravelIcon, BusinessIcon, CognitionIcon, ConversationIcon, InsightIcon, SystemIcon, NexusIcon, IntegrationsIcon } from '../Icons.tsx';

const HUBS = [
  { id: 'creative', title: 'Creative Hub', description: 'Images, audio, video, translation, and content tools', icon: 'palette' },
  { id: 'devlab', title: 'DevLab', description: 'Code assistants, workflow builder, dev tools', icon: 'developer_mode' },
  { id: 'travel', title: 'Travel Intelligence', description: 'Trip planner, bookings, calendar sync', icon: 'flight_takeoff' },
  { id: 'business', title: 'Business Suite', description: 'Finance, marketing and workspace tools', icon: 'corporate_fare' },
  { id: 'cognition', title: 'Cognition Hub', description: 'Identity, profiles and personal intelligence', icon: 'psychology_alt' },
  { id: 'conversation', title: 'Conversational Core', description: 'Voice & chat center (Global Voice)', icon: 'record_voice_over' },
  { id: 'insight', title: 'Insight Lab', description: 'Analytics, avatars and training', icon: 'insights' },
  { id: 'system', title: 'System Center', description: 'Settings, docs, logs and notifications', icon: 'settings' },
  { id: 'nexus', title: 'Nexus Portal', description: 'Central launchpad & unified search', icon: 'apps' },
  { id: 'integrations', title: 'Gemini Connect', description: 'Connected services and API integrations', icon: 'link' },
];

export default function NexusPortal() {
  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Nexus Portal</h1>
        <p className="text-sm text-text-muted">Your Komabi Unified Experience — launch hubs, search, and manage integrations.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HUBS.map(hub => (
          <button
            key={hub.id}
            onClick={() => { console.log('open hub', hub.id); alert(`Open ${hub.title} (placeholder)`); }}
            className="group text-left p-4 rounded-lg bg-white/5 hover:bg-white/6 transition-shadow border border-white/6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold">{hub.icon[0].toUpperCase()}</div>
              <div>
                <h3 className="font-semibold text-lg">{hub.title}</h3>
                <p className="text-sm text-text-muted">{hub.description}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-white/60">Open</div>
          </button>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <button className="px-3 py-2 rounded bg-white/5">Create Trip</button>
          <button className="px-3 py-2 rounded bg-white/5">New Image</button>
          <button className="px-3 py-2 rounded bg-white/5">Open DevLab</button>
          <button className="px-3 py-2 rounded bg-white/5">Voice Assistant</button>
        </div>
      </section>
    </div>
  );
}

