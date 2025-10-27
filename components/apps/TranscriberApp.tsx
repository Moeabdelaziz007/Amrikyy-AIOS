import React, { useState, useRef } from 'react';
import { MicrophoneIcon, SparklesIcon } from '../Icons';
import { transcribeAudio } from '../../services/geminiAdvancedService';
import { fileToBase64 } from '../../utils/fileUtils';

type RecordingState = 'idle' | 'recording' | 'stopped';

const TranscriberApp: React.FC = () => {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [transcription, setTranscription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
            mediaRecorderRef.current.onstop = handleTranscription;
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setRecordingState('recording');
            setError(null);
        } catch (err) {
            setError('Microphone access denied. Please allow microphone permissions in your browser.');
            console.error(err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recordingState === 'recording') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setRecordingState('stopped');
        }
    };

    const handleTranscription = async () => {
        if (audioChunksRef.current.length === 0) return;
        setIsLoading(true);
        setTranscription('');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "recording.webm", { type: audioBlob.type });
        
        try {
            const base64Audio = await fileToBase64(audioFile);
            const result = await transcribeAudio(base64Audio.split(',')[1], audioFile.type);
            setTranscription(result);
        } catch(e) {
            setError("Failed to process transcription.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white p-6 gap-6">
            <div className="text-center">
                <MicrophoneIcon className="w-16 h-16 mx-auto mb-2 text-fuchsia-400" />
                <h1 className="text-2xl font-bold font-display">Audio Transcriber</h1>
                <p className="text-text-muted">Record audio and get a text transcription powered by AI.</p>
                {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
            </div>

            <div className="flex justify-center items-center gap-4">
                <button
                    onClick={startRecording}
                    disabled={recordingState === 'recording'}
                    className="px-6 py-3 font-bold rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Start Recording
                </button>
                <button
                    onClick={stopRecording}
                    disabled={recordingState !== 'recording'}
                    className="px-6 py-3 font-bold rounded-lg bg-gradient-to-r from-red-500 to-rose-500 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Stop Recording
                </button>
            </div>
            
            {recordingState === 'recording' && (
                <div className="flex items-center justify-center gap-2 text-red-400 animate-pulse">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Recording...</span>
                </div>
            )}

            <div className="flex-grow w-full max-w-2xl mx-auto bg-black/20 border border-white/10 rounded-xl p-4">
                {isLoading ? (
                     <div className="flex items-center justify-center h-full gap-3 text-fuchsia-400">
                        <SparklesIcon className="w-6 h-6 animate-pulse" />
                        <p>Transcribing audio...</p>
                    </div>
                ) : (
                    <textarea
                        value={transcription}
                        readOnly
                        placeholder="Your transcription will appear here..."
                        className="w-full h-full bg-transparent text-text-primary resize-none focus:outline-none"
                    />
                )}
            </div>
        </div>
    );
};

export default TranscriberApp;