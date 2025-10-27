import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';

export function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

export const connectToLiveStream = (
    callbacks: {
        onOpen: () => void;
        onMessage: (message: LiveServerMessage) => void;
        onError: (e: ErrorEvent) => void;
        onClose: (e: CloseEvent) => void;
    }
): Promise<LiveSession> => {
    
    if (!process.env.API_KEY) {
        throw new Error("API key not found for live service.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are Maya, a friendly and helpful AI assistant for the Amrikyy AI OS. Keep your responses conversational and concise.',
        },
    });

    return sessionPromise;
};

export const streamAudio = async (sessionPromise: Promise<LiveSession>, stream: MediaStream, audioContext: AudioContext) => {
    const source = audioContext.createMediaStreamSource(stream);
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    
    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        sessionPromise.then((session) => {
            if (session) {
                session.sendRealtimeInput({ media: pcmBlob });
            }
        });
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);

    return {
        stop: () => {
            source.disconnect();
            scriptProcessor.disconnect();
        }
    }
};