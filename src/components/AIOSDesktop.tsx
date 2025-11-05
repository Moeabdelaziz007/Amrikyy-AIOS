import React, { useState } from 'react';
import { useOS } from '../contexts/OSContext';
import DesktopBackground from './desktop/DesktopBackground';
import DesktopHeader from './desktop/DesktopHeader';
import Taskbar from './desktop/Taskbar';
import AppLauncher from './desktop/AppLauncher';
import Window from './Window'; // Assuming this is your Window component

const AIOSDesktop: React.FC = () => {
  const { windows, settings, openWindow, closeWindow, focusWindow, minimizeWindow } = useOS();
  const [isAppLauncherOpen, setIsAppLauncherOpen] = useState(false);

  // Dummy data for now
  const apps = [
    { id: 'video-creator', name: 'Video Creator', icon: '🎬', color: 'from-purple-500 to-pink-500', category: 'creative', new: true, description: 'AI-powered video generation' },
    { id: 'agent-forge', name: 'Agent Forge', icon: '🔧', color: 'from-cyan-500 to-blue-500', category: 'ai', new: true, description: 'Build custom AI agents' },
  ];

  return (
    <div className="w-screen h-screen overflow-hidden bg-black font-sans">
      <DesktopBackground theme={settings.theme} />
      
      <div className="relative z-10 h-full flex flex-col p-6">
        <DesktopHeader theme={settings.theme} />

        <main className="flex-1 overflow-y-auto">
          {/* App Grid can be a new component */}
        </main>

        {windows.map(window => (
          <Window
            key={window.id}
            {...window} // Pass all window properties
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
          >
            {/* The content of the window will be determined by window.appId */}
          </Window>
        ))}

        {isAppLauncherOpen && <AppLauncher apps={apps} onOpenApp={openWindow} onClose={() => setIsAppLauncherOpen(false)} />}

        <Taskbar theme={settings.theme} />
      </div>
    </div>
  );
};

export default AIOSDesktop;
