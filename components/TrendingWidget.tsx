import React, { useState } from 'react';
import { TrendingUpIcon, SparklesIcon } from './Icons.tsx';

interface TrendingItem {
  id: string;
  type: 'agent' | 'workflow' | 'topic';
  name: string;
  description: string;
  icon: string;
  trending: number;
  category: string;
}

const MOCK_TRENDING: TrendingItem[] = [
  {
    id: '1',
    type: 'agent',
    name: 'Code Helper Pro',
    description: 'AI assistant for developers',
    icon: '👨‍💻',
    trending: 95,
    category: 'Development',
  },
  {
    id: '2',
    type: 'workflow',
    name: 'Social Media Automation',
    description: 'Auto-post to multiple platforms',
    icon: '📱',
    trending: 87,
    category: 'Marketing',
  },
  {
    id: '3',
    type: 'topic',
    name: 'AI Image Generation',
    description: 'Latest trends in AI art',
    icon: '🎨',
    trending: 82,
    category: 'Creative',
  },
  {
    id: '4',
    type: 'agent',
    name: 'Travel Planner AI',
    description: 'Smart trip planning assistant',
    icon: '✈️',
    trending: 78,
    category: 'Travel',
  },
];

interface TrendingWidgetProps {
  onOpenItem?: (item: TrendingItem) => void;
}

/**
 * TrendingWidget - Show trending topics, agents, and workflows
 * Features:
 * - Real-time trending content
 * - Social media style feed
 * - Quick actions (view, install, share)
 * - Time-based trends (today, this week, all time)
 */
const TrendingWidget: React.FC<TrendingWidgetProps> = ({ onOpenItem }) => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'all'>('today');

  return (
    <div className="bg-bg-secondary rounded-lg p-4 border border-border-color">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUpIcon className="w-5 h-5 text-primary-pink" />
          <h3 className="font-semibold text-white">Trending</h3>
        </div>
        
        {/* Time Filter */}
        <div className="flex gap-1 bg-black/20 rounded p-1">
          {(['today', 'week', 'all'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                timeFilter === filter
                  ? 'bg-primary-pink text-white'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {filter === 'today' ? 'Today' : filter === 'week' ? 'Week' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Items */}
      <div className="space-y-3">
        {MOCK_TRENDING.map((item, index) => (
          <div
            key={item.id}
            className="group bg-bg-tertiary rounded-lg p-3 border border-border-color hover:border-primary-pink transition-all cursor-pointer"
            onClick={() => onOpenItem?.(item)}
          >
            <div className="flex items-start gap-3">
              {/* Rank */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-pink/20 flex items-center justify-center text-xs font-bold text-primary-pink">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="text-2xl">{item.icon}</div>

              {/* Content */}
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                  <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-primary-pink/20 text-primary-pink">
                    {item.type}
                  </span>
                </div>
                <p className="text-xs text-text-secondary line-clamp-1 mb-2">
                  {item.description}
                </p>
                
                {/* Stats */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <SparklesIcon className="w-3 h-3 text-primary-pink" />
                    <span className="text-text-secondary">{item.trending}% trending</span>
                  </div>
                  <span className="text-text-secondary">•</span>
                  <span className="text-text-secondary">{item.category}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (shown on hover) */}
            <div className="mt-2 pt-2 border-t border-border-color opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1 text-xs bg-primary-pink/20 hover:bg-primary-pink/30 rounded transition-colors">
                  View
                </button>
                <button className="flex-1 px-3 py-1 text-xs bg-primary-cyan/20 hover:bg-primary-cyan/30 rounded transition-colors">
                  Install
                </button>
                <button className="px-3 py-1 text-xs bg-bg-secondary hover:bg-black/20 rounded transition-colors">
                  Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All */}
      <button className="w-full mt-3 py-2 text-sm text-primary-pink hover:text-primary-pink/80 transition-colors">
        View All Trending →
      </button>
    </div>
  );
};

export default TrendingWidget;