import React, { useState } from 'react';

interface App {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  new?: boolean;
  status?: string;
  color: string;
}

interface AppLauncherProps {
  apps: App[];
  onOpenApp: (appId: string) => void;
  onClose: () => void;
}

const AppLauncher: React.FC<AppLauncherProps> = ({ apps, onOpenApp, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = searchQuery
    ? apps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : apps;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-4xl h-[70vh] bg-slate-900/80 rounded-2xl p-6 border border-slate-700/50 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 mb-4">
          <input
            type="text"
            placeholder="Search for apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredApps.map(app => (
              <div key={app.id} className="relative group cursor-pointer" onClick={() => onOpenApp(app.id)}>
                 {/* Using a simplified AppTile representation for now */}
                <div className="aspect-square bg-slate-800/50 rounded-xl flex flex-col items-center justify-center p-4 hover:bg-slate-700 transition-colors">
                    <div className={`text-4xl mb-2`}>{app.icon}</div>
                    <div className="text-sm text-white text-center font-medium">{app.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLauncher;
