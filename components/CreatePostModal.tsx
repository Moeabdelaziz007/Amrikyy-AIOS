import React, { useState } from 'react';
import { SharedContent, SocialPost, UserAccount } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
// FIX: Replaced non-existent `generateSocialMediaPost` with an import from the correct service.
import { generateSocialMediaPost } from '../services/geminiAdvancedService';
import { SparklesIcon } from './Icons';

/**
 * Props for the CreatePostModal component.
 */
interface CreatePostModalProps {
    /** The content to be shared, including its type, title, subtitle, CTA, and optional image URL. */
    content: SharedContent;
    /** Callback function to close the modal. */
    onClose: () => void;
    /** Callback function to share the content, invoked with the shared content and the generated social post. */
    onShare: (content: SharedContent, socialPost: SocialPost) => void;
    /** The user's account information, used for post authoring. */
    userAccount: UserAccount; // New: Pass user account for post authoring
}

/**
 * The CreatePostModal component allows users to preview content, generate AI-powered social media captions
 * and hashtags, and then share the content to the Nexus Feed. It also provides a simulated download option.
 * @param {CreatePostModalProps} props - The component props.
 * @returns {JSX.Element} The rendered CreatePostModal component.
 */
const CreatePostModal: React.FC<CreatePostModalProps> = ({ content, onClose, onShare, userAccount }) => {
    const { t } = useLanguage();
    const [socialPost, setSocialPost] = useState<SocialPost>({ caption: '', hashtags: [] });
    const [isGenerating, setIsGenerating] = useState(false);

    // Populate initial caption if available from content and no caption yet
    React.useEffect(() => {
        if (!socialPost.caption && content.subtitle) {
            setSocialPost(prev => ({ ...prev, caption: content.subtitle }));
        }
    }, [content.subtitle, socialPost.caption]);


    /**
     * Handles the simulated download of the shareable content.
     */
    const handleDownload = () => {
        console.log("Downloading shareable image...");
        // In a real app, you would generate a shareable image/card here.
        alert("Image download initiated (simulated).");
    };
    
    /**
     * Triggers the AI to generate a social media caption and hashtags based on the `SharedContent`.
     */
    const handleGeneratePost = async () => {
        setIsGenerating(true);
        try {
            const post = await generateSocialMediaPost(content);
            setSocialPost(post);
        } catch (error) {
            console.error(error);
            alert("Failed to generate social media post.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    /**
     * Handles posting the content and its generated social media details to the Nexus Feed.
     * Closes the modal after successful sharing.
     */
    const handlePostToFeed = () => {
        if (!socialPost.caption) {
            alert("Please generate a post before sharing.");
            return;
        }
        onShare(content, socialPost);
        onClose(); // Close after sharing
    };

    return (
        <div 
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-post-title"
        >
            <div 
                className="w-full max-w-2xl bg-bg-secondary rounded-2xl border border-border-color shadow-2xl flex flex-col animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col md:flex-row">
                    <div id="shareable-content" className="p-6 md:p-8 bg-gradient-to-br from-[#1E1B4B] to-[#0C0A1D] text-white rounded-t-2xl md:rounded-t-none md:rounded-l-2xl flex flex-col flex-1" aria-label="Shareable Content Preview">
                        {content.imageUrl && (
                            <img src={content.imageUrl} alt={content.title} className="w-full max-h-48 object-cover rounded-lg mb-4" role="img" />
                        )}
                        <p className="font-semibold text-cyan-400 mb-2">{content.cta}</p>
                        <h2 id="create-post-title" className="text-2xl md:text-3xl font-bold font-display mb-3">{content.title}</h2>
                        <p className="text-base md:text-lg text-white/80 flex-grow">{content.subtitle}</p>
                        <div className="mt-8 flex justify-between items-center border-t border-white/10 pt-4">
                            <span className="font-display font-bold text-xl">Amrikyy AI OS</span>
                            <span className="text-sm opacity-70">Powered by Gemini</span>
                        </div>
                    </div>

                    <div className="w-full md:w-64 bg-bg-tertiary p-4 flex flex-col gap-4 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl border-t md:border-t-0 md:border-l border-border-color">
                         <h3 className="font-bold text-sm">{t('share_preview.ai_post')}</h3>
                         <label htmlFor="caption-textarea" className="sr-only">AI-generated caption</label>
                         <textarea 
                            id="caption-textarea"
                            value={socialPost.caption}
                            onChange={(e) => setSocialPost(prev => ({...prev, caption: e.target.value}))}
                            rows={4}
                            placeholder="AI-generated caption..."
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-accent"
                            aria-label="AI-generated social media caption"
                         />
                         <label htmlFor="hashtags-input" className="sr-only">Hashtags</label>
                         <input
                            id="hashtags-input"
                            type="text"
                            value={socialPost.hashtags.join(' ')}
                            onChange={(e) => setSocialPost(prev => ({...prev, hashtags: e.target.value.split(' ').filter(tag => tag.startsWith('#'))}))}
                            placeholder="#hashtags"
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                            aria-label="Hashtags for social media post"
                         />
                         <button onClick={handleGeneratePost} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg bg-accent/20 text-accent hover:bg-accent/40 transition-colors disabled:opacity-50">
                            {isGenerating ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" role="status" aria-label="Generating post"><span className="sr-only">Loading...</span></div> : <SparklesIcon className="w-4 h-4" aria-hidden="true"/>}
                            {t('share_preview.generate_post')}
                         </button>
                    </div>
                </div>

                 <div className="p-4 bg-bg-tertiary/50 rounded-b-2xl flex justify-between items-center border-t border-border-color">
                     <button 
                        onClick={handleDownload}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Download image"
                    >
                        {t('share_preview.download')}
                    </button>
                    <button 
                        onClick={handlePostToFeed}
                        className="px-6 py-2 font-bold rounded-lg bg-primary-blue text-white hover:bg-primary-blue/80 transition-colors"
                        aria-label="Post to Nexus Feed"
                    >
                        {t('share_preview.post_to_feed')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;