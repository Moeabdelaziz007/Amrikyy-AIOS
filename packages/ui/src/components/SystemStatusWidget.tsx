import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

interface SystemStatusWidgetProps {
  cpuUsage: number; // 0-100
  memoryUsage: number; // 0-100
  fps: number;
}

const StatusBar: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
  <div className="w-full bg-muted rounded-full h-2.5">
    <motion.div
      className={cn("h-2.5 rounded-full", className)}
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

export const SystemStatusWidget: React.FC<SystemStatusWidgetProps> = ({ cpuUsage, memoryUsage, fps }) => {
  return (
    <div className="p-4 rounded-lg bg-card border border-border w-full max-w-xs">
      <h4 className="font-semibold text-card-foreground mb-3">System Status</h4>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>CPU</span>
            <span>{cpuUsage.toFixed(0)}%</span>
          </div>
          <StatusBar value={cpuUsage} className="bg-primary" />
        </div>
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Memory</span>
            <span>{memoryUsage.toFixed(0)}%</span>
          </div>
          <StatusBar value={memoryUsage} className="bg-accent" />
        </div>
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>UI FPS</span>
            <span>{fps}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
