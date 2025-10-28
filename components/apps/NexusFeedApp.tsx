import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { NexusChatIcon, SparklesIcon, SendIcon, NexusProfileIcon } from '../Icons';
import { NexusPost, AppID, UserAccount, NexusComment } from '../../types';
import { initialNexusPosts as mockNexusPosts } from '../../data/nexus'; // Mock data
import { useNotification } from '../../contexts/NotificationContext';

const BOOST_POST_COST = 50; // AI Credits

/**
 * Props for the NexusFeedApp component.
 */
interface NexusFeedAppProps {
    /** The current user's account information. */
    userAccount: UserAccount;
    /** An array of Nexus social posts to display in the feed. */
    nexusPosts: NexusPost[];
    /** Callback function to handle liking a post. */
    onLikePost: (postId: string) => void;
    /** Callback function to handle adding a comment to a post. */
    onAddComment: (postId: string, comment: NexusComment) => void;
    /** Callback function to handle boosting a post, deducting credits. */
    onBoostPost: (postId: string, cost: number) => boolean;
    /** Callback function to open another application by its ID. */
    onOpenApp: (appId: AppID, props?: any) => void;
    /** Callback function to open the CreatePostModal for creating a new post. */
    onCreatePost: (content: any, socialPost: any) => void;
}

/**
 * The NexusFeedApp component provides a social media-like feed where users can view,
 * like, comment on, and boost posts. It also allows creating new posts and navigating to user profiles.
 * @param {NexusFeedAppProps} props - The component props.
 * @returns {JSX.Element} The NexusFeedApp component.
 */
