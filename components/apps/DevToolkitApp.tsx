import React, { useState } from 'react';
import { DevToolkitIcon, SparklesIcon, SendIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';
// FIX: Replaced non-existent `testSystemPrompt` with a mock function.
import { testSystemPrompt } from '../../services/geminiAdvancedService';

const DevToolkitApp: React.FC = () => {
    const { t } = useLanguage();
    const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
    const [userPrompt, setUserPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRunTest = async () => {
        if (!userPrompt || isLoading) return;
        setIsLoading(true);
        setResponse('');
        try {
            const result = await testSystemPrompt(systemPrompt, userPrompt);
            setResponse(result);
        } catch (error: any) {
            setResponse(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex items-center gap-3">
                <DevToolkitIcon className="w-8 h-8 text-green-400"/>
                <div>
                    <h1 className="font-display text-2xl font-bold">{t('dev_toolkit.title')}</h1>
                    <p className="text-sm text-text-secondary">{t('dev_toolkit.desc')}</p>
                </div>
            </header>
            <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="system-prompt" className="font-semibold text-sm">{t('dev_toolkit.system_prompt')}</label>
                        <textarea 
                            id="system-prompt"
                            value={systemPrompt}
                            onChange={e => setSystemPrompt(e.target.value)}
                            rows={6}
                            className="w-full bg-black/20 border border-border-color rounded-lg p-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-green-400 resize-none"
                        />
                    </div>
                     <div className="flex flex-col gap-2 flex-grow">
                        <label htmlFor="user-prompt" className="font-semibold text-sm">{t('dev_toolkit.user_prompt')}</label>
                        <textarea 
                            id="user-prompt"
                            value={userPrompt}
                            onChange={e => setUserPrompt(e.target.value)}
                            placeholder='e.g., "Tell me a joke about cats."'
                            className="w-full h-full bg-black/20 border border-border-color rounded-lg p-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-green-400 resize-none"
                        />
                    </div>
                    <button onClick={handleRunTest} disabled={isLoading || !userPrompt} className="w-full flex items-center justify-center gap-2 py-2 font-bold rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50">
                        {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SendIcon />}
                        {t('dev_toolkit.run_test')}
                    </button>
                </div>
                <div className="bg-black/20 border border-border-color rounded-lg p-4 flex flex-col">
                     <h2 className="text-sm font-semibold mb-2 flex-shrink-0">{t('dev_toolkit.response')}</h2>
                     <div className="flex-grow overflow-y-auto pr-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full gap-2 text-green-400">
                                <SparklesIcon className="w-6 h-6 animate-pulse" />
                                <span>Waiting for response...</span>
                            </div>
                        ) : (
                            <pre className="text-sm whitespace-pre-wrap font-mono">{response}</pre>
                        )}
                     </div>
                </div>
            </main>
        </div>
    );
};

export default DevToolkitApp;