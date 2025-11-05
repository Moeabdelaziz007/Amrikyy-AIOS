import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

export interface SystemStatus {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    upload: number;
    download: number;
  };
  uptime: string;
  services: ServiceStatus[];
}

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  cpu?: number;
  memory?: number;
}

export interface SystemStatusWidgetProps {
  systemStatus: SystemStatus;
  className?: string;
}

const statusColors = {
  running: 'text-green-500 bg-green-100',
  stopped: 'text-yellow-500 bg-yellow-100',
  error: 'text-red-500 bg-red-100',
};

const getStatusIcon = (status: ServiceStatus['status']) => {
  switch (status) {
    case 'running':
      return (
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      );
    case 'stopped':
      return (
        <div className="h-2 w-2 rounded-full bg-yellow-500" />
      );
    case 'error':
      return (
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
      );
  }
};

const ProgressBar: React.FC<{ value: number; max?: number; className?: string }> = ({
  value,
  max = 100,
  className,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={cn('w-full bg-gray-200 rounded-full h-2', className)}>
      <motion.div
        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};

const SystemStatusWidget: React.FC<SystemStatusWidgetProps> = ({
  systemStatus,
  className,
}) => {
  const { cpu, memory, disk, network, uptime, services } = systemStatus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-lg border bg-white p-6 shadow-sm',
        className
      )}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">System Status</h3>
        <p className="text-sm text-gray-500">Uptime: {uptime}</p>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">CPU Usage</span>
            <span className="text-gray-500">{cpu}%</span>
          </div>
          <ProgressBar value={cpu} />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Memory Usage</span>
            <span className="text-gray-500">{memory}%</span>
          </div>
          <ProgressBar value={memory} />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Disk Usage</span>
            <span className="text-gray-500">{disk}%</span>
          </div>
          <ProgressBar value={disk} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="text-xs text-gray-500 mb-1">Network Upload</div>
          <div className="text-sm font-semibold text-gray-900">
            {network.upload} MB/s
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Network Download</div>
          <div className="text-sm font-semibold text-gray-900">
            {network.download} MB/s
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Services</h4>
        <div className="space-y-2">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(service.status)}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {service.name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {service.status}
                  </div>
                </div>
              </div>
              
              {service.cpu !== undefined && service.memory !== undefined && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    CPU: {service.cpu}%
                  </div>
                  <div className="text-xs text-gray-500">
                    MEM: {service.memory}%
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SystemStatusWidget;
