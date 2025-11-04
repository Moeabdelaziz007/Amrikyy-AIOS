import React, { useState } from 'react';
import { ImageIcon, SparklesIcon } from '../Icons.tsx';
import { generateImage } from '../../services/geminiAdvancedService.ts';
import { AppID } from '../../types.ts';

interface ImageGeneratorAppProps {
    onOpenApp: (appId: AppID, props?: any) => void;
}

const ImageGeneratorApp: React.FC<ImageGeneratorAppProps> = ({ onOpenApp }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt || isLoading) return;
        setIsLoading(true);
        setGeneratedImage(null);
        setError(null);
        try {
            const imageUrl = await generateImage(prompt);
            setGeneratedImage(imageUrl);
        } catch (e: any) {
            setError(e.message || 'Failed to generate image. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendTo = (appId: AppID) => {
        if (!generatedImage) return;
        const props = {
            initialImage: {
                base64: generatedImage,
                mimeType: 'image/png'
            }
        };
        onOpenApp(appId, props);
    };

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white">
            <div className="flex-grow p-6 flex flex-col items-center justify-center gap-6 overflow-y-auto">
                <div className="w-full h-full min-h-[200px] flex-1 flex items-center justify-center bg-black/20 border-2 border-dashed border-white/10 rounded-xl relative group">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2 text-primary-pink text-center">
                             <SparklesIcon className="w-10 h-10 animate-pulse" />
                             <p className="font-semibold">Generating your vision...</p>
                        </div>
                    ) : generatedImage ? (
                        <>
                            <img src={generatedImage} alt="AI generated" className="max-w-full max-h-full object-contain rounded-lg"/>
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleSendTo(AppID.video)} className="bg-black/50 backdrop-blur-sm p-2 rounded-lg text-xs font-semibold hover:bg-rose-500 transition-colors">Send to Video Studio</button>
                                <button onClick={() => handleSendTo(AppID.imageAnalyzer)} className="bg-black/50 backdrop-blur-sm p-2 rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-colors">Analyze Image</button>
                            </div>
                        </>
                    ) : error ? (
                        <p className="text-red-400">{error}</p>
                    ) : (
                        <div className="text-center text-text-muted">
                            <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                            <p>Your result will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
             <div className="p-4 border-t border-white/10 flex-shrink-0">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A robot holding a red skateboard"
                        disabled={isLoading}
                        className="flex-grow h-12 bg-white/5 border border-white/10 rounded-lg px-4 text-text-primary focus:ring-2 focus:ring-primary-pink focus:outline-none transition-all duration-300"
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="h-12 px-6 font-bold rounded-lg bg-gradient-to-r from-primary-pink to-rose-500 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageGeneratorApp;