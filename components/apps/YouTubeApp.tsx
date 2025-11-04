import React, { useState } from 'react';
import { YouTubeIcon, SearchIcon } from '../Icons';

const YouTubeApp: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<string[]>([]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock search results
        setResults([
            `Video result for "${searchTerm}" 1`,
            `Video result for "${searchTerm}" 2`,
            `Video result for "${searchTerm}" 3`,
        ]);
    };

    return (
        <div className="h-full w-full flex flex-col bg-red-600 text-white rounded-b-md">
            <header className="p-3 border-b border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <YouTubeIcon className="w-6 h-6" />
                    <h2 className="text-lg font-semibold">YouTube</h2>
                </div>
                <form onSubmit={handleSearch} className="flex items-center">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-red-700 text-white rounded-l-md px-2 py-1 focus:outline-none"
                    />
                    <button type="submit" className="bg-red-700 rounded-r-md p-1">
                        <SearchIcon className="w-6 h-6" />
                    </button>
                </form>
            </header>
            <main className="flex-grow p-4 overflow-y-auto">
                {results.length > 0 ? (
                    <ul>
                        {results.map((result, index) => (
                            <li key={index} className="border-b border-white/20 py-2">
                                {result}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p>Search for videos</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default YouTubeApp;
