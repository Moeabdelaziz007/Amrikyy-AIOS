import React, { useState, useRef, useEffect } from 'react';
import { Agent } from '../../types.ts';
import HologramCard from '../HologramCard.tsx';
import { agents } from '../../data/agents.ts';
import { skills } from '../../data/skills.ts';
import { geminiService } from '../../packages/ai/src/index.ts';
import { SendIcon, SparklesIcon } from '../Icons.tsx';

const lunaAgent = agents.find(a => a.id === 'luna') as Agent;
const equippedSkills = skills.filter(s => lunaAgent.skillIDs.includes(s.id));

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const LunaApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hello! I'm Luna, your dedicated travel planning specialist. I can help you plan the perfect trip by finding flights, hotels, activities, and creating detailed itineraries. What kind of adventure are you dreaming of?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);
    const currentInput = input;
    setInput('');

    try {
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const aiResponse = await geminiService.generateText(
        currentInput,
        chatHistory,
        {},
        `You are Luna, a friendly and expert travel planning AI assistant. You specialize in:
        - Finding and comparing flights, hotels, and transportation
        - Creating detailed day-by-day itineraries
        - Recommending local attractions and activities
        - Providing budget estimates and travel tips
        - Offering cultural insights and safety information
        Be enthusiastic, helpful, and focus on creating amazing travel experiences. Always ask clarifying questions when needed.`
      );

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: `Sorry, I encountered an issue planning your trip. ${error.message}. Please try again or contact support.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const quickSuggestions = [
    "Plan a 3-day trip to Paris",
    "Find budget flights to Tokyo",
    "Suggest a romantic getaway",
    "Help me plan a family vacation"
  ];

  return (
    <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md">
      {/* Header with Luna's info */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-primary-blue/10 to-primary-purple/10">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <HologramCard agent={lunaAgent} compact />
          </div>
          <div className="flex-grow">
            <h2 className="text-xl font-bold text-text-primary">{lunaAgent.name}</h2>
            <p className="text-sm text-text-secondary">{lunaAgent.role}</p>
            <p className="text-xs text-text-muted mt-1">
              Equipped with: {equippedSkills.map(s => s.name).join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-grow flex flex-col">
        {/* Messages */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center">
                  <SparklesIcon className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[75%] p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-primary-blue to-primary-purple text-white rounded-br-none'
                  : 'bg-bg-secondary text-text-primary rounded-bl-none'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <span className="text-xs opacity-60 mt-1 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center animate-pulse">
                <SparklesIcon className="h-4 w-4 text-white" />
              </div>
              <div className="max-w-[75%] p-3 rounded-2xl bg-bg-secondary rounded-bl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-text-muted mb-2">Quick start suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-text-secondary hover:text-text-primary transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me about your dream trip..."
              disabled={isLoading}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-full pl-5 pr-14 text-text-primary focus:ring-2 focus:ring-primary-blue focus:outline-none transition-all duration-300"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-primary-blue rounded-full flex items-center justify-center hover:bg-primary-blue/80 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              <SendIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LunaApp;