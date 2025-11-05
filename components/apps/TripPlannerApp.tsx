import React, { useState } from 'react';
import { TripIcon, CalendarIcon, DollarIcon, UsersIcon } from '../Icons';

interface TripDay {
  day: number;
  activities: string[];
  budget: number;
}

const TripPlannerApp: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [travelers, setTravelers] = useState('1');
  const [itinerary, setItinerary] = useState<TripDay[]>([]);
  const [showResults, setShowResults] = useState(false);

  const generateItinerary = () => {
    if (!destination || !startDate || !endDate) return;

    const days = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    const newItinerary: TripDay[] = [];
    const dailyBudget = budget ? parseFloat(budget) / days : 100;

    for (let i = 1; i <= Math.min(days, 7); i++) {
      newItinerary.push({
        day: i,
        activities: [
          i === 1 ? `Arrive in ${destination}` : `Explore ${destination}`,
          'Visit local attractions',
          'Try local cuisine',
          i === days ? 'Departure preparations' : 'Evening activities'
        ],
        budget: dailyBudget
      });
    }

    setItinerary(newItinerary);
    setShowResults(true);
  };

  return (
    <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <TripIcon className="w-6 h-6 text-green-400" />
          <h1 className="font-display text-xl font-bold">Trip Planner</h1>
          <span className="text-xs text-green-400">Enhanced Planning</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {!showResults ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where do you want to go?"
                  className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" /> End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <DollarIcon className="w-4 h-4" /> Total Budget
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" /> Travelers
                  </label>
                  <input
                    type="number"
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    min="1"
                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg"
                  />
                </div>
              </div>

              <button
                onClick={generateItinerary}
                disabled={!destination || !startDate || !endDate}
                className="w-full py-3 bg-green-400 text-black rounded-lg font-semibold hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                Generate Itinerary
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Trip to {destination}</h2>
                <button
                  onClick={() => setShowResults(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm"
                >
                  Edit Plan
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <p className="text-sm text-text-secondary">Duration</p>
                  <p className="text-xl font-bold">{itinerary.length} Days</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <p className="text-sm text-text-secondary">Total Budget</p>
                  <p className="text-xl font-bold">${budget || 0}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <p className="text-sm text-text-secondary">Travelers</p>
                  <p className="text-xl font-bold">{travelers}</p>
                </div>
              </div>

              <div className="space-y-3">
                {itinerary.map((day) => (
                  <div key={day.day} className="bg-black/20 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-green-400">Day {day.day}</h3>
                      <span className="text-sm text-text-secondary">Budget: ${day.budget.toFixed(0)}</span>
                    </div>
                    <ul className="space-y-2">
                      {day.activities.map((activity, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlannerApp;
