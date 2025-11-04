import React, { useState } from 'react';
import { ChronoVaultIcon, SearchIcon, AddIcon } from '../Icons';
import QuantumFoamBackground from '../QuantumFoamBackground';
import * as memoryApiService from '../../services/memoryApiService';

const ChronoVaultApp: React.FC = () => {
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMemoryContent, setNewMemoryContent] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm) return;
        setIsLoading(true);
        setError(null);
        try {
            const results = await memoryApiService.searchMemories(searchTerm);
            setSearchResults(results);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMemory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemoryContent) return;
        try {
            await memoryApiService.addMemory(newMemoryContent);
            setNewMemoryContent('');
            // Optionally, refresh search results or provide other feedback
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-transparent rounded-b-md text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/50 -z-20"></div>
            <QuantumFoamBackground />
            <header className="flex-shrink-0 p-4 border-b border-white/10 flex items-center justify-between gap-3 bg-black/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <ChronoVaultIcon className="w-8 h-8 text-primary-purple"/>
                    <h1 className="font-display text-2xl font-bold">Chrono Vault</h1>
                </div>
                <form onSubmit={handleSearch} className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"/>
                    <input
                        type="text"
                        placeholder="Search memories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-black/20 border border-white/10 rounded-md py-2 pl-10 pr-4 w-64 focus:ring-1 focus:ring-primary-purple focus:outline-none"
                    />
                </form>
            </header>
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                    {isLoading && <div className="text-center">Searching...</div>}
                    {error && <div className="text-center text-red-500">Error: {error}</div>}
                    {!isLoading && !error && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {searchResults.map(result => (
                                <div key={result.id} className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                                    <p className="text-sm text-text-secondary mb-3 line-clamp-3">{result.payload.content}</p>
                                    <div className="text-xs text-text-secondary mt-2">
                                        <span>Score: {result.score.toFixed(4)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                 <aside className="w-full md:w-80 flex-shrink-0 bg-black/30 backdrop-blur-sm p-4 md:p-6 border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto">
                    <form onSubmit={handleAddMemory} className="space-y-4">
                        <h2 className="text-xl font-bold font-display mb-3 flex items-center gap-2">
                            <AddIcon/>
                            Add New Memory
                        </h2>
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium mb-1">Content</label>
                            <textarea
                                id="content"
                                value={newMemoryContent}
                                onChange={(e) => setNewMemoryContent(e.target.value)}
                                placeholder="Details about the memory..."
                                rows={5}
                                className="w-full bg-black/20 border border-white/10 rounded-md p-2 focus:ring-1 focus:ring-primary-purple focus:outline-none"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 font-semibold rounded-lg bg-primary-purple text-white hover:brightness-110 transition-colors">
                            Save to Vault
                        </button>
                    </form>
                 </aside>
            </div>
        </div>
    );
};
export default ChronoVaultApp;