import React, { useState, useEffect } from 'react';
import { useUserBehavior } from '../../contexts/UserBehaviorContext';
import { generateProactiveSuggestion } from '../../services/geminiAdvancedService';
import { AppID } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { LightbulbIcon } from '../Icons';

interface ProactiveSuggestionsWidgetProps {
    onOpenApp: (appId: AppID) => void;
}

interface Suggestion {
    text: string;
    actionAppId?: AppID;
}

const ProactiveSuggestionsWidget: React.FC<ProactiveSuggestionsWidgetProps> = ({ onOpenApp }) => {
    const { t } = useLanguage();
    const { actions } = useUserBehavior();
    const [title, setTitle] = useState(t('proactive_widget.title'));
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getSuggestions = async () => {
            if (actions.length === 0) return;
            setIsLoading(true);
            try {
                const result = await generateProactiveSuggestion(actions.slice(0, 3)); // Use last 3 actions for context
                setTitle(result.title);
                setSuggestions(result.suggestions);
            } catch (error) {
                console.error("Failed to get proactive suggestions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(getSuggestions, 1000); // Debounce to avoid rapid firing
        return () => clearTimeout(debounce);

    }, [actions]);

    return (
        <div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <LightbulbIcon className="text-yellow-300 text-lg" />
                    <h2 className="font-medium text-sm">{title}</h2>
                </div>
            </div>
            <div className="space-y-2 p-4 min-h-[80px]">
                {isLoading ? (
                    <div className="text-center text-xs text-text-muted">Thinking...</div>
                ) : suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => suggestion.actionAppId && onOpenApp(suggestion.actionAppId)}
                            className={`w-full text-left text-xs p-2 rounded-md transition-colors ${suggestion.actionAppId ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'}`}
                        >
                            <span className="font-semibold text-white/90">{suggestion.text}</span>
                        </button>
                    ))
                ) : (
                     <p className="text-xs text-text-muted text-center">No suggestions right now.</p>
                )}
            </div>
        </div>
    );
};

export default ProactiveSuggestionsWidget;