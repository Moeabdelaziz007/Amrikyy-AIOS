import React, { useState, useEffect, useRef } from 'react';
import { executeCode } from '../../services/geminiAdvancedService';
import { SparklesIcon } from '../Icons';

interface CommandHistory {
  command: string;
  output: string;
  timestamp: number;
  type: 'info' | 'success' | 'error' | 'code';
}

/**
 * Enhanced TerminalApp with Gemini Code Execution
 * Based on: https://ai.google.dev/gemini-api/docs/code-execution
 * 
 * Features:
 * - Execute Python and JavaScript code
 * - AI-powered code assistance
 * - Command history
 */
const TerminalApp: React.FC = () => {
  const [lines, setLines] = useState<CommandHistory[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [codeMode, setCodeMode] = useState<'python' | 'javascript'>('python');
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const initialCommands = [
    'Booting Amrikyy AI OS v2.0 with Gemini Code Execution...',
    'Connecting to AI Core...',
    'Connection successful.',
    'Loading agent modules: Luna, Karim, Scout, Maya...',
    'Code execution environment ready (Python, JavaScript).',
    'All systems operational.',
    'Type `help` for commands or start coding!'
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < initialCommands.length) {
        setLines(prev => [...prev, {
          command: '',
          output: initialCommands[i],
          timestamp: Date.now(),
          type: 'info'
        }]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const handleCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    const trimmedCmd = cmd.trim();
    setCurrentInput('');
    
    // Add command to history
    setLines(prev => [...prev, {
      command: trimmedCmd,
      output: '',
      timestamp: Date.now(),
      type: 'info'
    }]);

    // Handle built-in commands
    if (trimmedCmd === 'help') {
      setLines(prev => [...prev, {
        command: '',
        output: `Available commands:
  help              - Show this help message
  clear             - Clear terminal
  python            - Switch to Python mode
  javascript        - Switch to JavaScript mode
  mode              - Show current code execution mode
  
Code Execution (powered by Gemini):
  Simply type Python or JavaScript code to execute it!
  
Examples:
  print("Hello, World!")
  for i in range(5): print(i)
  console.log("Hello from JS")`,
        timestamp: Date.now(),
        type: 'success'
      }]);
    } else if (trimmedCmd === 'clear') {
      setLines([]);
    } else if (trimmedCmd === 'python') {
      setCodeMode('python');
      setLines(prev => [...prev, {
        command: '',
        output: 'Switched to Python mode',
        timestamp: Date.now(),
        type: 'success'
      }]);
    } else if (trimmedCmd === 'javascript' || trimmedCmd === 'js') {
      setCodeMode('javascript');
      setLines(prev => [...prev, {
        command: '',
        output: 'Switched to JavaScript mode',
        timestamp: Date.now(),
        type: 'success'
      }]);
    } else if (trimmedCmd === 'mode') {
      setLines(prev => [...prev, {
        command: '',
        output: `Current mode: ${codeMode}`,
        timestamp: Date.now(),
        type: 'info'
      }]);
    } else {
      // Execute as code
      setIsExecuting(true);
      try {
        const result = await executeCode(trimmedCmd, codeMode);
        setLines(prev => [...prev, {
          command: '',
          output: result.error || result.output || 'Executed successfully',
          timestamp: Date.now(),
          type: result.error ? 'error' : 'code'
        }]);
      } catch (error: any) {
        setLines(prev => [...prev, {
          command: '',
          output: `Error: ${error.message}`,
          timestamp: Date.now(),
          type: 'error'
        }]);
      } finally {
        setIsExecuting(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
    }
  };

  const getPrompt = () => {
    const modeIcon = codeMode === 'python' ? '🐍' : '⚡';
    return `${modeIcon} user@amrikyy-os [${codeMode}]:~$`;
  };

  return (
    <div 
      ref={terminalRef}
      role="log" 
      aria-live="polite" 
      aria-label="Terminal output" 
      className="h-full w-full bg-black rounded-b-md text-green-400 font-mono p-4 text-sm overflow-y-auto"
    >
      {/* Header */}
      <div className="mb-4 pb-2 border-b border-green-400/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 font-bold">Gemini Code Execution Terminal</span>
        </div>
        <div className="text-xs">
          <span className="px-2 py-1 bg-cyan-500/20 rounded text-cyan-400">
            {codeMode.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Command history */}
      {lines.map((line, index) => (
        <div key={index} className="mb-1">
          {line.command && (
            <div className="flex items-start">
              <span className="text-cyan-400 mr-2">{getPrompt()}</span>
              <span className="text-white">{line.command}</span>
            </div>
          )}
          {line.output && (
            <pre className={`whitespace-pre-wrap ml-2 ${
              line.type === 'error' ? 'text-red-400' : 
              line.type === 'success' ? 'text-green-400' :
              line.type === 'code' ? 'text-yellow-300' :
              'text-green-300'
            }`}>{line.output}</pre>
          )}
        </div>
      ))}

      {/* Loading indicator */}
      {isExecuting && (
        <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
          <SparklesIcon className="w-4 h-4" />
          <span>Executing code with Gemini AI...</span>
        </div>
      )}

      {/* Input line */}
      <div className="flex items-center mt-2">
        <span className="text-cyan-400 mr-2">{getPrompt()}</span>
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isExecuting}
          className="flex-1 bg-transparent border-none outline-none text-white caret-green-400"
          autoFocus
          aria-label="Terminal input"
        />
        <div className="w-2 h-4 bg-green-400 animate-pulse ml-1" />
      </div>
    </div>
  );
};

export default TerminalApp;