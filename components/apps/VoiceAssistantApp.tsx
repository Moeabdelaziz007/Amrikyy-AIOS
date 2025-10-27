import React, { useState, useRef, useCallback } from 'react';
import { transcribeAudio, generateWorkflowFromPrompt } from '../../services/geminiAdvancedService';
import { Workflow } from '../../types';
import { fileToBase64 } from '../../utils/fileUtils';
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
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = processAudio;
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setVoiceState('listening');
            setTranscription('');
            setError(null);
        } catch (err) {
            setError('Microphone access denied. Please allow microphone permissions.');
            console.error(err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && voiceState === 'listening') {
            mediaRecorderRef.current.stop();
             mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setVoiceState('processing');
        }
    };

    const processAudio = async () => {
        if (audioChunksRef.current.length === 0) {
            setVoiceState('idle');
            return;
        };

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "recording.webm", { type: audioBlob.type });
        
        try {
            // 1. Transcribe audio
            const base64Audio = await fileToBase64(audioFile);
            const transcript = await transcribeAudio(base64Audio.split(',')[1], audioFile.type);
            setTranscription(transcript);

            // 2. Generate workflow from transcription
            const workflow = await generateWorkflowFromPrompt(transcript);
            
            // 3. Execute workflow
            onExecuteWorkflow(workflow);
            setVoiceState('done');
        } catch(e) {
            setError("Failed to process command.");
            setVoiceState('idle');
            console.error(e);
        }
    };

    const handleButtonClick = () => {
        if (voiceState === 'listening') {
            stopRecording();
        } else {
            startRecording();
        }
    }

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