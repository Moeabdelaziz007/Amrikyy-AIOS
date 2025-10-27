import React from 'react';
import { TravelPlan, SharedContent } from '../../types';
import { TripIcon } from '../Icons';

interface TravelPlanViewerAppProps {
  plan: TravelPlan;
  onShare: (content: SharedContent) => void;
}

const TravelPlanViewerApp: React.FC<TravelPlanViewerAppProps> = ({ plan, onShare }) => {
  if (!plan) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-bg-tertiary rounded-b-md text-text-secondary">
        No travel plan available.
      </div>
    );
  }

  const totalBudget = plan.budget.reduce((sum, item) => sum + item.cost, 0);

  const handleShare = () => {
    onShare({
        type: 'travel_plan',
        title: plan.tripTitle,
        subtitle: `An AI-planned adventure to ${plan.destination}.`,
        cta: "Explore My AI-Generated Trip"
    });
  };

  return (
    <div className="h-full w-full bg-bg-tertiary rounded-b-md text-white p-6 overflow-y-auto">
      <header className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-4">
            <TripIcon className="w-16 h-16 text-primary-cyan" />
            <div>
                <h1 className="font-display text-4xl font-bold">{plan.tripTitle}</h1>
                <p className="text-lg text-text-secondary">Your personalized AI-generated travel plan to {plan.destination}</p>
            </div>
            <button onClick={handleShare} className="ml-auto p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Share this plan">
                <span className="material-symbols-outlined">share</span>
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Itinerary */}
        <div className="lg:col-span-2 bg-black/20 p-6 rounded-lg border border-border-color animate-slide-up" style={{animationDelay: '0.2s'}}>
          <h2 className="font-display text-2xl font-bold mb-4">Itinerary</h2>
          <div className="space-y-4">
            {plan.itinerary.map(day => (
              <div key={day.day}>
                <h3 className="font-bold text-primary-cyan">Day {day.day}: {day.title}</h3>
                <ul className="list-disc list-inside pl-4 text-text-secondary text-sm space-y-1 mt-1">
                  {day.activities.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Budget & Links */}
        <div className="space-y-6">
          <div className="bg-black/20 p-6 rounded-lg border border-border-color animate-slide-up" style={{animationDelay: '0.4s'}}>
            <h2 className="font-display text-2xl font-bold mb-4">Budget Breakdown</h2>
            <div className="space-y-2">
              {plan.budget.map(item => (
                <div key={item.category} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{item.category}</span>
                  <span className="font-semibold">${item.cost.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t border-border-color pt-2 mt-2">
                <span>Total</span>
                <span>${totalBudget.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-black/20 p-6 rounded-lg border border-border-color animate-slide-up" style={{animationDelay: '0.6s'}}>
            <h2 className="font-display text-2xl font-bold mb-4">Deals & Links</h2>
            <ul className="space-y-2">
              {plan.dealsAndLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-blue hover:underline">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPlanViewerApp;