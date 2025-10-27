import React from 'react';
import { NexusPost } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { NexusChatIcon } from '../Icons'; // Use NexusChatIcon

interface NexusFeedWidgetProps {
    posts: NexusPost[];
}

const NexusFeedWidget: React.FC<NexusFeedWidgetProps> = ({ posts }) => {
    const { t } = useLanguage();

    return (
        <div className="glass-effect rounded-xl">
             <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <NexusChatIcon className="text-primary-pink text-lg" />
                    <h2 className="font-medium text-sm">{t('nexus_feed.title')}</h2>
                </div>
            </div>
            <div className="space-y-4 p-4 max-h-96 overflow-y-auto">
                {posts.length === 0 && <p className="text-xs text-center text-text-muted py-4">{t('nexus_feed.no_posts')}</p>}
                {posts.map(post => (
                    <div key={post.id} className="bg-black/20 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="size-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">{post.author.charAt(0)}</div>
                            <div>
                                <p className="text-xs font-semibold">{post.author}</p>
                                <p className="text-[10px] text-text-muted">@{post.osId.toLowerCase().split('-').slice(-1)}</p>
                            </div>
                        </div>
                        <p className="text-xs text-text-secondary mb-2 italic">"{post.socialPost.caption}"</p>
                        <p className="text-[10px] text-primary-blue">{post.socialPost.hashtags.join(' ')}</p>
                        {post.content.imageUrl && (
                            <img src={post.content.imageUrl} alt={post.content.title} className="w-full h-24 object-cover rounded-md mt-2"/>
                        )}
                        <div className="flex items-center gap-4 text-xs text-text-muted mt-3 pt-2 border-t border-white/5">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">thumb_up</span> {post.likes}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">chat_bubble</span> {post.comments.length}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">visibility</span> {post.views}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NexusFeedWidget;