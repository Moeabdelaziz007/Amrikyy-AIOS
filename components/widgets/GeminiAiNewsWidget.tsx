import React from 'react';
import { AppID } from '../../types';
import { aiNewsData, aiMarketData } from '../../data/aiNews';
import { useLanguage } from '../../contexts/LanguageContext';
import { NewsIcon } from '../Icons';

/**
 * Props for the GeminiAiNewsWidget component.
 */
interface GeminiAiNewsWidgetProps {
    /**
     * Callback function to open an application by its ID, typically the full Gemini AI News app.
     * @param {AppID} appId - The ID of the application to open.
     */
    onOpenApp: (appId: AppID) => void;
}

/**
 * The GeminiAiNewsWidget displays a condensed view of top AI news stories and market data.
 * It provides a quick glance at the latest developments and a link to the full news application.
 * @param {GeminiAiNewsWidgetProps} props - The component props.
 * @returns {JSX.Element} The GeminiAiNewsWidget component.
 */
const GeminiAiNewsWidget: React.FC<GeminiAiNewsWidgetProps> = ({ onOpenApp }) => {
    const { t } = useLanguage();
    // Find the first 'Top Story' or default to the first available news item.
    const topStory = aiNewsData.find(item => item.category === 'Top Story') || aiNewsData[0];

    return (
        <div className="glass-effect rounded-xl">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <NewsIcon className="text-primary-cyan text-lg" />
                    <h2 className="font-medium text-sm">{t('ai_news.title')}</h2>
                </div>
                <button onClick={() => onOpenApp('geminiAiNews')} className="text-xs text-primary-cyan hover:underline">
                    {t('ai_news.view_more')}
                </button>
            </div>
            <div className="p-4 space-y-4">
                {topStory && (
                    <div className="bg-black/20 p-3 rounded-lg border border-border-color cursor-pointer" onClick={() => onOpenApp('geminiAiNews')}>
                        <span className="text-xs font-bold text-primary-cyan">{topStory.category}</span>
                        <h3 className="font-semibold text-white/90 text-sm mt-1">{topStory.title}</h3>
                        <p className="text-xs text-white/60 mt-1 line-clamp-2">{topStory.content}</p>
                    </div>
                )}
                {/* Simulated market data ticker */}
                <div className="relative h-6 overflow-hidden bg-black/20 rounded-full" aria-live="off">
                     {/* Duplicate market data to create a continuous scroll effect */}
                     <div className="absolute top-0 left-0 flex items-center h-full animate-grid-pan" style={{ animationDuration: '40s' }}>
                        {[...aiMarketData, ...aiMarketData].map((stock, index) => (
                            <div key={index} className="flex items-center gap-3 px-4 flex-shrink-0">
                                <span className="font-bold text-xs">{stock.ticker}</span>
                                <span className="text-xs">${stock.price.toFixed(2)}</span>
                                <span className={`text-xs font-semibold ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)}%
                                </span>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default GeminiAiNewsWidget;