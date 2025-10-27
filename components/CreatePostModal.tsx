import React, { useState } from 'react';
import { SharedContent, SocialPost, UserAccount } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
// FIX: Replaced non-existent `generateSocialMediaPost` with a mock function.
import { generateSocialMediaPost } from '../services/geminiAdvancedService';
import { SparklesIcon } from './Icons';

interface CreatePostModalProps {
    content: SharedContent;
    onClose: () => void;
    onShare: (content: SharedContent, socialPost: SocialPost) => void;
    userAccount: UserAccount; // New: Pass user account for post authoring
}

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


    const handleDownload = () => {
        console.log("Downloading shareable image...");
        // In a real app, you would generate a shareable image/card here.
        alert("Image download initiated (simulated).");
    };
    
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
        >
            <div 
                className="w-full max-w-2xl bg-bg-secondary rounded-2xl border border-border-color shadow-2xl flex flex-col animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col md:flex-row">
                    <div id="shareable-content" className="p-6 md:p-8 bg-gradient-to-br from-[#1E1B4B] to-[#0C0A1D] text-white rounded-t-2xl md:rounded-t-none md:rounded-l-2xl flex flex-col flex-1">
                        {content.imageUrl && (
                            <img src={content.imageUrl} alt={content.title} className="w-full max-h-48 object-cover rounded-lg mb-4"/>
                        )}
                        <p className="font-semibold text-cyan-400 mb-2">{content.cta}</p>
                        <h2 className="text-2xl md:text-3xl font-bold font-display mb-3">{content.title}</h2>
                        <p className="text-base md:text-lg text-white/80 flex-grow">{content.subtitle}</p>
                        <div className="mt-8 flex justify-between items-center border-t border-white/10 pt-4">
                            <span className="font-display font-bold text-xl">Amrikyy AI OS</span>
                            <span className="text-sm opacity-70">Powered by Gemini</span>
                        </div>
                    </div>

                    <div className="w-full md:w-64 bg-bg-tertiary p-4 flex flex-col gap-4 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl border-t md:border-t-0 md:border-l border-border-color">
                         <h3 className="font-bold text-sm">{t('share_preview.ai_post')}</h3>
                         <textarea 
                            value={socialPost.caption}
                            onChange={(e) => setSocialPost(prev => ({...prev, caption: e.target.value}))}
                            rows={4}
                            placeholder="AI-generated caption..."
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-accent"
                         />
                         <input
                            type="text"
                            value={socialPost.hashtags.join(' ')}
                            onChange={(e) => setSocialPost(prev => ({...prev, hashtags: e.target.value.split(' ').filter(tag => tag.startsWith('#'))}))}
                            placeholder="#hashtags"
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                         />
                         <button onClick={handleGeneratePost} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg bg-accent/20 text-accent hover:bg-accent/40 transition-colors disabled:opacity-50">
                            {isGenerating ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-4 h-4"/>}
                            {t('share_preview.generate_post')}
                         </button>
                    </div>
                </div>

                 <div className="p-4 bg-bg-tertiary/50 rounded-b-2xl flex justify-between items-center border-t border-border-color">
                     <button 
                        onClick={handleDownload}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        {t('share_preview.download')}
                    </button>
                    <button 
                        onClick={handlePostToFeed}
                        className="px-6 py-2 font-bold rounded-lg bg-primary-blue text-white hover:bg-primary-blue/80 transition-colors"
                    >
                        {t('share_preview.post_to_feed')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;