
              <div className="relative h-48 flex items-end gap-2">{[65,78,45,82,91,73,88,95,82,78,85,92].map((value, i) => (<div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-red-500 rounded-t-lg transition-all hover:opacity-80 cursor-pointer" style={{ height: `${value}%` }} />))}</div>

              <div className="mt-6 grid grid-cols-4 gap-3"><div className="bg-white/5 rounded-xl p-3"><div className="flex items-center gap-2 mb-1"><TrendingUp className="w-3 h-3 text-green-400"/><span className="text-xs text-slate-400">Growth</span></div><div className="text-lg font-bold text-white">+23%</div></div><div className="bg-white/5 rounded-xl p-3"><div className="flex items-center gap-2 mb-1"><Activity className="w-3 h-3 text-cyan-400"/><span className="text-xs text-slate-400">Active</span></div><div className="text-lg font-bold text-white">1.2K</div></div><div className="bg-white/5 rounded-xl p-3"><div className="flex items-center gap-2 mb-1"><span className="text-xs text-slate-400">Goal</span></div><div className="text-lg font-bold text-white">85%</div></div><div className="bg-white/5 rounded-xl p-3"><div className="flex items-center gap-2 mb-1"><Zap className="w-3 h-3 text-yellow-400"/><span className="text-xs text-slate-400">Speed</span></div><div className="text-lg font-bold text-white">Fast</div></div></div>
            </div>
          </div>
        )}

        {activeWidgets.includes('calendar') && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-indigo-400/50 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4"><h3 className="text-white font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-400"/>Calendar</h3><button onClick={() => toggleWidget('calendar')} className="text-slate-400 hover:text-white"><X className="w-4 h-4"/></button></div>

              <div className="text-center mb-4"><div className="text-3xl font-bold text-white">{time.getDate()}</div><div className="text-sm text-slate-400">{time.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</div></div>

              <div className="space-y-2">{[{ time: '09:00', title: 'Team Meeting', color: 'blue' }, { time: '14:00', title: 'Video Review', color: 'purple' }, { time: '16:30', title: 'Agent Training', color: 'green' }].map((event, i) => (<div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"><div className={`w-1 h-8 bg-${event.color}-400 rounded-full`} /><div className="flex-1"><div className="text-white text-sm font-medium">{event.title}</div><div className="text-xs text-slate-400">{event.time}</div></div></div>))}</div>
            </div>
          </div>
        )}

        {activeWidgets.includes('credits') && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-yellow-400/50 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4"><h3 className="text-white font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-400"/>AI Credits</h3><button onClick={() => toggleWidget('credits')} className="text-slate-400 hover:text-white"><X className="w-4 h-4"/></button></div>

              <div className="text-center mb-4"><div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">1,000</div><div className="text-sm text-slate-400 mt-1">Credits Available</div></div>

              <div className="space-y-2"><div className="flex justify-between text-xs"><span className="text-slate-400">Daily Usage</span><span className="text-white">250 / 500</span></div><div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 w-1/2" /></div></div>

              <button className="w-full mt-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:scale-105 transition-transform">Buy More Credits</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EnhancedWidgets;
import React, { useEffect, useState } from 'react';
import { Cloud, CheckSquare, Brain, TrendingUp, Calendar, Sparkles, X, Plus } from 'lucide-react';

const EnhancedWidgets: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [activeWidgets, setActiveWidgets] = useState<string[]>(['weather', 'tasks', 'agents', 'analytics']);

  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);

  const availableWidgets: Record<string, any> = {
    weather: { id: 'weather', title: 'Weather', icon: Cloud, color: 'from-blue-400 to-cyan-400', size: 'small' },
    tasks: { id: 'tasks', title: "Tasks", icon: CheckSquare, color: 'from-green-400 to-emerald-400', size: 'medium' },
    agents: { id: 'agents', title: 'AI Agents', icon: Brain, color: 'from-purple-400 to-pink-400', size: 'large' },
    analytics: { id: 'analytics', title: 'Analytics', icon: TrendingUp, color: 'from-orange-400 to-red-400', size: 'large' },
    calendar: { id: 'calendar', title: 'Calendar', icon: Calendar, color: 'from-indigo-400 to-purple-400', size: 'medium' },
    credits: { id: 'credits', title: 'AI Credits', icon: Sparkles, color: 'from-yellow-400 to-orange-400', size: 'small' }
  };

  const toggleWidget = (widgetId: string) => setActiveWidgets(prev => prev.includes(widgetId) ? prev.filter(id => id !== widgetId) : [...prev, widgetId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Dashboard Widgets</h1>
          <p className="text-slate-400 mt-1">Customize your workspace</p>
        </div>

        <div className="flex gap-2">
          {Object.values(availableWidgets).map((widget: any) => (
            <button key={widget.id} onClick={() => toggleWidget(widget.id)} className={`p-2 rounded-xl transition-all ${activeWidgets.includes(widget.id) ? `bg-gradient-to-r ${widget.color} text-white` : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              <widget.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {activeWidgets.includes('weather') && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-cyan-400/50 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2"><Cloud className="w-5 h-5 text-cyan-400"/>Weather</h3>
                <button onClick={() => toggleWidget('weather')} className="text-slate-400 hover:text-white"><X className="w-4 h-4"/></button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-5xl font-bold text-white mb-2">23°</div>
                  <div className="text-sm text-slate-400">Partly Cloudy</div>
                  <div className="text-xs text-slate-500 mt-1">Cairo, Egypt</div>
                </div>
                <Cloud className="w-20 h-20 text-cyan-400 opacity-50" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-lg p-2 text-center"><div className="text-xs text-slate-400">Humidity</div><div className="text-sm font-bold text-white">65%</div></div>
                <div className="bg-white/5 rounded-lg p-2 text-center"><div className="text-xs text-slate-400">Wind</div><div className="text-sm font-bold text-white">12 km/h</div></div>
                <div className="bg-white/5 rounded-lg p-2 text-center"><div className="text-xs text-slate-400">UV</div><div className="text-sm font-bold text-white">5</div></div>
              </div>
            </div>
          </div>
        )}

        {activeWidgets.includes('tasks') && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-green-400/50 transition-all md:col-span-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400"/>Today's Tasks</h3>
                <button onClick={() => toggleWidget('tasks')} className="text-slate-400 hover:text-white"><X className="w-4 h-4"/></button>
              </div>

              <div className="space-y-3">
                {[{ title: 'Create video about AI trends', status: 'in-progress', progress: 60 }, { title: 'Build new travel agent', status: 'pending', progress: 0 }, { title: 'Review workflow analytics', status: 'completed', progress: 100 }, { title: 'Update agent configurations', status: 'in-progress', progress: 40 }].map((task, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2"><span className="text-white text-sm">{task.title}</span><span className={`text-xs px-2 py-1 rounded-full ${task.status === 'completed' ? 'bg-green-500/20 text-green-400' : task.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'}`}>{task.status}</span></div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all" style={{ width: `${task.progress}%` }} /></div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4"/>Add New Task</button>
            </div>
          </div>
        )}

        {activeWidgets.includes('agents') && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-purple-400/50 transition-all lg:col-span-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400"/>AI Agents Status</h3>
                <button onClick={() => toggleWidget('agents')} className="text-slate-400 hover:text-white"><X className="w-4 h-4"/></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[{ name: 'Video Creator', status: 'active', cpu: 78, tasks: 3, color: 'purple' }, { name: 'Agent Forge', status: 'active', cpu: 45, tasks: 2, color: 'cyan' }, { name: 'Workflow Studio', status: 'active', cpu: 67, tasks: 5, color: 'green' }, { name: 'Travel Planner', status: 'idle', cpu: 12, tasks: 0, color: 'orange' }].map((agent, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between mb-3"><span className="text-white font-medium text-sm">{agent.name}</span><div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`} /></div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>CPU</span><span>{agent.cpu}%</span></div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r from-${agent.color}-500 to-${agent.color}-400`} style={{ width: `${agent.cpu}%` }} /></div>
                      </div>

                      <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Tasks</span><span className="text-white font-bold">{agent.tasks}</span></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3"><div className="bg-white/5 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-green-400">4</div><div className="text-xs text-slate-400">Active</div></div><div className="bg-white/5 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-cyan-400">10</div><div className="text-xs text-slate-400">Total Tasks</div></div><div className="bg-white/5 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-purple-400">56%</div><div className="text-xs text-slate-400">Avg CPU</div></div></div>
            </div>
          </div>
        )}

        {activeWidgets.includes('analytics') && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-orange-400/50 transition-all lg:col-span-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4"><h3 className="text-white font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-orange-400"/>Performance Analytics</h3><button onClick={() => toggleWidget('analytics')} className="text-slate-400 hover:text-white"><X className="w-4 h-4"/></button></div>

