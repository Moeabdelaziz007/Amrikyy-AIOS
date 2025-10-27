import React, { useState, useRef, useEffect } from 'react';
import { Message, SystemVoice } from '../../types';
import { generateResponse } from '../../services/geminiService';
import { generateSpeech } from '../../services/geminiAdvancedService';
import { playDecodedAudio, decode } from '../../utils/audioUtils';
import { SendIcon, SparklesIcon, SpeakerIcon } from '../Icons';
import { Content } from '@google/genai';

type AudioState = 'idle' | 'loading' | 'playing';

interface ChatAppProps {
  speechSettings: {
    voice: SystemVoice;
    rate: number;
    pitch: number;
  };
}

const ChatApp: React.FC<ChatAppProps> = ({ speechSettings }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial-1', sender: 'ai', text: "Hello! I'm Maya, your AI travel assistant. How can I help you plan your next adventure today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioState, setAudioState] = useState<Record<string, AudioState>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      audioContextRef.current?.close();
    };
  }, []);
  
  const initAudioContext = () => {
       if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
       }
       if (audioContextRef.current.state === 'suspended') {
           audioContextRef.current.resume();
       }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);

    const chatHistory: Content[] = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    const currentInput = input;
    setInput('');
    const aiResponseText = await generateResponse(currentInput, chatHistory);
    const aiMessage: Message = { id: `ai-${Date.now()}`, sender: 'ai', text: aiResponseText };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handlePlayAudio = async (message: Message) => {
    initAudioContext();
    if (!audioContextRef.current) return;
    if (audioState[message.id] === 'loading' || audioState[message.id] === 'playing') return;

    setAudioState(prev => ({ ...prev, [message.id]: 'loading' }));
    try {
        const { voice, rate, pitch } = speechSettings;
        const base64Audio = await generateSpeech(message.text, voice, rate, pitch);
        if (base64Audio && isMounted.current && audioContextRef.current) {
            setAudioState(prev => ({ ...prev, [message.id]: 'playing' }));
            await playDecodedAudio(decode(base64Audio), audioContextRef.current);
        }
    } catch (error) {
        console.error("Failed to play audio", error);
    } finally {
        if (isMounted.current) {
            setAudioState(prev => ({ ...prev, [message.id]: 'idle' }));
        }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md">
      <div 
        role="log"
        aria-live="polite"
        aria-busy={isLoading}
        className="flex-grow p-4 overflow-y-auto space-y-4"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-white" />
              </div>
            )}
            <div className={`group relative max-w-[70%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-gradient-to-r from-primary-blue to-primary-purple text-white rounded-br-none' : 'bg-bg-secondary text-text-primary rounded-bl-none'}`}>
              <p className="text-sm">{msg.text}</p>
              {msg.sender === 'ai' && (
                <button 
                  onClick={() => handlePlayAudio(msg)}
                  disabled={audioState[msg.id] === 'loading' || audioState[msg.id] === 'playing'}
                  className="absolute -bottom-2 -right-2 h-6 w-6 bg-bg-tertiary rounded-full border border-border-color flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Read message aloud"
                >
                    {audioState[msg.id] === 'loading' ? (
                        <div className="w-3 h-3 border-2 border-text-muted border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <SpeakerIcon className={`h-4 w-4 ${audioState[msg.id] === 'playing' ? 'text-accent' : 'text-text-muted'}`} />
                    )}
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-3 justify-start">
             <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center animate-pulse">
                  <SparklesIcon className="h-6 w-6 text-white" />
              </div>
            <div className="max-w-[70%] p-3 rounded-2xl bg-bg-secondary rounded-bl-none">
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
        <div className="relative">
          <label htmlFor="chat-input" className="sr-only">Type your message</label>
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-full pl-5 pr-14 text-text-primary focus:ring-2 focus:ring-primary-blue focus:outline-none transition-all duration-300"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-primary-blue rounded-full flex items-center justify-center hover:bg-primary-blue/80 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            <SendIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;