import React, { useState } from 'react';
import { ImageIcon, SparklesIcon, UploadIcon } from '../Icons.tsx';
import { generateImage, editImage } from '../../services/geminiAdvancedService.ts';
import { fileToBase64 } from '../../utils/fileUtils.ts';
import { AppID } from '../../types.ts';

/**
 * Defines the mode of operation for the image generator.
 */
type Mode = 'generate' | 'edit';

/**
 * Props for the ImageGeneratorApp component.
 */
interface ImageGeneratorAppProps {
    /** Callback function to open another application by its ID. */
    onOpenApp: (appId: AppID, props?: any) => void;
}

/**
 * The ImageGeneratorApp component allows users to generate new images from text prompts
 * or edit existing images using AI. It also provides options to send generated images
 * to other applications.
 * @param {ImageGeneratorAppProps} props - The component props.
 * @returns {JSX.Element} The ImageGeneratorApp component.
 */
const ImageGeneratorApp: React.FC<ImageGeneratorAppProps> = ({ onOpenApp }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [mode, setMode] = useState<Mode>('generate');
    const [sourceImage, setSourceImage] = useState<{file: File, base64: string} | null>(null);

    /**
     * Handles the image generation process based on the current prompt.
     */
    const handleGenerate = async () => {
        if (!prompt || isLoading) return;
        setIsLoading(true);
        setGeneratedImage(null);
        setError(null);
        try {
            const imageUrl = await generateImage(prompt);
            setGeneratedImage(imageUrl);
        } catch (e) {
            setError('Failed to generate image. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles the image editing process, applying the prompt to the source image.
     */
    const handleEdit = async () => {
        if (!prompt || !sourceImage || isLoading) return;
        setIsLoading(true);
        setGeneratedImage(null);
        setError(null);
        try {
            const editedImageUrl = await editImage(prompt, sourceImage.base64.split(',')[1], sourceImage.file.type);
            setGeneratedImage(editedImageUrl);
        } catch (e) {
            setError('Failed to edit image. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles the file input change for uploading a source image for editing.
     * Converts the selected file to base64.
     * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event.
     */
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const base64 = await fileToBase64(file);
            setSourceImage({ file, base64 });
            setGeneratedImage(null);
            setError(null);
        } else {
            setError('Please select a valid image file.');
        }
    };

    /**
     * Submits the current action (generate or edit) based on the selected mode.
     */
    const handleSubmit = () => {
        if (mode === 'generate') {
            handleGenerate();
        } else {
            handleEdit();
        }
    };

    /**
     * Sends the generated image to another specified application.
     * @param {AppID} appId - The ID of the target application.
     */
    const handleSendTo = (appId: AppID) => {
        if (!generatedImage) return;
        
        const props = {
            initialImage: {
                base64: generatedImage,
                mimeType: 'image/png' // Assuming PNG from our generator
            }
        };
        onOpenApp(AppID.video, props);
    };

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white">
            <div className="p-4 border-b border-border-color flex justify-center">
                <div className="bg-black/20 p-1 rounded-lg flex gap-1">
                    <button onClick={() => setMode('generate')} className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${mode === 'generate' ? 'bg-primary-pink text-white' : 'hover:bg-white/10'}`}>Generate</button>
                    <button onClick={() => setMode('edit')} className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${mode === 'edit' ? 'bg-primary-pink text-white' : 'hover:bg-white/10'}`}>Edit</button>
                </div>
            </div>
            <div className="flex-grow p-6 flex flex-col items-center justify-center gap-6 overflow-y-auto">
                {mode === 'edit' && (
                    <label htmlFor="image-upload" className="w-full h-40 flex flex-col items-center justify-center bg-black/20 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary-pink transition-colors">
                        {sourceImage ? (
                            <img src={sourceImage.base64} alt="Source for editing" className="max-w-full max-h-full object-contain rounded-lg"/>
                        ) : (
                            <>
                                <UploadIcon className="w-8 h-8 text-text-muted mb-2" />
                                <span className="text-text-secondary">Click to upload image to edit</span>
                            </>
                        )}
                    </label>
                )}
                 <input id="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />

                <div className="w-full h-full min-h-[200px] flex-1 flex items-center justify-center bg-black/20 border-2 border-dashed border-white/10 rounded-xl relative group">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2 text-primary-pink text-center">
                             <SparklesIcon className="w-10 h-10 animate-pulse" />
                             <p className="font-semibold">{mode === 'generate' ? 'Generating your vision...' : 'Applying your edits...'}</p>
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
                        placeholder={mode === 'generate' ? "e.g., A robot holding a red skateboard" : "e.g., Add a retro filter"}
                        disabled={isLoading}
                        className="flex-grow h-12 bg-white/5 border border-white/10 rounded-lg px-4 text-text-primary focus:ring-2 focus:ring-primary-pink focus:outline-none transition-all duration-300"
                    />
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading || !prompt || (mode === 'edit' && !sourceImage)}
                        className="h-12 px-6 font-bold rounded-lg bg-gradient-to-r from-primary-pink to-rose-500 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {mode === 'generate' ? 'Generate' : 'Edit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageGeneratorApp;