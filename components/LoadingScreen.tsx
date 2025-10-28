import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
// FIX: Import TranslationKey
import { TranslationKey } from '../i18n';

interface LoadingScreenProps {
    userAccountName?: string; // Optional: for personalized greeting if available early
}

interface LoadingStage {
    id: string;
    // FIX: Use TranslationKey for labelKey
    labelKey: TranslationKey;
    duration: number; // milliseconds
}

const loadingStages: LoadingStage[] = [
    { id: 'ai_core', labelKey: 'loading_screen.init_ai_core', duration: 800 },
    { id: 'ui_components', labelKey: 'loading_screen.loading_ui_components', duration: 1000 },
    { id: 'agents', labelKey: 'loading_screen.booting_agents', duration: 1200 },
    { id: 'user_data', labelKey: 'loading_screen.fetching_user_data', duration: 700 },
    { id: 'network', labelKey: 'loading_screen.establishing_network', duration: 900 },
    { id: 'preferences', labelKey: 'loading_screen.syncing_preferences', duration: 600 },
    { id: 'ready', labelKey: 'loading_screen.all_systems_ready', duration: 500 },
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ userAccountName }) => {
    const { t } = useLanguage();
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // FIX: Replace NodeJS.Timeout with number
        let stageTimer: number;
        // FIX: Replace NodeJS.Timeout with number
        let progressInterval: number;

        if (currentStageIndex < loadingStages.length) {
            const currentStage = loadingStages[currentStageIndex];
            setProgress(0); // Reset progress for new stage

            // Simulate progress for current stage
            const step = 100 / (currentStage.duration / 50); // Update every 50ms
            progressInterval = window.setInterval(() => {
                setProgress(prev => Math.min(100, prev + step));
            }, 50);

            // Move to next stage after duration
            stageTimer = window.setTimeout(() => {
                clearInterval(progressInterval);
                setCurrentStageIndex(prev => prev + 1);
            }, currentStage.duration);
        } else {
            setIsComplete(true); // All stages complete
        }

        return () => {
            clearTimeout(stageTimer);
            clearInterval(progressInterval);
        };
    }, [currentStageIndex]);

    // Mouse parallax effect
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { offsetWidth, offsetHeight } = container;
            const centerX = offsetWidth / 2;
            const centerY = offsetHeight / 2;

            const moveX = (clientX - centerX) / 30; // Adjust sensitivity
            const moveY = (clientY - centerY) / 30; // Adjust sensitivity

            if (logoRef.current) {
                logoRef.current.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
            }
            if (textRef.current) {
                textRef.current.style.transform = `translate(${moveX * 0.2}px, ${moveY * 0.2}px)`;
            }
        };

        container.addEventListener('mousemove', handleMouseMove);
        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // FIX: Ensure labelKey is treated as TranslationKey when passed to t()
    const currentStageLabel = t(loadingStages[currentStageIndex]?.labelKey || 'loading_screen.all_systems_ready');

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black text-white transition-opacity duration-1000 ${isComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <div ref={logoRef} className="flex items-center gap-4 mb-8 transition-transform duration-100 ease-out">
                <SparklesIcon className="w-16 h-16 text-primary-cyan" />
                <h1 className="font-display text-5xl font-bold">Amrikyy AI OS</h1>
            </div>
            <div ref={textRef} className="text-xl text-text-secondary mb-12 transition-transform duration-100 ease-out text-center">
                <p>{t('loading_screen.welcome_message')}</p>
                <p className="mt-4 text-lg font-mono text-primary-purple flex items-center justify-center gap-2">
                    {currentStageIndex < loadingStages.length ? (
                        <>
                            <div className="w-5 h-5 border-2 border-primary-purple border-t-transparent rounded-full animate-spin"></div>
                            <span>{currentStageLabel}</span>
                        </>
                    ) : (
                        <span className="text-green-400">{currentStageLabel}</span>
                    )}
                </p>
                {currentStageIndex < loadingStages.length && (
                    <div className="w-64 h-2 bg-gray-700 rounded-full mt-4 mx-auto" role="progressbar" aria-label="Loading progress">
                        <div
                            className="h-full bg-primary-cyan rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingScreen;
