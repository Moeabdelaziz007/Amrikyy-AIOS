import React, { useState, useEffect } from 'react';
import { BotsIcon, ActivityIcon, CpuIcon, MemoryIcon } from '../Icons';

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error';
  tasks: number;
  cpu: number;
  memory: number;
  uptime: string;
}

const AgentsDashboardApp: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([
    { id: '1', name: 'Luna', status: 'active', tasks: 3, cpu: 45, memory: 512, uptime: '2h 15m' },
    { id: '2', name: 'Karim', status: 'active', tasks: 1, cpu: 23, memory: 256, uptime: '1h 30m' },
    { id: '3', name: 'Scout', status: 'idle', tasks: 0, cpu: 5, memory: 128, uptime: '5h 45m' },
    { id: '4', name: 'Maya', status: 'active', tasks: 5, cpu: 67, memory: 768, uptime: '3h 22m' },
    { id: '5', name: 'Jules', status: 'idle', tasks: 0, cpu: 8, memory: 192, uptime: '12h 5m' },
    { id: '6', name: 'Atlas', status: 'active', tasks: 2, cpu: 34, memory: 384, uptime: '1h 10m' },
  ]);

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'idle': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-400/20';
      case 'idle': return 'bg-yellow-400/20';
      case 'error': return 'bg-red-400/20';
      default: return 'bg-gray-400/20';
    }
  };

  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasks, 0);
  const avgCpu = Math.round(agents.reduce((sum, a) => sum + a.cpu, 0) / agents.length);

  return (
    <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BotsIcon className="w-6 h-6 text-purple-400" />
            <h1 className="font-display text-xl font-bold">Agents Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1 rounded text-sm ${view === 'grid' ? 'bg-purple-400 text-black' : 'bg-white/5'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded text-sm ${view === 'list' ? 'bg-purple-400 text-black' : 'bg-white/5'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Agents</p>
                  <p className="text-2xl font-bold">{totalAgents}</p>
                </div>
                <BotsIcon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Active</p>
                  <p className="text-2xl font-bold text-green-400">{activeAgents}</p>
                </div>
                <ActivityIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Tasks</p>
                  <p className="text-2xl font-bold">{totalTasks}</p>
                </div>
                <CpuIcon className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Avg CPU</p>
                  <p className="text-2xl font-bold">{avgCpu}%</p>
                </div>
                <MemoryIcon className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Agents Display */}
          {view === 'grid' ? (
            <div className="grid grid-cols-2 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="bg-black/20 p-4 rounded-lg border border-white/10 hover:border-purple-400/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{agent.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBg(agent.status)} ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Tasks:</span>
                      <span className="font-semibold">{agent.tasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">CPU:</span>
                      <span className="font-semibold">{agent.cpu}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Memory:</span>
                      <span className="font-semibold">{agent.memory} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Uptime:</span>
                      <span className="font-semibold">{agent.uptime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="bg-black/20 p-3 rounded-lg border border-white/10 hover:border-purple-400/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="font-bold w-20">{agent.name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBg(agent.status)} ${getStatusColor(agent.status)} w-16 text-center`}>
                        {agent.status}
                      </span>
                      <span className="text-sm text-text-secondary w-24">Tasks: {agent.tasks}</span>
                      <span className="text-sm text-text-secondary w-24">CPU: {agent.cpu}%</span>
                      <span className="text-sm text-text-secondary w-32">Memory: {agent.memory} MB</span>
                      <span className="text-sm text-text-secondary flex-1">Uptime: {agent.uptime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedAgent(null)}>
          <div className="bg-bg-tertiary border border-white/10 rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">{selectedAgent.name}</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Status:</span>
                <span className={getStatusColor(selectedAgent.status)}>{selectedAgent.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Active Tasks:</span>
                <span>{selectedAgent.tasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">CPU Usage:</span>
                <span>{selectedAgent.cpu}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Memory:</span>
                <span>{selectedAgent.memory} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Uptime:</span>
                <span>{selectedAgent.uptime}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button className="flex-1 py-2 bg-green-400 text-black rounded-lg font-semibold hover:bg-green-500">
                Start
              </button>
              <button className="flex-1 py-2 bg-red-400 text-black rounded-lg font-semibold hover:bg-red-500">
                Stop
              </button>
              <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg">
                Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsDashboardApp;
