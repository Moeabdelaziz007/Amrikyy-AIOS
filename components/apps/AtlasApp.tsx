import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { FinanceIcon, SparklesIcon, SendIcon } from '../Icons';
import { marketIndices, defaultWatchlist, MarketIndex, WatchlistItem } from '../../data/finance';
import { getFinancialNews, getFinancialAnalysis } from '../../services/geminiAdvancedService';
import { generateResponse } from '../../services/geminiService';
import { Message } from '../../types';
import { Content } from '@google/genai';

type Tab = 'dashboard' | 'analysis' | 'chat';

interface FinancialNews {
    title: string;
    source: string;
    url: string;
}

interface FinancialAnalysis {
    summary: string;
    bullCase: string;
    bearCase: string;
    keyMetrics: { name: string; value: string }[];
    recentNews: string;
}

const AtlasApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex flex-col sm:flex-row items-center justify-between gap-2">
                 <div className="flex items-center gap-3">
                    <FinanceIcon className="w-8 h-8 text-green-400"/>
                    <h1 className="font-display text-2xl font-bold">Atlas Finance</h1>
                </div>
                <nav className="flex gap-2 bg-black/20 p-1 rounded-lg w-full sm:w-auto">
                    <TabButton id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} label="Dashboard" />
                    <TabButton id="analysis" activeTab={activeTab} setActiveTab={setActiveTab} label="Market Analysis" />
                    <TabButton id="chat" activeTab={activeTab} setActiveTab={setActiveTab} label="AI Chat" />
                </nav>
            </header>
            <main className="flex-grow overflow-y-auto p-4 sm:p-6">
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'analysis' && <AnalysisView />}
                {activeTab === 'chat' && <AIChatView />}
            </main>
        </div>
    );
}

const TabButton: React.FC<{id: Tab, activeTab: Tab, setActiveTab: (tab: Tab) => void, label: string}> = ({ id, activeTab, setActiveTab, label }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === id ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
    >
        {label}
    </button>
);

