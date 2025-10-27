import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { NexusProfileIcon, SparklesIcon } from '../Icons';
import { UserAccount, NexusPost, AppID } from '../../types';

interface NexusProfileAppProps {
    userAccount: UserAccount;
    nexusPosts: NexusPost[]; // User's own posts
    onOpenApp: (appId: AppID, props?: any) => void;
}

const NexusProfileApp: React.FC<NexusProfileAppProps> = ({ userAccount, nexusPosts, onOpenApp }) => {
    const { t } = useLanguage();

    const totalLikes = nexusPosts.reduce((sum, post) => sum + post.likes, 0);
    const totalViews = nexusPosts.reduce((sum, post) => sum + post.views, 0);
    const avgEngagement = nexusPosts.length > 0 ? ((totalLikes / nexusPosts.length) * 100).toFixed(1) : 0;

    const handleEditProfile = () => {
        onOpenApp('settings', { initialSection: 'profile' }); // Redirect to settings for profile edit
    };

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex items-center gap-3">
                <NexusProfileIcon className="w-8 h-8 text-primary-blue"/>
                <h1 className="font-display text-2xl font-bold">{t('nexus_profile.title')}</h1>
            </header>
            <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Profile Header */}
                    <div className="bg-black/20 p-6 rounded-lg border border-border-color text-center relative">
                        <div className="size-24 rounded-full bg-primary-purple flex items-center justify-center text-5xl font-bold mx-auto mb-4 border-2 border-primary-blue">
                            {userAccount.avatar}
                        </div>
                        <h2 className="text-3xl font-bold font-display">{userAccount.name}</h2>
                        <p className="text-sm text-text-muted mt-1">@{userAccount.osId.toLowerCase().split('-').slice(-1)}</p>
                        
                        <div className="flex justify-center gap-4 mt-4">
                            <div className="text-center">
                                <p className="text-xl font-bold">{nexusPosts.length}</p>
                                <p className="text-xs text-text-secondary">{t('nexus_profile.total_posts')}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold">{totalLikes}</p>
                                <p className="text-xs text-text-secondary">{t('nexus_profile.total_likes')}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold">{avgEngagement}%</p>
                                <p className="text-xs text-text-secondary">{t('nexus_profile.avg_engagement')}</p>
                            </div>
                        </div>

                        <button onClick={handleEditProfile} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                    </div>

                    {/* Veridian ID Details */}
                    <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><NexusProfileIcon className="w-5 h-5 text-primary-cyan"/> Veridian ID</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{t('veridian_id.os_id')}</span>
                                <span className="font-mono text-white/90">{userAccount.osId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{t('veridian_id.join_date')}</span>
                                <span className="font-mono text-white/90">{userAccount.joinDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{t('veridian_id.trust_score')}</span>
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="w-4 h-4 text-green-400" />
                                    <span className="font-mono text-green-400">{userAccount.trustScore}/100</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User's Posts */}
                    <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                        <h3 className="font-bold text-lg mb-3">{t('nexus_profile.user_posts')}</h3>
                        {nexusPosts.length === 0 ? (
                            <p className="text-sm text-text-muted text-center py-4">No posts yet. Share your first creation!</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {nexusPosts.map(post => (
                                    <div key={post.id} className="bg-black/10 p-3 rounded-lg border border-white/5">
                                        {post.content.imageUrl && (
                                            <img src={post.content.imageUrl} alt={post.content.title} className="w-full h-32 object-cover rounded-md mb-2"/>
                                        )}
                                        <p className="font-semibold text-sm line-clamp-2">{post.socialPost.caption}</p>
                                        <div className="flex items-center gap-3 text-xs text-text-muted mt-2">
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">thumb_up</span> {post.likes}</span>
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">chat_bubble</span> {post.comments.length}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NexusProfileApp;