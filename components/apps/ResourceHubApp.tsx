import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ResourceHubIcon, SearchIcon } from '../Icons';
import { resources } from '../../data/resources';
import { ResourceItem } from '../../types';

type Category = 'All' | 'AI/ML' | 'Frontend' | 'Developer Tools' | 'Design';

const ResourceHubApp: React.FC = () => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');

    const filteredResources = useMemo(() => {
        return resources.filter(res => {
            const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
            const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  res.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  res.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, selectedCategory]);

    const categories: Category[] = ['All', 'AI/ML', 'Frontend', 'Developer Tools', 'Design'];

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <ResourceHubIcon className="w-8 h-8 text-teal-400"/>
                    <div>
                        <h1 className="font-display text-2xl font-bold">{t('resource_hub.title')}</h1>
                        <p className="text-sm text-text-secondary">{t('resource_hub.desc')}</p>
                    </div>
                </div>
                <div className="relative w-full sm:w-64">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <input 
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-9 bg-black/20 border border-white/10 rounded-full pl-9 pr-4 text-sm focus:ring-1 focus:ring-teal-400 focus:outline-none"
                    />
                </div>
            </header>
             <nav className="flex-shrink-0 p-3 border-b border-border-color flex items-center gap-2 overflow-x-auto">
                {categories.map(category => (
                     <button 
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategory === category ? 'bg-teal-500 text-white' : 'bg-black/20 hover:bg-white/10'}`}
                    >
                        {category}
                    </button>
                ))}
            </nav>
            <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResources.map(res => (
                        <a 
                            key={res.id} 
                            href={res.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-black/20 p-4 rounded-lg border border-border-color flex flex-col gap-2 hover:border-teal-400 transition-colors group"
                        >
                            <h3 className="font-bold text-lg group-hover:text-teal-400 transition-colors">{res.title}</h3>
                            <p className="text-xs text-text-secondary flex-grow">{res.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {res.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded">{tag}</span>
                                ))}
                            </div>
                        </a>
                    ))}
                </div>
                 {filteredResources.length === 0 && <p className="text-center text-text-muted py-8">No resources found.</p>}
            </main>
        </div>
    );
};

export default ResourceHubApp;