const DashboardView: React.FC = () => {
    const [indices, setIndices] = useState<MarketIndex[]>(marketIndices);
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>(defaultWatchlist);
    const [news, setNews] = useState<FinancialNews[]>([]);
    const [isLoadingNews, setIsLoadingNews] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const fetchedNews = await getFinancialNews();
                setNews(fetchedNews);
            } catch (error) {
                console.error(error);
                setNews([]);
            } finally {
                setIsLoadingNews(false);
            }
        };
        fetchNews();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndices(prev => prev.map(index => ({...index, value: index.value * (1 + (Math.random() - 0.5) * 0.01), change: (Math.random() - 0.5) * 2 })));
            setWatchlist(prev => prev.map(item => ({...item, price: item.price * (1 + (Math.random() - 0.5) * 0.02), change: (Math.random() - 0.5) * 5 })));
        }, 5000);
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {indices.map(index => (
                    <div key={index.name} className="bg-black/20 p-4 rounded-lg border border-border-color">
                        <h3 className="text-sm text-text-secondary">{index.name}</h3>
                        <p className="text-2xl font-bold">{index.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        <p className={`font-semibold ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{index.change.toFixed(2)}%</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                    <h3 className="font-bold mb-3">Watchlist</h3>
                    <div className="space-y-3">
                        {watchlist.map(item => (
                            <div key={item.ticker} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-bold">{item.ticker}</p>
                                    <p className="text-xs text-text-secondary">{item.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">${item.price.toFixed(2)}</p>
                                    <p className={`text-xs font-semibold ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{item.change.toFixed(2)}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                    <h3 className="font-bold mb-3">Top News</h3>
                    <div className="space-y-4">
                        {isLoadingNews ? <p className="text-xs text-text-muted">Loading news...</p> : news.map((item, i) => (
                             <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-white/5 p-2 rounded-md transition-colors">
                                <p className="font-semibold text-sm line-clamp-2">{item.title}</p>
                                <p className="text-xs text-text-muted">{item.source}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AnalysisView: React.FC = () => {
    const [ticker, setTicker] = useState('');
    const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalysis = async () => {
        if (!ticker || isLoading) return;
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await getFinancialAnalysis(ticker.toUpperCase());
            setAnalysis(result);
        } catch (err) {
            setError('Failed to retrieve analysis. Please check the ticker and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex gap-2 mb-6">
                <input type="text" value={ticker} onChange={e => setTicker(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAnalysis()} placeholder="Enter stock or crypto ticker (e.g., NVDA, BTC)" className="flex-grow bg-white/5 border border-border-color p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                <button onClick={handleAnalysis} disabled={isLoading || !ticker} className="px-6 font-bold rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50">Analyze</button>
            </div>
            
            {isLoading && <div className="text-center p-8"><SparklesIcon className="w-8 h-8 text-green-400 animate-pulse mx-auto" /> <p>Generating Report...</p></div>}
            {error && <p className="text-center text-red-400">{error}</p>}
            
            {analysis && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                        <h3 className="font-display text-lg font-bold text-green-400 mb-2">Summary</h3>
                        <p className="text-sm text-text-secondary">{analysis.summary}</p>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                             <h3 className="font-display text-lg font-bold text-green-400 mb-2">Bull Case</h3>
                            <p className="text-sm text-text-secondary">{analysis.bullCase}</p>
                        </div>
                        <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                            <h3 className="font-display text-lg font-bold text-red-400 mb-2">Bear Case</h3>
                            <p className="text-sm text-text-secondary">{analysis.bearCase}</p>
                        </div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                         <h3 className="font-display text-lg font-bold text-green-400 mb-2">Key Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {analysis.keyMetrics.map(metric => (
                                <div key={metric.name}>
                                    <p className="text-xs text-text-muted">{metric.name}</p>
                                    <p className="font-semibold">{metric.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                         <h3 className="font-display text-lg font-bold text-green-400 mb-2">Recent News</h3>
                        <p className="text-sm text-text-secondary">{analysis.recentNews}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const AIChatView: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'ai', text: `I am Atlas, your AI financial analyst. Ask me anything about markets, investment strategies, or specific assets.` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        const history: Content[] = messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        })); 
        const responseText = await generateResponse(input, history);
        
        const aiMessage: Message = { id: `ai-${Date.now()}`, sender: 'ai', text: `${responseText}\n\n*Disclaimer: I am an AI assistant and not a financial advisor. All information is for educational purposes only.*` };
        setMessages(prev => [...prev, aiMessage]);
        setInput('');
        setIsLoading(false);
    };

    return (
        <div className="h-full w-full max-w-2xl mx-auto flex flex-col bg-bg-secondary rounded-lg border border-border-color animate-fade-in">
           <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                   <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {msg.sender === 'ai' && <div className="flex-shrink-0 h-10 w-10 rounded-full bg-stone-600 flex items-center justify-center text-2xl"><FinanceIcon /></div>}
                       <div className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-accent text-white' : 'bg-bg-tertiary'}`}>
                           <p className="text-sm">{msg.text}</p>
                       </div>
                   </div>
               ))}
                {isLoading && <div className="flex justify-start gap-3"><div className="flex-shrink-0 h-10 w-10 rounded-full bg-stone-600 flex items-center justify-center text-2xl"><FinanceIcon /></div><div className="text-sm p-3 rounded-lg bg-bg-tertiary">...</div></div>}
           </div>
            <div className="p-4 border-t border-border-color">
               <div className="relative">
                   <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask a financial question..." disabled={isLoading} className="w-full h-12 bg-white/5 border border-white/10 rounded-full pl-5 pr-14 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                   <button onClick={handleSend} disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 disabled:bg-gray-500"><SendIcon className="h-5 w-5 text-white" /></button>
               </div>
           </div>
       </div>
    );
};


export default AtlasApp;
