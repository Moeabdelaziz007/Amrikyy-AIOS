import React from 'react';
import { SystemEntity } from '../../types';

const entities: SystemEntity[] = [
    {
        id: 'workflow',
        name: 'Workflow Builder',
        icon: 'account_tree',
        goal: 'Automate Tasks',
        description: 'Visually construct, manage, and deploy complex automation sequences by connecting various agents and apps.',
        workflow: [{icon: 'input', label: 'Trigger'}, {icon: 'arrow_forward', label: ''}, {icon: 'smart_toy', label: 'Agent A'}, {icon: 'arrow_forward', label: ''}, {icon: 'apps', label: 'App B'}, {icon: 'arrow_forward', label: ''}, {icon: 'output', label: ''}],
    },
    {
        id: 'skillForge',
        name: 'Agent Manager',
        icon: 'psychology',
        goal: 'Orchestrate AI',
        description: 'Monitor, configure, and manage all active AI agents. Assign tasks and oversee A2A (agent-to-agent) communications.',
        workflow: [{icon: 'play_circle', label: 'User Command'}, {icon: 'arrow_forward', label: ''}, {icon: 'supervisor_account', label: 'Manager'}, {icon: 'arrow_forward', label: ''}, {icon: 'smart_toy', label: 'Child Agents'}, {icon: 'arrow_forward', label: ''}, {icon: 'task_alt', label: ''}],
    },
    {
        id: 'analyticsHub',
        name: 'Analytics Hub',
        icon: 'insights',
        goal: 'Visualize Data',
        description: 'Access real-time dashboards and reports on system performance, agent efficiency, and data flow across the OS.',
        workflow: [{icon: 'database', label: 'Data Sources'}, {icon: 'arrow_forward', label: ''}, {icon: 'smart_toy', label: 'ETL Agent'}, {icon: 'arrow_forward', label: ''}, {icon: 'dashboard', label: 'Dashboard'}, {icon: 'arrow_forward', label: ''}, {icon: 'monitoring', label: ''}],
    },
    {
        id: 'eventLog',
        name: 'A2A Shield',
        icon: 'security',
        goal: 'Secure Comms',
        description: 'End-to-end encryption and threat detection for all inter-agent communications, ensuring robust security.',
        workflow: [{icon: 'lock', label: 'Encrypt'}, {icon: 'arrow_forward', label: ''}, {icon: 'sync_alt', label: 'Transmit'}, {icon: 'arrow_forward', label: ''}, {icon: 'verified_user', label: 'Verify'}, {icon: 'arrow_forward', label: ''}, {icon: 'lock_open', label: ''}],
    }
]

interface AnalyticsHubAppProps {
    onOpenApp: (appId: any) => void;
}


const AnalyticsHubApp: React.FC<AnalyticsHubAppProps> = ({ onOpenApp }) => {
  return (
    <div className="h-full w-full bg-background-dark/80 rounded-b-xl text-white p-6 overflow-y-auto">
      <h1 className="font-display text-3xl font-bold mb-6">System Analytics & Workflows</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entities.map(entity => (
          <div key={entity.id} onClick={() => onOpenApp(entity.id)} className="glass-effect rounded-xl p-4 flex flex-col gap-3 border border-transparent hover:border-neon-cyan/50 transition-all cursor-pointer">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 bg-gradient-to-br from-neon-cyan/20 to-neon-pink/20 rounded-lg">
                        <span className="material-symbols-outlined text-2xl text-neon-cyan">{entity.icon}</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white/95">{entity.name}</h3>
                        <p className="text-xs text-neon-cyan/80">Primary Goal: {entity.goal}</p>
                    </div>
                </div>
                <button className="text-white/60 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">more_horiz</span></button>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">{entity.description}</p>
            <div className="mt-auto">
                <p className="text-[11px] font-medium text-white/80 mb-1.5">Automation Workflow:</p>
                <div className="flex items-center gap-2 text-xs text-white/60">
                    {entity.workflow.map((step, i) => (
                        <React.Fragment key={i}>
                            <span className="material-symbols-outlined text-sm">{step.icon}</span>
                            {step.label && <span className="hidden sm:inline">{step.label}</span>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsHubApp;