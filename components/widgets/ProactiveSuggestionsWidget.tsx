import React, { useState, useEffect } from 'react';
import { useUserBehavior } from '../../contexts/UserBehaviorContext';
import { generateProactiveSuggestion } from '../../services/geminiAdvancedService';
import { AppID } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { LightbulbIcon } from '../Icons';

/**
 * Props for the ProactiveSuggestionsWidget component.
 */
interface ProactiveSuggestionsWidgetProps {
    /**
     * Callback function to open an application by its ID when a suggestion is clicked.
     * @param {AppID} appId - The ID of the application to open.
     */
    onOpenApp: (appId: AppID) => void;
}

/**
 * Defines the structure for a single suggestion.
 */
interface Suggestion {
    /** The text content of the suggestion. */
    text: string;
    /** Optional AppID to open if the suggestion is actionable. */
    actionAppId?: AppID;
}

/**
 * The ProactiveSuggestionsWidget displays AI-generated suggestions based on recent user behavior.
 * It uses the `generateProactiveSuggestion` service to get context-aware recommendations.
 * @param {ProactiveSuggestionsWidgetProps} props - The component props.
 * @returns {JSX.Element} The ProactiveSuggestionsWidget component.
 */
const ProactiveSuggestionsWidget: React.FC<ProactiveSuggestionsWidgetProps> = ({ onOpenApp }) => {
    const { t } = useLanguage();
    const { actions } = useUserBehavior();
    const [title, setTitle] = useState(t('proactive_widget.title'));
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        /**
         * Fetches proactive suggestions from the AI service.
         */
        const getSuggestions = async () => {
            if (actions.length === 0) return;
            setIsLoading(true);
            try {
                // Use last 3 actions for context to generate suggestions
                const result = await generateProactiveSuggestion(actions.slice(0, 3));
                setTitle(result.title);
                setSuggestions(result.suggestions);
            } catch (error) {
                console.error("Failed to get proactive suggestions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce the suggestion fetching to avoid rapid API calls on frequent actions
        const debounce = setTimeout(getSuggestions, 1000);
        return () => clearTimeout(debounce);

    }, [actions, t]);

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