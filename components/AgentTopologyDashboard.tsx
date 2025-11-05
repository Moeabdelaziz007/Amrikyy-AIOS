import React, { useEffect, useRef, useState } from 'react';
import { Activity, Brain, Zap, Cpu, Wifi, Play, Pause, Square, CheckCircle, AlertCircle, Network, Sparkles, TrendingUp } from 'lucide-react';
// import { quantumAgentService } from '../services/src/quantumAgentService';

// Quantum reasoning types
interface QuantumMetrics {
  avgConfidence: number;
  avgProcessingTime: number;
  quantumUsageRate: number;
  topologiesValidated: number;
  lastHypothesesCount: number;
  reasoningQuality: number;
}

interface QuantumAgent {
  id: string;
  name: string;
  type: 'controller' | 'agent' | 'sub-agent';
  status: 'active' | 'idle' | 'error';
  cpu: number;
  memory: number;
  tasks: number;
  connections: string[];
  x: number;
  y: number;
  color: string;
  quantumEnabled: boolean;
  quantumMetrics?: QuantumMetrics;
  lastQuantumResponse?: {
    confidence: number;
    processingTime: number;
    hypothesisCount: number;
    topologyScore: number;
  };
}

const AgentTopologyDashboard: React.FC = () => {
  const [agents, setAgents] = useState<QuantumAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<QuantumAgent | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [showQuantumLayer, setShowQuantumLayer] = useState(false);
  const [quantumMetrics, setQuantumMetrics] = useState<QuantumMetrics>({
    avgConfidence: 0.85,
    avgProcessingTime: 245,
    quantumUsageRate: 0.78,
    topologiesValidated: 12,
    lastHypothesesCount: 5,
    reasoningQuality: 0.92
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const sampleAgents: QuantumAgent[] = [
      { 
        id: 'main-ai', 
        name: 'Main AI Controller', 
        type: 'controller', 
        status: 'active', 
        cpu: 45, 
        memory: 62, 
        tasks: 12, 
        connections: ['video-creator', 'agent-forge', 'workflow-1'], 
        x: 400, 
        y: 300, 
        color: '#00ffff',
        quantumEnabled: true,
        lastQuantumResponse: {
          confidence: 0.92,
          processingTime: 320,
          hypothesisCount: 5,
          topologyScore: 0.88
        }
      },
      { 
        id: 'video-creator', 
        name: 'Video Creator', 
        type: 'agent', 
        status: 'active', 
        cpu: 78, 
        memory: 84, 
        tasks: 3, 
        connections: ['script-writer', 'content-searcher', 'prompt-engineer'], 
        x: 200, 
        y: 150, 
        color: '#ff00ff',
        quantumEnabled: true,
        lastQuantumResponse: {
          confidence: 0.85,
          processingTime: 280,
          hypothesisCount: 4,
          topologyScore: 0.82
        }
      },
      { 
        id: 'script-writer', 
        name: 'Script Writer', 
        type: 'sub-agent', 
        status: 'active', 
        cpu: 34, 
        memory: 45, 
        tasks: 1, 
        connections: [], 
        x: 100, 
        y: 50, 
        color: '#ff66ff',
        quantumEnabled: false
      },
      { 
        id: 'content-searcher', 
        name: 'Content Searcher', 
        type: 'sub-agent', 
        status: 'active', 
        cpu: 56, 
        memory: 67, 
        tasks: 2, 
        connections: [], 
        x: 150, 
        y: 200, 
        color: '#ff66ff',
        quantumEnabled: false
      },
      { 
        id: 'prompt-engineer', 
        name: 'Prompt Engineer', 
        type: 'sub-agent', 
        status: 'idle', 
        cpu: 12, 
        memory: 23, 
        tasks: 0, 
        connections: [], 
        x: 250, 
        y: 250, 
        color: '#ff66ff',
        quantumEnabled: true,
        lastQuantumResponse: {
          confidence: 0.78,
          processingTime: 180,
          hypothesisCount: 3,
          topologyScore: 0.75
        }
      },
      { 
        id: 'agent-forge', 
        name: 'Agent Forge', 
        type: 'agent', 
        status: 'active', 
        cpu: 45, 
        memory: 56, 
        tasks: 2, 
        connections: ['builder-1', 'builder-2'], 
        x: 600, 
        y: 150, 
        color: '#00ff00',
        quantumEnabled: true,
        lastQuantumResponse: {
          confidence: 0.89,
          processingTime: 250,
          hypothesisCount: 4,
          topologyScore: 0.86
        }
      },
      { 
        id: 'builder-1', 
        name: 'Template Builder', 
        type: 'sub-agent', 
        status: 'active', 
        cpu: 23, 
        memory: 34, 
        tasks: 1, 
        connections: [], 
        x: 700, 
        y: 100, 
        color: '#66ff66',
        quantumEnabled: false
      },
      { 
        id: 'builder-2', 
        name: 'Config Builder', 
        type: 'sub-agent', 
        status: 'idle', 
        cpu: 8, 
        memory: 15, 
        tasks: 0, 
        connections: [], 
        x: 700, 
        y: 200, 
        color: '#66ff66',
        quantumEnabled: false
      },
      { 
        id: 'workflow-1', 
        name: 'Workflow Studio', 
        type: 'agent', 
        status: 'active', 
        cpu: 67, 
        memory: 72, 
        tasks: 5, 
        connections: ['task-scheduler', 'task-executor'], 
        x: 400, 
        y: 500, 
        color: '#ffff00',
        quantumEnabled: true,
        lastQuantumResponse: {
          confidence: 0.91,
          processingTime: 290,
          hypothesisCount: 5,
          topologyScore: 0.89
        }
      },
      { 
        id: 'task-scheduler', 
        name: 'Task Scheduler', 
        type: 'sub-agent', 
        status: 'active', 
        cpu: 34, 
        memory: 45, 
        tasks: 3, 
        connections: [], 
        x: 300, 
        y: 600, 
        color: '#ffff66',
        quantumEnabled: false
      },
      { 
        id: 'task-executor', 
        name: 'Task Executor', 
        type: 'sub-agent', 
        status: 'active', 
        cpu: 56, 
        memory: 67, 
        tasks: 2, 
        connections: [], 
        x: 500, 
        y: 600, 
        color: '#ffff66',
        quantumEnabled: false
      }
    ];
    setAgents(sampleAgents);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 800;
    canvas.height = 700;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(100,100,100,0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) { 
        ctx.beginPath(); 
        ctx.moveTo(i, 0); 
        ctx.lineTo(i, canvas.height); 
        ctx.stroke(); 
      }
      for (let i = 0; i < canvas.height; i += 50) { 
        ctx.beginPath(); 
        ctx.moveTo(0, i); 
        ctx.lineTo(canvas.width, i); 
        ctx.stroke(); 
      }

      // Quantum layer visualization
      if (showQuantumLayer) {
        ctx.strokeStyle = 'rgba(138, 43, 226, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < agents.length; i++) {
          for (let j = i + 1; j < agents.length; j++) {
            if (agents[i].quantumEnabled && agents[j].quantumEnabled) {
              ctx.beginPath();
              ctx.moveTo(agents[i].x, agents[i].y);
              ctx.lineTo(agents[j].x, agents[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Connections
      agents.forEach(agent => {
        agent.connections.forEach((connId: string) => {
          const target = agents.find(a => a.id === connId);
          if (!target) return;
          
          ctx.beginPath();
          ctx.moveTo(agent.x, agent.y);
          ctx.lineTo(target.x, target.y);
          
          const grad = ctx.createLinearGradient(agent.x, agent.y, target.x, target.y);
          grad.addColorStop(0, agent.color + '80');
          grad.addColorStop(1, target.color + '80');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Moving particle along connection
          const progress = (Date.now() / 2000) % 1;
          const px = agent.x + (target.x - agent.x) * progress;
          const py = agent.y + (target.y - agent.y) * progress;
          ctx.beginPath(); 
          ctx.arc(px, py, 3, 0, Math.PI * 2); 
          ctx.fillStyle = agent.color; 
          ctx.fill();
        });
      });

      // Nodes
      agents.forEach(agent => {
        const radius = agent.type === 'controller' ? 40 : agent.type === 'agent' ? 30 : 20;
        
        // Quantum glow effect
        if (agent.quantumEnabled && agent.status === 'active') {
          ctx.beginPath(); 
          ctx.arc(agent.x, agent.y, radius + 15, 0, Math.PI * 2);
          const quantumGlow = ctx.createRadialGradient(agent.x, agent.y, radius, agent.x, agent.y, radius + 20);
          quantumGlow.addColorStop(0, 'rgba(138, 43, 226, 0.3)'); 
          quantumGlow.addColorStop(1, 'transparent'); 
          ctx.fillStyle = quantumGlow; 
          ctx.fill();
        }

        // Active status glow
        if (agent.status === 'active') {
          ctx.beginPath(); 
          ctx.arc(agent.x, agent.y, radius + 6, 0, Math.PI * 2);
          const g = ctx.createRadialGradient(agent.x, agent.y, radius, agent.x, agent.y, radius + 10);
          g.addColorStop(0, agent.color + '40'); 
          g.addColorStop(1, 'transparent'); 
          ctx.fillStyle = g; 
          ctx.fill();
        }

        // Main node
        ctx.beginPath(); 
        ctx.arc(agent.x, agent.y, radius, 0, Math.PI * 2);
        const ng = ctx.createRadialGradient(agent.x, agent.y, 0, agent.x, agent.y, radius);
        ng.addColorStop(0, agent.color + 'ff'); 
        ng.addColorStop(0.7, agent.color + 'aa'); 
        ng.addColorStop(1, agent.color + '66'); 
        ctx.fillStyle = ng; 
        ctx.fill();

        ctx.strokeStyle = '#ffffff66'; 
        ctx.lineWidth = 1; 
        ctx.stroke();

        // CPU ring
        const cpuAngle = (agent.cpu / 100) * Math.PI * 2;
        ctx.beginPath(); 
        ctx.arc(agent.x, agent.y, radius + 3, -Math.PI / 2, -Math.PI / 2 + cpuAngle); 
        ctx.strokeStyle = agent.cpu > 70 ? '#ff4444' : agent.cpu > 40 ? '#ffaa00' : '#44ff44'; 
        ctx.lineWidth = 2; 
        ctx.stroke();

        // Quantum indicator
        if (agent.quantumEnabled) {
          ctx.beginPath();
          ctx.arc(agent.x + radius - 5, agent.y - radius + 5, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#8a2be2';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Labels
        ctx.fillStyle = '#fff'; 
        ctx.font = agent.type === 'controller' ? 'bold 12px Arial' : '10px Arial'; 
        ctx.textAlign = 'center'; 
        ctx.fillText(agent.name, agent.x, agent.y + radius + 20);

        if (agent.tasks > 0) { 
          ctx.fillStyle = agent.color; 
          ctx.font = 'bold 10px Arial'; 
          ctx.fillText(`${agent.tasks} tasks`, agent.x, agent.y + radius + 35); 
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => { 
      if (animationRef.current) cancelAnimationFrame(animationRef.current); 
    };
  }, [agents, hoveredAgent, selectedAgent, showQuantumLayer]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current; 
    if (!canvas) return; 
    const rect = canvas.getBoundingClientRect(); 
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top; 
    const clicked = agents.find(agent => {
      const radius = agent.type === 'controller' ? 40 : agent.type === 'agent' ? 30 : 20; 
      const dist = Math.hypot(x - agent.x, y - agent.y); 
      return dist <= radius; 
    }); 
    setSelectedAgent(clicked || null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => { 
    const canvas = canvasRef.current; 
    if (!canvas) return; 
    const rect = canvas.getBoundingClientRect(); 
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top; 
    const hovered = agents.find(agent => { 
      const radius = agent.type === 'controller' ? 40 : agent.type === 'agent' ? 30 : 20; 
      const dist = Math.hypot(x - agent.x, y - agent.y); 
      return dist <= radius; 
    }); 
    setHoveredAgent(hovered?.id || null); 
  };

  const getStatusIcon = (status: string) => { 
    switch (status) { 
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />; 
      case 'idle': return <Pause className="w-4 h-4 text-yellow-400" />; 
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />; 
      default: return <Activity className="w-4 h-4 text-gray-400" />; 
    } 
  };

  const totalCPU = agents.length ? agents.reduce((s, a) => s + a.cpu, 0) / agents.length : 0;
  const totalMemory = agents.length ? agents.reduce((s, a) => s + a.memory, 0) / agents.length : 0;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalTasks = agents.reduce((s, a) => s + a.tasks, 0);
  const quantumEnabledAgents = agents.filter(a => a.quantumEnabled).length;

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 overflow-hidden">
      <div className="h-full flex gap-6">

        <div className="w-80 space-y-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Agent Topology</h1>
              <button
                onClick={() => setShowQuantumLayer(!showQuantumLayer)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  showQuantumLayer 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {showQuantumLayer ? (
                  <><Sparkles className="w-3 h-3 inline mr-1" />Quantum On</>
                ) : (
                  <><Network className="w-3 h-3 inline mr-1" />Classical</>
                )}
              </button>
            </div>
            <p className="text-slate-400 text-sm">Real-time monitoring with quantum reasoning</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400" />System Overview</h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">CPU Usage</span>
                  <span className="text-cyan-400 font-bold">{Math.round(totalCPU)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300" style={{ width: `${totalCPU}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Memory</span>
                  <span className="text-purple-400 font-bold">{Math.round(totalMemory)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300" style={{ width: `${totalMemory}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-green-400">{activeAgents}</div>
                  <div className="text-xs text-slate-400">Active Agents</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-yellow-400">{totalTasks}</div>
                  <div className="text-xs text-slate-400">Total Tasks</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-purple-800/30 rounded-xl p-3 border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400">{quantumEnabledAgents}</div>
                  <div className="text-xs text-slate-400">Quantum Enabled</div>
                </div>
                <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 rounded-xl p-3 border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-300">{Math.round(quantumMetrics.avgConfidence * 100)}%</div>
                  <div className="text-xs text-slate-400">Avg Confidence</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex-1 overflow-y-auto scrollbar-hide">
            <h2 className="text-white font-bold mb-3 flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" />All Agents</h2>

            <div className="space-y-2">
              {agents.map(agent => (
                <button 
                  key={agent.id} 
                  onClick={() => setSelectedAgent(agent)} 
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedAgent?.id === agent.id 
                      ? 'bg-white/20 border-2 border-cyan-400' 
                      : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{agent.name}</span>
                    <div className="flex items-center gap-2">
                      {agent.quantumEnabled && <Sparkles className="w-3 h-3 text-purple-400" />}
                      {getStatusIcon(agent.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Cpu className="w-3 h-3" />{agent.cpu}%
                    <span className="mx-1">•</span>
                    <span>{agent.memory}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 relative">
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="text-xs text-slate-400 mb-2">Legend</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/50 border-2 border-cyan-400"/>
                  <span className="text-white">Controller</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/50 border-2 border-purple-400"/>
                  <span className="text-white">Agent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-pink-500/50 border-2 border-pink-400"/>
                  <span className="text-white">Sub-Agent</span>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                  <div className="w-4 h-4 rounded-full bg-purple-400 border border-white"/>
                  <span className="text-white">Quantum Enabled</span>
                </div>
              </div>
            </div>
          </div>

          <canvas ref={canvasRef} onClick={handleCanvasClick} onMouseMove={handleCanvasMouseMove} className="w-full h-full cursor-pointer" />
        </div>

        {selectedAgent && (
          <div className="w-80 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{selectedAgent.name}</h2>
                <div className="flex items-center gap-2">
                  {selectedAgent.quantumEnabled && <Sparkles className="w-4 h-4 text-purple-400" />}
                  {getStatusIcon(selectedAgent.status)}
                  <span className="text-sm text-slate-400 capitalize">{selectedAgent.status}</span>
                </div>
              </div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedAgent.color }} />
            </div>

            <div className="space-y-3">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400"/>
                    <span className="text-sm text-slate-400">CPU</span>
                  </div>
                  <span className="text-lg font-bold text-cyan-400">{selectedAgent.cpu}%</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${selectedAgent.cpu}%` }} />
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Memory</span>
                  </div>
                  <span className="text-lg font-bold text-purple-400">{selectedAgent.memory}%</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${selectedAgent.memory}%` }} />
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400"/>
                    <span className="text-sm text-slate-400">Active Tasks</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-400">{selectedAgent.tasks}</span>
                </div>
              </div>

              {selectedAgent.quantumEnabled && selectedAgent.lastQuantumResponse && (
                <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 rounded-xl p-4 border border-purple-500/20">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400"/>
                    Quantum Metrics
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confidence</span>
                      <span className="text-purple-300 font-bold">{Math.round(selectedAgent.lastQuantumResponse.confidence * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Processing Time</span>
                      <span className="text-purple-300 font-bold">{selectedAgent.lastQuantumResponse.processingTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hypotheses</span>
                      <span className="text-purple-300 font-bold">{selectedAgent.lastQuantumResponse.hypothesisCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Topology Score</span>
                      <span className="text-purple-300 font-bold">{Math.round(selectedAgent.lastQuantumResponse.topologyScore * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-green-400"/>
                Connections
              </h3>
              {selectedAgent.connections.length > 0 ? (
                <div className="space-y-2">
                  {selectedAgent.connections.map((connId: string) => { 
                    const connAgent = agents.find(a => a.id === connId); 
                    return connAgent ? (
                      <div key={connId} className="bg-slate-800/50 rounded-lg p-2 text-sm text-slate-300 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: connAgent.color }} />
                        {connAgent.name}
                        {connAgent.quantumEnabled && <Sparkles className="w-3 h-3 text-purple-400" />}
                      </div>
                    ) : null; 
                  })}
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic">No connections</div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-700/50 space-y-2">
              <button className="w-full py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Play className="w-4 h-4"/>Start
              </button>
              <button className="w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Pause className="w-4 h-4"/>Pause
              </button>
              <button className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Square className="w-4 h-4"/>Stop
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentTopologyDashboard;
