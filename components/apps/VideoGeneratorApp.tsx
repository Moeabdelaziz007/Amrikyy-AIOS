import React, { useState, useEffect } from 'react';
import { VideoIcon, SparklesIcon, UploadIcon } from '../Icons.tsx';
import { generateVideoFromImage } from '../../services/geminiAdvancedService.ts';
import { fileToBase64 } from '../../utils/fileUtils.ts';
import { UserAccount, AppID } from '../../types.ts';
import { useLanguage } from '../../contexts/LanguageContext.tsx';

/**
 * Defines the status of video generation.
 */
type Status = 'idle' | 'processing' | 'completed' | 'error';

/**
 * Props for the VideoGeneratorApp component.
 */
interface VideoGeneratorAppProps {
    /** The current user's account information. */
    userAccount: UserAccount;
    /** Setter for the user's account information. */
    setUserAccount: React.Dispatch<React.SetStateAction<UserAccount>>;
    /** Callback function to open another application by its ID. */
    onOpenApp: (appId: AppID) => void;
    /** Optional initial image data (base64 and mimeType) to start video generation with. */
    initialImage?: { base64: string, mimeType: string };
}

/** The cost in AI Credits for generating a video. */
const VIDEO_GENERATION_COST = 250;

/**
 * The VideoGeneratorApp component allows users to generate videos from text prompts
 * and an optional starting image using the Veo model. It handles API key selection,
 * credit deduction, and displays generation progress.
 * @param {VideoGeneratorAppProps} props - The component props.
 * @returns {JSX.Element} The VideoGeneratorApp component.
 */
