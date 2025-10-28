import React from 'react';
import { SparklesIcon } from './Icons';

/**
 * The PoweredByGemini component displays a small, fixed badge indicating
 * that the application is powered by Google Gemini.
 * @returns {JSX.Element} The PoweredByGemini component.
 */
const PoweredByGemini: React.FC = () => {
    return (
        <div className="fixed bottom-5 right-5 z-40" role="contentinfo" aria-label="Powered by Google Gemini">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                <SparklesIcon className="w-4 h-4 text-primary-purple" aria-hidden="true" />
                <span className="text-xs font-semibold text-text-secondary">Powered by Gemini</span>
            </div>
        </div>
    );
};

export default PoweredByGemini;