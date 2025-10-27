import React, { useState } from 'react';
import { groundedSearch, summarizeText } from '../../services/geminiAdvancedService';
import { SearchIcon, SparklesIcon } from '../Icons';
import { AppID } from '../../types';

interface CognitoBrowserAppProps {
    onOpenWindow: (appId: AppID, props: any) => void;
}

const CognitoBrowserApp: React.FC<CognitoBrowserAppProps> = ({ onOpenWindow }) => {
    const [input, setInput] = useState('https://google.com');
    const [history, setHistory] = useState(['https://google.com']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [currentView, setCurrentView] = useState<'iframe' | 'search'>('iframe');
    const [searchResult, setSearchResult] = useState<{ text: string; sources: { title: string; uri: string }[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const navigate = (url: string) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(url);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setInput(url);
        setCurrentView('iframe');
    };

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        setSearchResult(null);
        setCurrentView('search');
        try {
            const result = await groundedSearch(query, false);
            setSearchResult(result);
        } catch (error) {
            setSearchResult({ text: 'Sorry, I couldn\'t perform the search.', sources: [] });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            new URL(input);
            navigate(input);
        } catch (_) {
            handleSearch(input);
        }
    };
    
    const handleSummarize = async () => {
        setIsSummarizing(true);
        try {
            // This is a simplified example. A real implementation would need to
            // get the content of the iframe, which is complex due to cross-origin policies.
            // We will simulate by summarizing the search result if available.
            const textToSummarize = searchResult?.text || "The current page content is not accessible for summarization in this demo.";
            const summary = await summarizeText(textToSummarize);
            onOpenWindow('chat', { initialMessage: `Here's a summary:\n\n${summary}` });

        } catch (error) {
             onOpenWindow('chat', { initialMessage: "Sorry, I couldn't summarize the content." });
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div className="h-full w-full flex bg-bg-tertiary rounded-b-md text-white">
            <main className="flex-1 flex flex-col">
                <header className="flex-shrink-0 p-2 border-b border-border-color flex items-center gap-2">
                     <form onSubmit={handleInputSubmit} className="flex-grow">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Search with AI or enter a URL"
                                className="w-full h-9 bg-black/20 border border-white/10 rounded-full pl-9 pr-4 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                            />
                        </div>
                    </form>
                </header>
                <div className="flex-grow relative">
                    {currentView === 'iframe' ? (
                        <iframe src={history[historyIndex]} className="w-full h-full border-none" title="Cognito Browser View" />
                    ) : (
                         <div className="p-6 overflow-y-auto h-full">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full gap-2 text-accent"><SparklesIcon className="w-6 h-6 animate-pulse"/> Searching...</div>
                            ) : searchResult && (
                                <div className="space-y-4">
                                    <p className="whitespace-pre-wrap">{searchResult.text}</p>
                                    {searchResult.sources.length > 0 && (
                                         <div>
                                            <h3 className="font-bold text-sm mb-2">Sources:</h3>
                                            <ul className="space-y-1">
                                                {searchResult.sources.map((s, i) => <li key={i}><a href={s.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-cyan hover:underline">{s.title}</a></li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <aside className="w-64 border-l border-border-color bg-black/20 p-4 flex flex-col gap-4">
                 <h2 className="font-bold font-display text-lg flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-primary-purple" /> AI Tools</h2>
                 <button onClick={handleSummarize} disabled={isSummarizing} className="w-full text-sm py-2 px-3 rounded-lg bg-accent/20 text-accent hover:bg-accent/40 transition-colors disabled:opacity-50">
                    {isSummarizing ? 'Summarizing...' : 'Summarize Page'}
                 </button>
            </aside>
        </div>
    );
};

export default CognitoBrowserApp;