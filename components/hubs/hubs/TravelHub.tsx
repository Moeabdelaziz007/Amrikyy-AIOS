import React from 'react';
import HubShell from '../HubShell.tsx';
import { AppID } from '../../../types.ts';

export default function TravelHub({ onOpen }: { onOpen?: (appId: AppID) => void }) {
  return (
    <HubShell title="Travel Intelligence">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded">Trip Planner (open Travel Agent)</div>
        <div className="p-4 bg-white/5 rounded">Bookings & Deals</div>
        <div className="p-4 bg-white/5 rounded">Local Events & Nightlife</div>
        <div className="p-4 bg-white/5 rounded">Sync to Google Calendar</div>
      </div>
    </HubShell>
  );
}

