import React, { useState } from 'react';
import { Brain, Sparkles, Clock, CheckCircle, AlertCircle, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { ReasoningTrace, Hypothesis, TopologyValidation } from '../packages/quantum-reasoning/src/index';

interface QuantumReasoningTracesProps {
  traces: ReasoningTrace[];
  hypotheses: Hypothesis[];
  topologyValidation: TopologyValidation;
  bestHypothesis: Hypothesis;
  confidenceScore: number;
  processingTime: number;
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

const QuantumReasoningTraces: React.FC<QuantumReasoningTracesProps> = ({
  traces,
  hypotheses,
  topologyValidation,
  bestHypothesis,
  confidenceScore,
  processingTime,
  showDetails = false,
  onToggleDetails
}) => {
  const [expandedTrace, setExpandedTrace] = useState<number | null>(null);
  const [showHypotheses, setShowHypotheses] = useState(false);
  const [showTopology, setShowTopology] = useState(false);

  const getStepIcon = (stepType: ReasoningTrace['step_type']) => {
    switch (stepType) {
      case 'exploration':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'analysis':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'validation':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'synthesis':
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStepColor = (stepType: ReasoningTrace['step_type']) => {
    switch (stepType) {
      case 'exploration':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'analysis':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'validation':
        return 'border-green-500/30 bg-green-500/10';
      case 'synthesis':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTopologyScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Quantum Reasoning Analysis</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            confidenceScore >= 0.8 ? 'bg-green-500/20 text-green-300' :
            confidenceScore >= 0.6 ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-red-500/20 text-red-300'
          }`}>
            {Math.round(confidenceScore * 100)}% Confidence
          </span>
          <button
            onClick={onToggleDetails}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {showDetails ? <EyeOff className="w-4 h-4 text-white/60" /> : <Eye className="w-4 h-4 text-white/60" />}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-800/30 to-purple-900/30 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Processing Time</span>
          </div>
          <div className="text-2xl font-bold text-purple-300">{processingTime}ms</div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-800/30 to-blue-900/30 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Hypotheses</span>
          </div>
          <div className="text-2xl font-bold text-blue-300">{hypotheses.length}</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-800/30 to-green-900/30 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300">Topology Score</span>
          </div>
          <div className={`text-2xl font-bold ${getTopologyScoreColor(topologyValidation.overall_score)}`}>
            {Math.round(topologyValidation.overall_score * 100)}%
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-800/30 to-yellow-900/30 rounded-xl p-4 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-300">Best Confidence</span>
          </div>
          <div className={`text-2xl font-bold ${getConfidenceColor(bestHypothesis.confidence)}`}>
            {Math.round(bestHypothesis.confidence * 100)}%
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Reasoning Traces */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Reasoning Traces
            </h3>
            <div className="space-y-3">
              {traces.map((trace, index) => (
                <div
                  key={index}
                  className={`border rounded-xl p-4 transition-all cursor-pointer ${getStepColor(trace.step_type)}`}
                  onClick={() => setExpandedTrace(expandedTrace === index ? null : index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStepIcon(trace.step_type)}
                      <span className="text-white font-medium">Step {trace.step_number}: {trace.step_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {trace.confidence_delta && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          trace.confidence_delta > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {trace.confidence_delta > 0 ? '+' : ''}{Math.round(trace.confidence_delta * 100)}%
                        </span>
                      )}
                      <span className="text-xs text-white/60">
                        {new Date(trace.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-white/80 text-sm mb-2">{trace.description}</p>
                  
                  {expandedTrace === index && (
                    <div className="mt-3 space-y-2 pt-3 border-t border-white/10">
                      {trace.input_data && (
                        <div>
                          <span className="text-xs text-white/60">Input Data:</span>
                          <pre className="text-xs text-white/80 bg-black/40 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(trace.input_data, null, 2)}
                          </pre>
                        </div>
                      )}
                      {trace.output_data && (
                        <div>
                          <span className="text-xs text-white/60">Output Data:</span>
                          <pre className="text-xs text-white/80 bg-black/40 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(trace.output_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hypotheses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Generated Hypotheses
              </h3>
              <button
                onClick={() => setShowHypotheses(!showHypotheses)}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm text-white/80"
              >
                {showHypotheses ? 'Hide' : 'Show'} ({hypotheses.length})
              </button>
            </div>
            
            {showHypotheses && (
              <div className="space-y-3">
                {hypotheses.map((hypothesis, index) => (
                  <div
                    key={hypothesis.id}
                    className={`border rounded-xl p-4 transition-all ${
                      hypothesis.id === bestHypothesis.id
                        ? 'border-yellow-500/50 bg-yellow-500/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{hypothesis.title}</span>
                        {hypothesis.id === bestHypothesis.id && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">Best</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getConfidenceColor(hypothesis.confidence)}`}>
                          {Math.round(hypothesis.confidence * 100)}%
                        </span>
                        {hypothesis.validation_status && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            hypothesis.validation_status === 'validated' ? 'bg-green-500/20 text-green-300' :
                            hypothesis.validation_status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {hypothesis.validation_status}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-white/80 text-sm mb-2">{hypothesis.description}</p>
                    
                    <div className="text-xs text-white/60 space-y-1">
                      <div><strong>Reasoning:</strong> {hypothesis.reasoning}</div>
                      {hypothesis.evidence.length > 0 && (
                        <div>
                          <strong>Evidence:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {hypothesis.evidence.map((evidence, i) => (
                              <li key={i}>{evidence}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {hypothesis.topology_score && (
                        <div><strong>Topology Score:</strong> {Math.round(hypothesis.topology_score * 100)}%</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Topology Validation */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Topology Validation
              </h3>
              <button
                onClick={() => setShowTopology(!showTopology)}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm text-white/80"
              >
                {showTopology ? 'Hide' : 'Show'} Details
              </button>
            </div>
            
            {showTopology && (
              <div className="bg-green-800/20 rounded-xl p-4 border border-green-500/20 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-green-300">Connectivity</span>
                    <div className={`text-lg font-bold ${getTopologyScoreColor(topologyValidation.connectivity_score)}`}>
                      {Math.round(topologyValidation.connectivity_score * 100)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-green-300">Consistency</span>
                    <div className={`text-lg font-bold ${getTopologyScoreColor(topologyValidation.consistency_score)}`}>
                      {Math.round(topologyValidation.consistency_score * 100)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-green-300">Completeness</span>
                    <div className={`text-lg font-bold ${getTopologyScoreColor(topologyValidation.completeness_score)}`}>
                      {Math.round(topologyValidation.completeness_score * 100)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-green-300">Overall Score</span>
                    <div className={`text-lg font-bold ${getTopologyScoreColor(topologyValidation.overall_score)}`}>
                      {Math.round(topologyValidation.overall_score * 100)}%
                    </div>
                  </div>
                </div>
                
                {topologyValidation.identified_gaps.length > 0 && (
                  <div>
                    <span className="text-sm text-green-300 font-medium">Identified Gaps:</span>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {topologyValidation.identified_gaps.map((gap, index) => (
                        <li key={index} className="text-sm text-white/80">{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {topologyValidation.recommendations.length > 0 && (
                  <div>
                    <span className="text-sm text-green-300 font-medium">Recommendations:</span>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {topologyValidation.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-white/80">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuantumReasoningTraces;
