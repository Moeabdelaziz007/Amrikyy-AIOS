import React, { useState, useEffect } from 'react';
import { Settings, Brain, Zap, Shield, Monitor, CheckCircle, AlertCircle, Info, RefreshCw, Save, RotateCcw, Clock } from 'lucide-react';
import { quantumAgentService } from '../services/src/quantumAgentService';
import { QuantumAgentConfig } from '../services/src/quantumAgentService';

interface QuantumConfigurationPanelProps {
  onConfigChange?: (config: QuantumConfig) => void;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
}

const QuantumConfigurationPanel: React.FC<QuantumConfigurationPanelProps> = ({
  onConfigChange,
  showAdvanced = false,
  onToggleAdvanced
}) => {
  const [config, setConfig] = useState<QuantumConfig>(quantumAgentService.getConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [testResults, setTestResults] = useState<{
    quantumEnabled: boolean;
    processingTime: number;
    confidence: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    setConfig(quantumAgentService.getConfig());
  }, []);

  const handleConfigChange = (key: keyof QuantumConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    setHasChanges(true);
    onConfigChange?.(newConfig);
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      quantumAgentService.updateConfig(config);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetConfig = () => {
    const defaultConfig = quantumAgentService.getDefaultConfig();
    setConfig(defaultConfig);
    setHasChanges(true);
    onConfigChange?.(defaultConfig);
  };

  const testQuantumReasoning = async () => {
    try {
      const startTime = Date.now();
      const result = await quantumAgentService.quickQuantumResponse("Test quantum reasoning capabilities");
      const endTime = Date.now();
      
      setTestResults({
        quantumEnabled: config.enable_quantum_reasoning,
        processingTime: endTime - startTime,
        confidence: (result as any).confidence_score || 0.85
      });
    } catch (error) {
      setTestResults({
        quantumEnabled: config.enable_quantum_reasoning,
        processingTime: 0,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const getStatusColor = (value: number, goodThreshold = 0.8, badThreshold = 0.6, inverse = false) => {
    if (inverse) {
      if (value <= goodThreshold) return 'text-green-400';
      if (value <= badThreshold) return 'text-yellow-400';
      return 'text-red-400';
    } else {
      if (value >= goodThreshold) return 'text-green-400';
      if (value >= badThreshold) return 'text-yellow-400';
      return 'text-red-400';
    }
  };

  const getStatusIcon = (value: number, goodThreshold = 0.8, badThreshold = 0.6, inverse = false) => {
    if (inverse) {
      if (value <= goodThreshold) return <CheckCircle className="w-4 h-4 text-green-400" />;
      if (value <= badThreshold) return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    } else {
      if (value >= goodThreshold) return <CheckCircle className="w-4 h-4 text-green-400" />;
      if (value >= badThreshold) return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Quantum Configuration</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleAdvanced?.()}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showAdvanced 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' 
                : 'bg-white/10 text-white/60 hover:bg-white/20 border border-white/20'
            }`}
          >
            Advanced
          </button>
          <button
            onClick={resetConfig}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4 text-white/60" />
          </button>
          <button
            onClick={saveConfig}
            disabled={isSaving || !hasChanges}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              isSaving || !hasChanges
                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Basic Configuration */}
      <div className="space-y-4">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Basic Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Enable Quantum Reasoning */}
          <div className="bg-black/60 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium">Enable Quantum Reasoning</span>
              </div>
              <button
                onClick={() => handleConfigChange('enable_quantum_reasoning', !config.enable_quantum_reasoning)}
                className={`w-12 h-6 rounded-full transition-all ${
                  config.enable_quantum_reasoning 
                    ? 'bg-purple-500 border-purple-400' 
                    : 'bg-gray-600 border-gray-500'
                }`}
              >
                <div className={`w-5 h-5 rounded-full transition-all ${
                  config.enable_quantum_reasoning 
                    ? 'bg-white translate-x-1/4' 
                    : 'bg-gray-400 translate-x-0'
                }`} />
              </button>
            </div>
            <p className="text-sm text-white/60">
              Enable quantum-enhanced reasoning for improved decision making and hypothesis generation.
            </p>
          </div>

          {/* Confidence Threshold */}
          <div className="bg-black/60 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">Confidence Threshold</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={config.confidence_threshold}
                  onChange={(e) => handleConfigChange('confidence_threshold', parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className={`text-sm font-medium ${getStatusColor(config.confidence_threshold)}`}>
                  {Math.round(config.confidence_threshold * 100)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-white/60">
              Minimum confidence level required for quantum reasoning results to be accepted.
            </p>
          </div>

          {/* Max Hypotheses */}
          <div className="bg-black/60 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">Max Hypotheses</span>
              </div>
              <select
                value={config.max_hypotheses}
                onChange={(e) => handleConfigChange('max_hypotheses', parseInt(e.target.value))}
                className="bg-black/40 border border-white/20 rounded px-3 py-1 text-sm text-white"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={7}>7</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>
            <p className="text-sm text-white/60">
              Maximum number of hypotheses to generate during quantum reasoning.
            </p>
          </div>

          {/* Show Alternatives */}
          <div className="bg-black/60 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">Show Alternatives</span>
              </div>
              <button
                onClick={() => handleConfigChange('show_alternatives', !config.show_alternatives)}
                className={`w-12 h-6 rounded-full transition-all ${
                  config.show_alternatives 
                    ? 'bg-purple-500 border-purple-400' 
                    : 'bg-gray-600 border-gray-500'
                }`}
              >
                <div className={`w-5 h-5 rounded-full transition-all ${
                  config.show_alternatives 
                    ? 'bg-white translate-x-1/4' 
                    : 'bg-gray-400 translate-x-0'
                }`} />
              </button>
            </div>
            <p className="text-sm text-white/60">
              Display alternative hypotheses and reasoning paths in the results.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Configuration */}
      {showAdvanced && (
        <div className="space-y-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            Advanced Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Processing Time Limit */}
            <div className="bg-black/60 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium">Processing Time Limit</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="100"
                    max="5000"
                    step="100"
                    value={config.processing_time_limit}
                    onChange={(e) => handleConfigChange('processing_time_limit', parseInt(e.target.value))}
                    className="w-20 bg-black/40 border border-white/20 rounded px-2 py-1 text-sm text-white"
                  />
                  <span className="text-sm text-white/60">ms</span>
                </div>
              </div>
              <p className="text-sm text-white/60">
                Maximum allowed processing time for quantum reasoning operations.
              </p>
            </div>

            {/* Enable Topology Validation */}
            <div className="bg-black/60 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-white font-medium">Enable Topology Validation</span>
                </div>
                <button
                  onClick={() => handleConfigChange('enable_topology_validation', !config.enable_topology_validation)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    config.enable_topology_validation 
                      ? 'bg-purple-500 border-purple-400' 
                      : 'bg-gray-600 border-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full transition-all ${
                    config.enable_topology_validation 
                      ? 'bg-white translate-x-1/4' 
                      : 'bg-gray-400 translate-x-0'
                  }`} />
                </button>
              </div>
              <p className="text-sm text-white/60">
                Validate agent topology consistency during quantum reasoning.
              </p>
            </div>

            {/* Enable Performance Monitoring */}
            <div className="bg-black/60 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium">Performance Monitoring</span>
                </div>
                <button
                  onClick={() => handleConfigChange('enable_performance_monitoring', !config.enable_performance_monitoring)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    config.enable_performance_monitoring 
                      ? 'bg-purple-500 border-purple-400' 
                      : 'bg-gray-600 border-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full transition-all ${
                    config.enable_performance_monitoring 
                      ? 'bg-white translate-x-1/4' 
                      : 'bg-gray-400 translate-x-0'
                  }`} />
                </button>
              </div>
              <p className="text-sm text-white/60">
                Monitor and track quantum reasoning performance metrics.
              </p>
            </div>

            {/* Enable Fallback Mechanism */}
            <div className="bg-black/60 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">Enable Fallback Mechanism</span>
                </div>
                <button
                  onClick={() => handleConfigChange('enable_fallback_mechanism', !config.enable_fallback_mechanism)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    config.enable_fallback_mechanism 
                      ? 'bg-purple-500 border-purple-400' 
                      : 'bg-gray-600 border-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full transition-all ${
                    config.enable_fallback_mechanism 
                      ? 'bg-white translate-x-1/4' 
                      : 'bg-gray-400 translate-x-0'
                  }`} />
                </button>
              </div>
              <p className="text-sm text-white/60">
                Automatically fall back to classical reasoning if quantum processing fails.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test Section */}
      <div className="space-y-4">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Test Configuration
        </h3>

        <div className="bg-black/60 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/60">
                Test the current quantum reasoning configuration with a sample query.
              </span>
            </div>
            <button
              onClick={testQuantumReasoning}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Test Quantum Reasoning
            </button>
          </div>

          {testResults && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Quantum Status</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.confidence)}
                  <span className={`text-sm font-medium ${
                    testResults.quantumEnabled ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {testResults.quantumEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Processing Time</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.processingTime, 500, 1000, true)}
                  <span className={`text-sm font-medium ${getStatusColor(testResults.processingTime, 500, 1000, true)}`}>
                    {testResults.processingTime}ms
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Confidence Score</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.confidence)}
                  <span className={`text-sm font-medium ${getStatusColor(testResults.confidence)}`}>
                    {Math.round(testResults.confidence * 100)}%
                  </span>
                </div>
              </div>

              {testResults.error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-300">{testResults.error}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuantumConfigurationPanel;