const NexusFeedApp: React.FC<NexusFeedAppProps> = ({ userAccount, nexusPosts, onLikePost, onAddComment, onBoostPost, onOpenApp, onCreatePost }) => {
    const { t } = useLanguage();

    /**
     * Handles the click event for creating a new post, opening the `CreatePostModal`.
     */
    const handleCreatePostClick = () => {
        onCreatePost({ type: 'text', title: 'New Social Post', subtitle: 'Share your thoughts!', cta: 'Create Post' }, { caption: '', hashtags: [] });
    };

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <NexusChatIcon className="w-8 h-8 text-primary-pink" aria-hidden="true" />
                    <h1 className="font-display text-2xl font-bold">{t('nexus_feed.title')}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onOpenApp(AppID.nexusProfile)} 
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-black/20 hover:bg-white/10 flex items-center gap-2"
                        aria-label={t('app_titles.nexusProfile')}
                    >
                        <NexusProfileIcon className="w-5 h-5" aria-hidden="true" />
                        <span>{t('app_titles.nexusProfile')}</span>
                    </button>
                    <button 
                        onClick={handleCreatePostClick} 
                        className="px-4 py-2 text-sm font-bold rounded-lg bg-primary-pink text-white hover:brightness-110"
                        aria-label={t('nexus_feed.create_post')}
                    >
                        {t('nexus_feed.create_post')}
                    </button>
                </div>
            </header>
            <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-6">
                    {nexusPosts.length === 0 ? (
                        <div className="text-center text-text-muted py-8" role="status">
                            <NexusChatIcon className="w-20 h-20 mx-auto mb-4" aria-hidden="true" />
                            <p className="text-xl font-bold">{t('nexus_feed.no_posts')}</p>
                            <button 
                                onClick={handleCreatePostClick} 
                                className="mt-4 px-6 py-3 font-bold rounded-lg bg-primary-pink text-white hover:brightness-110"
                                aria-label={t('nexus_feed.create_post')}
                            >
                                {t('nexus_feed.create_post')}
                            </button>
                        </div>
                    ) : (
                        nexusPosts.map(post => (
                            <NexusPostCard
                                key={post.id}
                                post={post}
                                userAccount={userAccount}
                                onLikePost={onLikePost}
                                onAddComment={onAddComment}
                                onBoostPost={onBoostPost}
                            />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

/**
 * Props for the NexusPostCard component.
 */
interface NexusPostCardProps {
    /** The individual Nexus post data. */
    post: NexusPost;
    /** The current user's account information, used for commenting and boosting. */
    userAccount: UserAccount;
    /** Callback function to handle liking the post. */
    onLikePost: (postId: string) => void;
    /** Callback function to handle adding a comment to the post. */
    onAddComment: (postId: string, comment: NexusComment) => void;
    /** Callback function to handle boosting the post. */
    onBoostPost: (postId: string, cost: number) => boolean;
}

/**
 * The NexusPostCard component displays a single social post from the Nexus Feed,
 * including author, content, engagement metrics, and options to like, comment, and boost.
 * @param {NexusPostCardProps} props - The component props.
 * @returns {JSX.Element} The NexusPostCard component.
 */
const NexusPostCard: React.FC<NexusPostCardProps> = ({ post, userAccount, onLikePost, onAddComment, onBoostPost }) => {
    const { t } = useLanguage();
    const [showComments, setShowComments] = useState(false);
    const [newCommentText, setNewCommentText] = useState('');
    const { addNotification } = useNotification();

    /**
     * Handles liking the current post by calling the `onLikePost` callback.
     */
    const handleLike = () => {
        onLikePost(post.id);
    };

    /**
     * Handles submitting a new comment to the current post.
     * Creates a new `NexusComment` and calls the `onAddComment` callback.
     */
    const handleAddCommentSubmit = () => {
        if (newCommentText.trim()) {
            const newComment: NexusComment = {
                id: `comment-${Date.now()}`,
                authorName: userAccount.name,
                osId: userAccount.osId,
                text: newCommentText.trim(),
                timestamp: Date.now(),
            };
            onAddComment(post.id, newComment);
            setNewCommentText('');
            addNotification("Comment added!", 'success', 'App');
        }
    };

    /**
     * Handles boosting the current post, deducting credits and showing a notification.
     */
    const handleBoost = () => {
        const success = onBoostPost(post.id, BOOST_POST_COST);
        if(success) {
            // Optionally, update post state to show it's boosted
            // This would typically involve a deeper state update, but for mock, a notification is sufficient.
        }
    };

    return (
        <div className="bg-black/20 p-4 rounded-lg border border-border-color shadow-lg" role="article" aria-labelledby={`post-author-${post.id}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-full bg-primary-purple flex items-center justify-center text-lg font-bold" aria-hidden="true">
                    {post.author.charAt(0)}
                </div>
                <div>
                    <p id={`post-author-${post.id}`} className="font-semibold text-white/90">{post.author}</p>
                    <p className="text-xs text-text-muted">@{post.author.toLowerCase().replace(/\s/g, '')} &bull; {new Date(parseInt(post.id.split('-')[2])).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="mb-4">
                {post.content.imageUrl && (
                    <img src={post.content.imageUrl} alt={post.content.title} className="w-full rounded-lg mb-3 object-cover max-h-80" role="img" />
                )}
                <p className="text-sm italic text-text-secondary">{post.socialPost.caption}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {post.socialPost.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs text-primary-blue bg-primary-blue/10 px-2 py-1 rounded-full" aria-label={`Hashtag ${tag}`}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-b border-white/10 py-3 text-sm text-text-muted" role="group" aria-label="Post interactions">
                <div className="flex items-center gap-4">
                    <button onClick={handleLike} className="flex items-center gap-1 hover:text-white transition-colors" aria-label={`Like post, currently has ${post.likes} likes`}>
                        <span className="material-symbols-outlined text-base" aria-hidden="true">thumb_up</span> {post.likes}
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 hover:text-white transition-colors" aria-expanded={showComments} aria-controls={`comments-section-${post.id}`} aria-label={`Toggle comments, currently ${post.comments.length} comments`}>
                        <span className="material-symbols-outlined text-base" aria-hidden="true">chat_bubble</span> {t('nexus_feed.comments_button', { count: post.comments.length })}
                    </button>
                    <span className="flex items-center gap-1" aria-label={`${post.views} views`}>
                        <span className="material-symbols-outlined text-base" aria-hidden="true">visibility</span> {post.views}
                    </span>
                </div>
                {userAccount.osId === post.osId && (
                    <button onClick={handleBoost} className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-colors" aria-label={`Boost post for ${BOOST_POST_COST} credits`}>
                        {t('nexus_feed.boost_button', { cost: BOOST_POST_COST })}
                    </button>
                )}
            </div>

            {showComments && (
                <div id={`comments-section-${post.id}`} className="mt-4 p-3 bg-black/10 rounded-lg space-y-3 animate-fade-in" aria-label="Comments section">
                    <h4 className="font-semibold text-sm mb-2">Comments</h4>
                    {post.comments.length === 0 ? (
                        <p className="text-xs text-text-muted">{t('nexus_feed.no_comments')}</p>
                    ) : (
                        post.comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-2 text-xs" role="comment" aria-label={`Comment by ${comment.authorName}`}>
                                <div className="size-6 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-xs" aria-hidden="true">{comment.authorName.charAt(0)}</div>
                                <div>
                                    <p className="font-semibold">{comment.authorName}</p>
                                    <p className="text-text-secondary">{comment.text}</p>
                                    <p className="text-text-muted text-[10px]">{new Date(comment.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                        <label htmlFor={`new-comment-input-${post.id}`} className="sr-only">Add a comment</label>
                        <input
                            id={`new-comment-input-${post.id}`}
                            type="text"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCommentSubmit()}
                            placeholder={t('nexus_feed.add_comment_placeholder')}
                            className="flex-grow bg-white/5 border border-white/10 rounded-full pl-3 pr-10 text-xs focus:ring-1 focus:ring-primary-pink focus:outline-none"
                            aria-label="Add a comment input"
                        />
                        <button onClick={handleAddCommentSubmit} disabled={!newCommentText.trim()} className="absolute right-5 bottom-5 h-7 w-7 bg-primary-pink rounded-full flex items-center justify-center hover:bg-primary-pink/80 transition-colors disabled:opacity-50" aria-label="Send comment">
                            <SendIcon className="h-4 w-4 text-white" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NexusFeedApp;