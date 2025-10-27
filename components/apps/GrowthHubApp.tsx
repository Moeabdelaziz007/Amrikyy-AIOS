import React from 'react';
import { UserAccount, CreatorBounty } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { GrowthHubIcon, SparklesIcon } from '../Icons';

interface GrowthHubAppProps {
    userAccount: UserAccount;
    bounties: CreatorBounty[];
    completedBounties: Set<string>;
    onCompleteBounty: (bountyId: string) => void;
}

const GrowthHubApp: React.FC<GrowthHubAppProps> = ({ userAccount, bounties, completedBounties, onCompleteBounty }) => {
    const { t } = useLanguage();

    const totalCreditsEarned = bounties
        .filter(b => completedBounties.has(b.id))
        .reduce((sum, b) => sum + b.creditReward, 0);

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex items-center gap-3">
                <GrowthHubIcon className="w-8 h-8 text-lime-400"/>
                <h1 className="font-display text-2xl font-bold">{t('growth_hub.title')}</h1>
            </header>
            <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-black/20 p-4 rounded-lg border border-border-color text-center">
                        <h3 className="text-sm text-text-secondary">{t('growth_hub.creator_score')}</h3>
                        <p className="text-4xl font-bold text-lime-400 flex items-center justify-center gap-2">
                            <SparklesIcon />
                            {userAccount.creatorScore || 0}
                        </p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg border border-border-color text-center">
                        <h3 className="text-sm text-text-secondary">Bounties Completed</h3>
                        <p className="text-4xl font-bold">{completedBounties.size} / {bounties.length}</p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg border border-border-color text-center">
                        <h3 className="text-sm text-text-secondary">Total Credits Earned</h3>
                        <p className="text-4xl font-bold">{totalCreditsEarned.toLocaleString()}</p>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold font-display">{t('growth_hub.bounties')}</h2>
                    <p className="text-sm text-text-secondary mb-4">{t('growth_hub.bounties_desc')}</p>
                    <div className="space-y-4">
                        {bounties.map(bounty => {
                            const isCompleted = completedBounties.has(bounty.id);
                            return (
                                <div key={bounty.id} className={`p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-black/20 border-border-color'}`}>
                                    <div>
                                        <h3 className="font-bold text-lg">{bounty.title}</h3>
                                        <p className="text-sm text-text-secondary">{bounty.description}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex items-center gap-4">
                                        <span className="font-bold text-lime-400">+{bounty.creditReward} Credits</span>
                                        <button 
                                            onClick={() => onCompleteBounty(bounty.id)}
                                            disabled={isCompleted}
                                            className="px-4 py-2 font-semibold rounded-lg text-sm bg-lime-500 text-black hover:bg-lime-400 disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed"
                                        >
                                            {isCompleted ? t('growth_hub.completed') : t('growth_hub.claim_reward')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GrowthHubApp;
