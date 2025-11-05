import React, { useState, useEffect } from 'react';
import { CustomAgent } from '../../types';
import { skills } from '../../data/skills';
import { quantumAgentService } from '../../services/src/quantumAgentService';
import { Brain, Sparkles, Settings, TrendingUp } from 'lucide-react';
import QuantumReasoningTraces from '../QuantumReasoningTraces';
import { QuantumReasoningResult } from '../../packages/quantum-reasoning/src/index';

interface AgentProfileAppProps {
  agent: CustomAgent;
}

const AgentProfileApp: React.FC<AgentProfileAppProps> = ({ agent }) => {
  const equippedSkills = skills.filter(s => agent.skillIDs.includes(s.id));
  const [showQuantumPanel, setShowQuantumPanel] = useState(false);
  const [quantumConfig, setQuantumConfig] = useState(quantumAgentService.getConfig());
  const [lastQuantumResult, setLastQuantumResult] = useState<QuantumReasoningResult | null>(null);
  const [isQuantumEnabled, setIsQuantumEnabled] = useState(quantumConfig.enable_quantum_reasoning);

  // Simplified hologram effect for custom agents
  const glowColor = '#00f0ff'; // Default cyan
  const aberrationColors = ['#00f0ff', '#f000b8']; // Cyan, Pink

  useEffect(() => {
    setQuantumConfig(quantumAgentService.getConfig());
    setIsQuantumEnabled(quantumAgentService.getConfig().enable_quantum_reasoning);
  }, []);

  const handleQuantumTest = async () => {
    try {
      const testPrompt = `Analyze the capabilities and potential of ${agent.name}, a ${agent.role} AI agent.`;
      const result = await quantumAgentService.quickQuantumResponse(testPrompt);
      setLastQuantumResult(result as unknown as QuantumReasoningResult);
    } catch (error) {
      console.error('Quantum reasoning test failed:', error);
    }
  };

  const toggleQuantumReasoning = () => {
    const newConfig = { ...quantumConfig, enable_quantum_reasoning: !isQuantumEnabled };
    quantumAgentService.updateConfig(newConfig);
    setQuantumConfig(newConfig);
    setIsQuantumEnabled(!isQuantumEnabled);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-bg-tertiary rounded-b-md text-white p-6 gap-6 overflow-y-auto">
        <div className="max-w-md w-full">
            <div 
                className={`relative p-5 rounded-xl overflow-hidden border border-white/10 bg-black/20 animate-hologram-glow`}
                style={{ '--glow-color': glowColor } as React.CSSProperties}
            >
                <div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                    style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${glowColor}1A 2px, ${glowColor}1A 4px)` }}
                />
                 <div 
                    className="relative z-10 animate-hologram-flicker"
                    style={{ filter: `drop-shadow(2px 0 0 ${aberrationColors[0]}70) drop-shadow(-2px 0 0 ${aberrationColors[1]}70)` }}
                >
                    <div className={`flex items-center justify-between mb-4 text-primary-cyan`} style={{ textShadow: `0 0 5px ${glowColor}, 0 0 10px ${glowColor}`}}>
                        <h2 className="text-xl font-bold tracking-widest">{agent.name.toUpperCase()}</h2>
                        <span className="text-4xl">{agent.icon}</span>
                    </div>
                </div>
            </div>
        </div>
        <div className="text-center max-w-md">
            <h1 className="font-display text-3xl font-bold">{agent.name}</h1>
            <p className="text-primary-cyan font-semibold">{agent.role}</p>
        </div>
        {/* Quantum Reasoning Panel */}
        <div className="max-w-md w-full mt-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-display flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    Quantum Reasoning
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleQuantumReasoning}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            isQuantumEnabled 
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' 
                                : 'bg-white/10 text-white/60 hover:bg-white/20 border border-white/20'
                        }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        {isQuantumEnabled ? 'Quantum On' : 'Quantum Off'}
                    </button>
                    <button
                        onClick={() => setShowQuantumPanel(!showQuantumPanel)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <Settings className="w-4 h-4 text-white/60" />
                    </button>
                </div>
            </div>

            {/* Quantum Configuration */}
            {showQuantumPanel && (
                <div className="bg-purple-800/20 rounded-xl p-4 border border-purple-500/20 space-y-3">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-purple-400" />
                        Configuration
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-300">Enable Quantum Reasoning</span>
                            <button
                                onClick={toggleQuantumReasoning}
                                className={`w-12 h-6 rounded-full transition-all ${
                                    isQuantumEnabled 
                                        ? 'bg-purple-500 border-purple-400' 
                                        : 'bg-gray-600 border-gray-500'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full transition-all ${
                                    isQuantumEnabled 
                                        ? 'bg-white translate-x-1/4' 
                                        : 'bg-gray-400 translate-x-0'
                                }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-300">Confidence Threshold</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1.0"
                                    step="0.1"
                                    value={quantumConfig.confidence_threshold}
                                    onChange={(e) => {
                                        const newConfig = { ...quantumConfig, confidence_threshold: parseFloat(e.target.value) };
                                        quantumAgentService.updateConfig(newConfig);
                                        setQuantumConfig(newConfig);
                                    }}
                                    className="w-20"
                                />
                                <span className="text-sm text-purple-300 w-10">{Math.round(quantumConfig.confidence_threshold * 100)}%</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-300">Max Hypotheses</span>
                            <select
                                value={quantumConfig.max_hypotheses}
                                onChange={(e) => {
                                    const newConfig = { ...quantumConfig, max_hypotheses: parseInt(e.target.value) };
                                    quantumAgentService.updateConfig(newConfig);
                                    setQuantumConfig(newConfig);
                                }}
                                className="bg-black/40 border border-purple-500/30 rounded px-2 py-1 text-sm text-purple-300"
                            >
                                <option value={3}>3</option>
                                <option value={5}>5</option>
                                <option value={7}>7</option>
                                <option value={10}>10</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-300">Show Alternatives</span>
                            <button
                                onClick={() => {
                                    const newConfig = { ...quantumConfig, show_alternatives: !quantumConfig.show_alternatives };
                                    quantumAgentService.updateConfig(newConfig);
                                    setQuantumConfig(newConfig);
                                }}
                                className={`w-12 h-6 rounded-full transition-all ${
                                    quantumConfig.show_alternatives 
                                        ? 'bg-purple-500 border-purple-400' 
                                        : 'bg-gray-600 border-gray-500'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full transition-all ${
                                    quantumConfig.show_alternatives 
                                        ? 'bg-white translate-x-1/4' 
                                        : 'bg-gray-400 translate-x-0'
                                }`} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="pt-3 border-t border-purple-500/30">
                        <button
                            onClick={handleQuantumTest}
                            className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Test Quantum Reasoning
                        </button>
                    </div>
                </div>
            )}

            {/* Quantum Results */}
            {lastQuantumResult && (
                <QuantumReasoningTraces
                    traces={lastQuantumResult.reasoning_traces}
                    hypotheses={lastQuantumResult.hypotheses}
                    topologyValidation={lastQuantumResult.topology_validation}
                    bestHypothesis={lastQuantumResult.best_hypothesis}
                    confidenceScore={lastQuantumResult.confidence_score}
                    processingTime={lastQuantumResult.processing_time}
                    showDetails={showQuantumPanel}
                    onToggleDetails={() => setShowQuantumPanel(!showQuantumPanel)}
                />
            )}
        </div>

        <div className="max-w-md w-full mt-4">
            <h2 className="text-xl font-bold font-display text-center mb-3">Equipped Skills</h2>
            <div className="flex justify-center flex-wrap gap-4 p-4 bg-black/20 rounded-lg border border-white/10">
                {equippedSkills.map(skill => {
                    const Icon = skill.icon;
                    return (
                        <div key={skill.id} title={skill.name} className="flex flex-col items-center gap-2 text-text-secondary hover:text-text-primary transition-colors w-20 text-center">
                            <Icon className="w-10 h-10" />
                            <span className="text-xs">{skill.name}</span>
                        </div>
                    );
                })}
                 {equippedSkills.length === 0 && <p className="text-sm text-text-muted">No skills equipped.</p>}
            </div>
        </div>
    </div>
  );
};

export default AgentProfileApp;