const VideoGeneratorApp: React.FC<VideoGeneratorAppProps> = ({ userAccount, setUserAccount, onOpenApp, initialImage }) => {
    const { t } = useLanguage();
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [message, setMessage] = useState('Your generated video will appear here.');
    const [progress, setProgress] = useState(0);
    const [sourceImage, setSourceImage] = useState<{ base64: string; mimeType: string } | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [isKeySelected, setIsKeySelected] = useState(false);

    // Checks if an API key has been selected on component mount.
    useEffect(() => {
        const checkKey = async () => {
            // @ts-expect-error – `aistudio` is a custom global object not recognized by TypeScript.
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsKeySelected(hasKey);
        };
        checkKey();
    }, []);

    // Sets the initial image if provided via props.
    useEffect(() => {
        if (initialImage) {
            setSourceImage({ base64: initialImage.base64, mimeType: initialImage.mimeType });
        }
    }, [initialImage]);

    /**
     * Handles file input change for selecting a source image.
     * Converts the selected image file to base64.
     * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event.
     */
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const base64 = await fileToBase64(file);
            setSourceImage({ base64, mimeType: file.type });
        }
    };

    /**
     * Opens the API key selection dialog and updates the `isKeySelected` state.
     */
    const handleSelectKey = async () => {
        // @ts-expect-error – `aistudio` is a custom global object not recognized by TypeScript.
        await window.aistudio.openSelectKey();
        setIsKeySelected(true); // Assume success to improve UX
    };

    /**
     * Initiates the video generation process.
     * Checks for sufficient credits and API key selection.
     * Manages generation status, progress, and credit transactions.
     */
    const handleGenerate = async () => {
        if (!prompt || !sourceImage || status === 'processing') return;

        if (userAccount.aiCredits < VIDEO_GENERATION_COST) {
            alert(t('video.insufficient_credits_text', { cost: VIDEO_GENERATION_COST }));
            onOpenApp(AppID.pricing);
            return;
        }

        setStatus('processing');
        setProgress(10);
        setMessage('Initializing video generation...');
        setGeneratedVideoUrl(null);
        setUserAccount(prev => ({ ...prev, aiCredits: prev.aiCredits - VIDEO_GENERATION_COST }));

        try {
            const base64Data = sourceImage.base64.split(',')[1] || sourceImage.base64;
            const generator = generateVideoFromImage(prompt, base64Data, sourceImage.mimeType, aspectRatio);
            for await (const result of generator) {
                if(result.status === 'processing') {
                    setProgress(result.progress);
                    setMessage(result.message);
                } else if (result.status === 'completed') {
                    setGeneratedVideoUrl(result.url);
                    setStatus('completed');
                    setMessage('Video generation successful!');
                } else if (result.status === 'error') {
                    setStatus('error');
                    setMessage(result.message);
                     setUserAccount(prev => ({ ...prev, aiCredits: prev.aiCredits + VIDEO_GENERATION_COST })); // Refund credits on error
                    if (result.message.includes('API key is invalid') || result.message.includes('Requested entity was not found')) {
                        setIsKeySelected(false); // Reset key state on invalid key error
                    }
                }
            }
        } catch (e: any) {
            setStatus('error');
            setMessage(e.message || 'An unknown error occurred.');
            setUserAccount(prev => ({ ...prev, aiCredits: prev.aiCredits + VIDEO_GENERATION_COST })); // Refund credits on error
        }
    };

    // Displays a prompt to select an API key if none is selected.
    if (!isKeySelected) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-bg-tertiary rounded-b-md text-white p-6 gap-4 text-center">
                <VideoIcon className="w-16 h-16 text-rose-500" />
                <h1 className="text-2xl font-bold font-display">Veo Video Generation</h1>
                <p className="text-text-secondary max-w-md">To generate videos with Veo, you must select an API key. Video generation is a billable service.</p>
                <p className="text-xs text-text-muted">For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-primary-blue hover:underline">billing documentation</a>.</p>
                <button onClick={handleSelectKey} className="mt-4 px-6 py-3 font-bold rounded-lg bg-gradient-to-r from-primary-blue to-primary-purple hover:brightness-110 active:scale-95 transition-all">
                    Select API Key
                </button>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white">
            <div className="flex-grow p-6 flex flex-col items-center justify-center gap-6 overflow-y-auto">
                <div className="w-full h-full min-h-[200px] flex-1 flex items-center justify-center bg-black/20 border-2 border-dashed border-white/10 rounded-xl">
                    {status === 'processing' ? (
                        <div className="flex flex-col items-center gap-3 text-rose-500 text-center p-4">
                            <SparklesIcon className="w-10 h-10 animate-pulse" />
                            <p className="font-semibold">{message}</p>
                            <div className="w-48 bg-black/30 rounded-full h-2.5">
                                <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                            </div>
                        </div>
                    ) : generatedVideoUrl ? (
                        <video src={generatedVideoUrl} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-lg"/>
                    ) : (
                        <div className="text-center text-text-muted p-4">
                            <VideoIcon className="w-16 h-16 mx-auto mb-2" />
                            <p>{message}</p>
                        </div>
                    )}
                </div>
            </div>
             <div className="p-4 border-t border-white/10 flex-shrink-0 space-y-4">
                 <div className="flex items-center gap-4">
                    <label htmlFor="video-upload" className="w-32 h-20 flex flex-col items-center justify-center bg-black/20 border border-white/10 rounded-lg cursor-pointer hover:border-rose-500 transition-colors">
                        {sourceImage ? (
                             <img src={sourceImage.base64} alt="Source for video" className="w-full h-full object-cover rounded-md"/>
                        ) : (
                             <div className="text-center">
                                <UploadIcon className="w-6 h-6 text-text-muted mb-1 mx-auto" />
                                <span className="text-xs text-text-secondary">Start Image</span>
                            </div>
                        )}
                    </label>
                    <input id="video-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A neon hologram of a cat driving at top speed"
                        disabled={status === 'processing'}
                        className="flex-grow h-12 bg-white/5 border border-white/10 rounded-lg px-4 text-text-primary focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                 </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2">
                             <span className="text-sm font-semibold">Aspect Ratio:</span>
                             <div className="bg-black/20 p-1 rounded-lg flex gap-1">
                                <button onClick={() => setAspectRatio('16:9')} className={`px-3 py-1 rounded-md text-xs font-semibold ${aspectRatio === '16:9' ? 'bg-rose-500' : 'hover:bg-white/10'}`}>16:9</button>
                                <button onClick={() => setAspectRatio('9:16')} className={`px-3 py-1 rounded-md text-xs font-semibold ${aspectRatio === '9:16' ? 'bg-rose-500' : 'hover:bg-white/10'}`}>9:16</button>
                             </div>
                         </div>
                         <div className="text-sm font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                            {t('video.credit_cost', { cost: VIDEO_GENERATION_COST })}
                         </div>
                    </div>
                    <button 
                        onClick={handleGenerate}
                        disabled={status === 'processing' || !prompt || !sourceImage}
                        className="h-12 px-6 font-bold rounded-lg bg-gradient-to-r from-rose-500 to-red-500 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Generate Video
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoGeneratorApp;