import React from 'react';

const HubShell: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-md text-white">
      <header className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <input placeholder="Search this hub" className="bg-black/20 p-2 rounded-md" />
          <button className="px-3 py-1 rounded bg-white/5">Help</button>
        </div>
      </header>
      <main className="p-4 flex-grow overflow-auto">{children}</main>
    </div>
  );
};

export default HubShell;

