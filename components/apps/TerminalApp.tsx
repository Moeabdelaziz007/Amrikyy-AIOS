import React, { useState, useEffect } from 'react';

const TerminalApp: React.FC = () => {
  const [lines, setLines] = useState<string[]>([]);
  const initialCommands = [
    'Booting Amrikyy AI OS v1.0...',
    'Connecting to AI Core...',
    'Connection successful.',
    'Loading agent modules: Luna, Karim, Scout, Maya...',
    'All systems operational.',
    'Welcome back, user. Type `help` for a list of commands.'
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < initialCommands.length) {
        setLines(prev => [...prev, initialCommands[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div role="log" aria-live="polite" aria-label="Terminal output" className="h-full w-full bg-black rounded-b-md text-green-400 font-mono p-4 text-sm overflow-y-auto">
      {lines.map((line, index) => (
        <p key={index} className="whitespace-pre-wrap">{line}</p>
      ))}
      <div className="flex items-center" aria-hidden="true">
        <span className="text-cyan-400">user@amrikyy-os:~$</span>
        <div className="flex-1 ml-2 h-4 bg-green-400 w-2 animate-pulse" />
      </div>
    </div>
  );
};

export default TerminalApp;