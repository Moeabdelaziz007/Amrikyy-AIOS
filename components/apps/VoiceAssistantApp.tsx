import React, { useState, useRef, useCallback, useEffect } from 'react';
import { generateWorkflowFromPrompt } from '../../services/geminiAdvancedService';
import { Workflow } from '../../types';
import { VoiceService } from '../../packages/voice-service/src/index';
import VoiceHologram from '../VoiceHologram';
import { SparklesIcon } from '../Icons';

type VoiceState = 'idle' | 'listening' | 'processing' | 'done';
interface VoiceAssistantAppProps {
    onExecuteWorkflow: (workflow: Workflow) => void;
}

const VoiceAssistantApp: React.FC<VoiceAssistantAppProps> = ({ onExecuteWorkflow }) => {
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const voiceServiceRef = useRef<VoiceService | null>(null);

    useEffect(() => {
        if (!voiceServiceRef.current) {
            voiceServiceRef.current = new VoiceService();
        }

        const vs = voiceServiceRef.current;

 updates
    const processAudio = async () => {
        if (audioChunksRef.current.length === 0) {
            setVoiceState('idle');
            return;
        }
=======
        const handleListeningStart = () => setVoiceState('listening');
        const handleTranscription = (e: any) => setTranscription(e.data.text);
        const handleError = (e: any) => setError(e.data.error.message || 'An unknown error occurred.');
        const handleListeningEnd = () => setVoiceState('idle');
 main

        vs.on('listening-start', handleListeningStart);
        vs.on('transcription-complete', handleTranscription);
        vs.on('error', handleError);
        vs.on('listening-end', handleListeningEnd);

        return () => {
            vs.off('listening-start', handleListeningStart);
            vs.off('transcription-complete', handleTranscription);
            vs.off('error', handleError);
            vs.off('listening-end', handleListeningEnd);
        };
    }, []);

    const handleButtonClick = async () => {
        if (!voiceServiceRef.current) return;

        if (voiceState === 'listening') {
            voiceServiceRef.current.stopListening();
            setVoiceState('processing');
        } else {
            setError(null);
            setTranscription('');
            try {
                const command = await voiceServiceRef.current.processVoiceInput();
                const workflow = await generateWorkflowFromPrompt(command.text);
                onExecuteWorkflow(workflow);
                setVoiceState('done');
            } catch (e: any) {
                // Error is already handled by the event listener
                console.error(e);
                setVoiceState('idle');
            }
        }
    };

    const getButtonText = () => {
        switch (voiceState) {
            case 'idle':
            case 'done':
                return 'Start Listening';
            case 'listening':
                return 'Stop Listening';
            case 'processing':
                return 'Processing...';
        }
    }

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-bg-tertiary rounded-b-md text-white p-6 gap-6">
            <VoiceHologram state={voiceState === 'listening' ? 'listening' : 'idle'} />
             <div className="h-16 text-center">
                 {error && <p className="text-red-400">{error}</p>}
                 {transcription && (
                     <div className="flex items-center gap-2">
                         <SparklesIcon className="w-5 h-5 text-primary-purple"/>
                         <p className="font-mono text-lg">{transcription}</p>
                     </div>
                 )}
                 {voiceState === 'done' && <p className="text-green-400">Workflow generated and sent to studio!</p>}
             </div>
             <button
                onClick={handleButtonClick}
                disabled={voiceState === 'processing'}
                className="px-8 py-4 font-bold rounded-lg bg-gradient-to-r from-primary-cyan to-sky-500 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
                {getButtonText()}
            </button>
        </div>
    );
};

export default VoiceAssistantApp;