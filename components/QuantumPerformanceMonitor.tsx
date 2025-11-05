import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Clock, Brain, Zap, CheckCircle, AlertCircle, BarChart3, LineChart } from 'lucide-react';
import { quantumAgentService } from '../services/src/quantumAgentService';

interface QuantumMetrics {
  avgConfidence: number;
  avgProcessingTime: number;
  quantumUsageRate: number;
  topologiesValidated: number;
  lastHypothesesCount: number;
  reasoningQuality: number;
}

interface PerformanceData {
  timestamp: string;
  avgConfidence: number;
  avgProcessingTime: number;
  quantumUsageRate: number;
  totalRequests: number;
  successfulRequests: number;
  topologiesValidated: number;
}

interface QuantumPerformanceMonitorProps {
  realTime?: boolean;
  onMetricsUpdate?: (metrics: QuantumMetrics) => void;
}

const QuantumPerformanceMonitor: React.FC<QuantumPerformanceMonitorProps> = ({
  realTime = true,
  onMetricsUpdate
}) => {
  const [metrics, setMetrics] = useState<QuantumMetrics>({
    avgConfidence: 0.85,
    avgProcessingTime: 245,
    quantumUsageRate: 0.78,
    topologiesValidated: 12,
    lastHypothesesCount: 5,
    reasoningQuality: 0.92
  });

  const [performanceHistory, setPerformanceHistory] = useState<PerformanceData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('6h');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!realTime) return;

    const interval = setInterval(() => {
      const currentMetrics = quantumAgentService.analyzePerformance([]);
      setMetrics(currentMetrics);
      setPerformanceHistory(prev => {
        const newData: PerformanceData = {
          timestamp: new Date().toISOString(),
          avgConfidence: currentMetrics.avgConfidence,
          avgProcessingTime: currentMetrics.avgProcessingTime,
          quantumUsageRate: currentMetrics.quantumUsageRate,
          totalRequests: Math.floor(Math.random() * 50) + 10,
          successfulRequests: Math.floor((currentMetrics.quantumUsageRate * (Math.floor(Math.random() * 50) + 10))),
          topologiesValidated: currentMetrics.topologiesValidated
        };
        
        const updated = [...prev.slice(-50), newData];
        onMetricsUpdate?.(currentMetrics);
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [realTime, onMetricsUpdate]);

  const getFilteredHistory = () => {
    const now = new Date();
    const cutoffs = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '6h': new Date(now.getTime() - 6 * 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    };

    return performanceHistory.filter(data => new Date(data.timestamp) >= cutoffs[selectedTimeRange]);
  };

  const getConfidenceTrend = () => {
    if (performanceHistory.length < 2) return 'stable';
    const recent = getFilteredHistory();
    if (recent.length < 2) return 'stable';
    
    const latest = recent[recent.length - 1].avgConfidence;
    const previous = recent[recent.length - 2].avgConfidence;
    
    if (latest > previous + 0.05) return 'improving';
    if (latest < previous - 0.05) return 'declining';
    return 'stable';
  };

  const getPerformanceTrend = () => {
    if (performanceHistory.length < 2) return 'stable';
    const recent = getFilteredHistory();
    if (recent.length < 2) return 'stable';
    
    const latest = recent[recent.length - 1].avgProcessingTime;
    const previous = recent[recent.length - 2].avgProcessingTime;
    
    if (latest < previous - 10) return 'improving';
    if (latest > previous + 10) return 'declining';
    return 'stable';
  };

  const getConfidenceColor = (value: number) => {
    if (value >= 0.9) return 'text-green-400';
    if (value >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceColor = (value: number, inverse = false) => {
    const threshold = 300;
    if (inverse) {
      if (value <= threshold * 0.8) return 'text-green-400';
      if (value <= threshold) return 'text-yellow-400';
      return 'text-red-400';
    } else {
      if (value <= threshold * 0.8) return 'text-green-400';
      if (value <= threshold) return 'text-yellow-400';
      return 'text-red-400';
    }
  };

  const confidenceTrend = getConfidenceTrend();
  const performanceTrend = getPerformanceTrend();

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Quantum Performance Monitor</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${metrics.avgConfidence >= 0.8 ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <span className="text-xs text-white/60">System Status</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-800/30 to-purple-900/30 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Avg Confidence</span>
          </div>
          <div className="flex items-center justify-between">
            <div className={`text-2xl font-bold ${getConfidenceColor(metrics.avgConfidence)}`}>
              {Math.round(metrics.avgConfidence * 100)}%
            </div>
            {confidenceTrend !== 'stable' && (
              <div className={`flex items-center gap-1 text-xs ${
                confidenceTrend === 'improving' ? 'text-green-400' : 'text-red-400'
              }`}>
                {confidenceTrend === 'improving' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-800/30 to-blue-900/30 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Avg Processing Time</span>
          </div>
          <div className="flex items-center justify-between">
            <div className={`text-2xl font-bold ${getPerformanceColor(metrics.avgProcessingTime, true)}`}>
              {metrics.avgProcessingTime}ms
            </div>
            {performanceTrend !== 'stable' && (
              <div className={`flex items-center gap-1 text-xs ${
                performanceTrend === 'improving' ? 'text-green-400' : 'text-red-400'
              }`}>
                {performanceTrend === 'improving' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-800/30 to-green-900/30 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300">Quantum Usage Rate</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-300">
              {Math.round(metrics.quantumUsageRate * 100)}%
            </div>
            <div className="w-16 h-2 bg-black/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
                style={{ width: `${metrics.quantumUsageRate * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-800/30 to-yellow-900/30 rounded-xl p-4 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-300">Topologies Validated</span>
          </div>
          <div className="text-2xl font-bold text-yellow-300">
            {metrics.topologiesValidated}
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-800/30 to-pink-900/30 rounded-xl p-4 border border-pink-500/20">
          <div className="flex items-center gap-2 mb-2">
            <LineChart className="w-4 h-4 text-pink-400" />
            <span className="text-sm text-pink-300">Reasoning Quality</span>
          </div>
          <div className="text-2xl font-bold text-pink-300">
            {Math.round(metrics.reasoningQuality * 100)}%
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      {isExpanded && performanceHistory.length > 1 && (
        <div className="bg-black/60 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <LineChart className="w-5 h-5 text-purple-400" />
              Performance History
            </h3>
            <div className="flex gap-2">
              {(['1h', '6h', '24h', '7d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedTimeRange === range 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-48 bg-black/40 rounded-lg p-4">
            <div className="h-full flex items-end justify-around gap-2">
              {getFilteredHistory().slice(-20).map((data, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-1"
                >
                  <div 
                    className="w-2 bg-purple-400 rounded-t"
                    style={{ 
                      height: `${data.avgConfidence * 40}px`,
                      opacity: 0.8
                    }}
                  />
                  <div className="text-xs text-white/60 text-center mt-1">
                    {Math.round(data.avgConfidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Health */}
      <div className="bg-black/60 rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-purple-400" />
          System Health
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Quantum Engine Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-green-300">Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">API Response Rate</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-green-300">98.5%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Error Rate</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-green-300">1.5%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Last Update</span>
            <span className="text-sm text-white/60">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumPerformanceMonitor;
