import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../types';
import { SearchIcon, SparklesIcon } from '../Icons';
import { groundedSearch } from '../../services/geminiAdvancedService';

const SearchApp: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingMode, setThinkingMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
  
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
  
    useEffect(scrollToBottom, [messages]);
  
    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;
    
        const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        
        setIsLoading(true);

        const currentInput = input;
        setInput('');
        const { text, sources } = await groundedSearch(currentInput, thinkingMode);
        const aiMessage: Message = { id: `ai-${Date.now()}`, sender: 'ai', text, sources };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };
  
    return (
      <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white">
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center text-text-muted">
                    <SearchIcon className="w-20 h-20 mb-4" />
                    <h2 className="text-xl font-bold font-display">AI Search</h2>
                    <p>Ask me anything. I'm connected to Google for up-to-date information.</p>
                </div>
            )}
            {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center">
                    <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary-blue text-white' : 'bg-bg-secondary text-text-primary'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 border-t border-white/10 pt-2">
                            <h3 className="text-xs font-bold mb-1 text-text-secondary">Sources:</h3>
                            <ul className="space-y-1">
                                {msg.sources.map((source, i) => (
                                    <li key={i}>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-cyan hover:underline">
                                           {i+1}. {source.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            ))}
            {isLoading && (
            <div className="flex items-end gap-3 justify-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center animate-pulse">
                    <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div className="max-w-[70%] p-3 rounded-2xl bg-bg-secondary">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
                </div>
            </div>
            )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
                <label htmlFor="thinking-mode" className="flex items-center cursor-pointer text-sm text-text-secondary">
                    <input 
                        type="checkbox" 
                        id="thinking-mode" 
                        checked={thinkingMode} 
                        onChange={(e) => setThinkingMode(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="relative w-9 h-5 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-purple"></div>
                    <span className="ml-2">Thinking Mode</span>
                </label>
                <span className="text-xs text-text-muted">(For complex queries)</span>
            </div>
            <div className="relative">
                <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-full pl-5 pr-14 text-text-primary focus:ring-2 focus:ring-primary-cyan focus:outline-none transition-all duration-300"
                />
                <button
                onClick={handleSend}
                disabled={isLoading || !input}
                aria-label="Send search query"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-primary-cyan rounded-full flex items-center justify-center hover:bg-primary-cyan/80 transition-colors disabled:bg-gray-500"
                >
                <SearchIcon className="h-5 w-5 text-white" />
                </button>
            </div>
        </div>
      </div>
    );
};
  
export default SearchApp;