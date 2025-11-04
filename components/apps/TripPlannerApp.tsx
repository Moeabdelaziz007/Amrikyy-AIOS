import React from 'react';
import { TripIcon } from '../Icons';

const TripPlannerApp: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-bg-tertiary rounded-b-md text-white p-6 gap-6 overflow-y-auto">
      <div className="text-center">
        <TripIcon className="w-16 h-16 mx-auto mb-4 text-green-400" />
        <h1 className="font-display text-3xl font-bold">Trip Planner</h1>
        <p className="text-green-400 font-semibold">Enhanced Trip Planning</p>
        <p className="text-text-secondary mt-2 max-w-md">
          This is where the enhanced trip planning application will be. The full implementation is pending.
        </p>
      </div>
      <div className="w-full max-w-lg p-8 bg-black/20 rounded-lg border border-white/10 mt-4">
        <p className="text-center text-text-muted">Trip planning inputs and itinerary display will be implemented here.</p>
      </div>
    </div>
  );
};

export default TripPlannerApp;
