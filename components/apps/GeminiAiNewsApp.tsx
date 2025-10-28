import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { NewsIcon, SearchIcon } from '../Icons';
import { aiNewsData, aiMarketData, AiNewsArticle, AiMarketCap } from '../../data/aiNews';

type Category = 'All' | 'Top Story' | 'Market Watch' | 'Tool Spotlight' | 'Model Update';
const categories: Category[] = ['All', 'Top Story', 'Market Watch', 'Tool Spotlight', 'Model Update'];

const GeminiAiNewsApp: React.FC = () => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');

    const filteredNews = useMemo(() => {
        return aiNewsData.filter(item => {
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  item.content.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, selectedCategory]);

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <NewsIcon className="w-8 h-8 text-primary-cyan"/>
                    <h1 className="font-display text-2xl font-bold">{t('ai_news.title')}</h1>
                </div>
                <div className="relative w-full sm:w-64">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <input 
                        type="text"
                        placeholder={t('ai_news.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-9 bg-black/20 border border-white/10 rounded-full pl-9 pr-4 text-sm focus:ring-1 focus:ring-primary-cyan focus:outline-none"
                    />
                </div>
            </header>
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <aside className="w-full md:w-56 flex-shrink-0 p-3 border-b md:border-b-0 md:border-r border-border-color">
                    <nav className="flex flex-row md:flex-col gap-1">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`w-full px-3 py-2 rounded-lg text-sm font-semibold text-left transition-colors ${selectedCategory === category ? 'bg-accent/10 text-accent' : 'hover:bg-white/5'}`}
                            >
                                {category}
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                    {selectedCategory === 'All' || selectedCategory === 'Market Watch' ? <MarketWatchSection /> : null}
                    <div className="space-y-6">
                        {filteredNews.map(item => <NewsCard key={item.id} item={item} />)}
                    </div>
                </main>
            </div>
        </div>
    );
};

const NewsCard: React.FC<{ item: AiNewsArticle }> = ({ item }) => (
    <div className="bg-black/20 p-4 rounded-lg border border-border-color flex flex-col sm:flex-row gap-4">
        {item.imageUrl && (
            <img src={item.imageUrl} alt={item.title} className="w-full sm:w-48 h-32 sm:h-auto object-cover rounded-md flex-shrink-0" />
        )}
        <div>
            <span className="text-xs font-bold text-primary-cyan">{item.category}</span>
            <h2 className="font-bold text-lg mt-1">{item.title}</h2>
            <p className="text-sm text-text-secondary mt-2">{item.content}</p>
            <p className="text-xs text-text-muted mt-3">{item.source} &bull; {item.timestamp}</p>
        </div>
    </div>
);

const MarketWatchSection: React.FC = () => {
    // FIX: Call useLanguage hook to get the translation function 't'.
    const { t } = useLanguage();
    return (
    <div className="mb-6">
        <h2 className="text-xl font-bold font-display mb-3">{t('ai_news.market_watch')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {aiMarketData.map(stock => (
                <div key={stock.ticker} className="bg-black/20 p-3 rounded-lg border border-border-color">
                    <p className="font-bold text-sm">{stock.ticker}</p>
                    <p className="text-2xl font-semibold">${stock.price.toFixed(2)}</p>
                    <p className={`text-sm font-semibold ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.change.toFixed(2)}%
                    </p>
                    <p className="text-xs text-text-muted">MCap: {stock.marketCap}</p>
                </div>
            ))}
        </div>
    </div>
)};

export default GeminiAiNewsApp;