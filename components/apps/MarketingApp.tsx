import React, { useState } from 'react';
import { generateSeoIdeas, createAdCopy } from '../../services/geminiAdvancedService';
import { SparklesIcon, SearchIcon, TripIcon } from '../Icons';
import { useNotification } from '../../contexts/NotificationContext';

type Tab = 'seo' | 'ads' | 'social';

interface SEOData {
    keywords: string[];
    blogOutline: {
        title: string;
        points: string[];
    };
    adCopy: string[];
}

const MarketingApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('seo');

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-8 h-8 text-primary-pink"/>
                    <h1 className="font-display text-2xl font-bold">Marketing Copilot</h1>
                </div>
                <nav className="flex gap-2 bg-black/20 p-1 rounded-lg w-full sm:w-auto">
                    <TabButton id="seo" activeTab={activeTab} setActiveTab={setActiveTab} label="SEO" />
                    <TabButton id="ads" activeTab={activeTab} setActiveTab={setActiveTab} label="Ads" />
                    <TabButton id="social" activeTab={activeTab} setActiveTab={setActiveTab} label="Social" />
                </nav>
            </header>
            <main className="flex-grow overflow-y-auto">
                {activeTab === 'seo' && <SEOPlannerView />}
                {activeTab === 'ads' && <AdCampaignGeneratorView />}
                {activeTab === 'social' && <SocialAnalyticsView />}
            </main>
        </div>
    );
};

const TabButton: React.FC<{id: Tab, activeTab: Tab, setActiveTab: (tab: Tab) => void, label: string}> = ({ id, activeTab, setActiveTab, label }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === id ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
    >
        {label}
    </button>
);

const SEOPlannerView: React.FC = () => {
    const [url, setUrl] = useState('');
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [seoData, setSeoData] = useState<SEOData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!url || !topic) {
            setError('Please provide both a URL and a topic.');
            return;
        }
        setIsLoading(true);
        setSeoData(null);
        setError(null);
        try {
            const data = await generateSeoIdeas(url, topic);
            setSeoData(data);
        } catch (e) {
            setError('Failed to generate SEO ideas. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-1 flex flex-col gap-4">
                <h2 className="font-display text-xl font-bold">Content Input</h2>
                <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-border-color">
                    <div>
                        <label htmlFor="url-input" className="block text-sm font-medium text-text-secondary mb-2">Website URL</label>
                        <input type="url" id="url-input" placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-md p-2 focus:ring-2 focus:ring-primary-pink focus:outline-none" />
                    </div>
                    <div>
                        <label htmlFor="topic-input" className="block text-sm font-medium text-text-secondary mb-2">Primary Topic/Keyword</label>
                        <input type="text" id="topic-input" placeholder="e.g., AI-powered travel planning" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-md p-2 focus:ring-2 focus:ring-primary-pink focus:outline-none" />
                    </div>
                </div>
                 <button onClick={handleGenerate} disabled={isLoading} className="w-full font-bold py-3 px-4 rounded-lg bg-gradient-to-r from-primary-pink to-rose-500 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50">
                    {isLoading ? 'Generating Strategy...' : 'Generate AI Strategy'}
                </button>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </div>
            <div className="lg:col-span-2 bg-black/20 rounded-lg border border-border-color p-4 overflow-y-auto">
                {isLoading ? (
                     <div className="flex items-center justify-center h-full gap-3 text-primary-pink">
                        <SparklesIcon className="w-8 h-8 animate-pulse" />
                        <p className="text-lg">Analyzing and creating your strategy...</p>
                    </div>
                ) : seoData ? (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-display text-lg font-bold mb-2 text-primary-pink">Target Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {seoData.keywords.map((kw, i) => <span key={i} className="bg-bg-tertiary px-2 py-1 rounded text-sm">{kw}</span>)}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-display text-lg font-bold mb-2 text-primary-pink">Blog Post Outline: "{seoData.blogOutline.title}"</h3>
                            <ul className="list-disc list-inside space-y-1 text-text-secondary">
                                {seoData.blogOutline.points.map((pt, i) => <li key={i}>{pt}</li>)}
                            </ul>
                        </div>
                        <div>
                             <h3 className="font-display text-lg font-bold mb-2 text-primary-pink">Ad Copy Headlines</h3>
                             <div className="space-y-2">
                                {seoData.adCopy.map((ad, i) => <p key={i} className="bg-bg-tertiary p-2 rounded text-sm italic">"{ad}"</p>)}
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted">
                        <h2 className="text-xl font-bold">Your AI-Generated SEO Plan</h2>
                        <p>Results will appear here once you provide a URL and topic.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AdCampaignGeneratorView: React.FC = () => {
    const { addNotification } = useNotification();
    const [productDescription, setProductDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [adCopy, setAdCopy] = useState<{headline: string, body: string, cta: string} | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateAd = async () => {
        if (!productDescription || !targetAudience) {
            setError('Please provide both a product description and target audience.');
            return;
        }
        setIsLoading(true);
        setAdCopy(null);
        setError(null);
        try {
            const result = await createAdCopy(productDescription, targetAudience);
            setAdCopy(result);
            addNotification('Ad copy generated successfully!', 'success');
        } catch (e) {
            setError('Failed to generate ad copy. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-1 flex flex-col gap-4">
                <h2 className="font-display text-xl font-bold">AI Ad Studio</h2>
                <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-border-color">
                    <div>
                        <label htmlFor="product-desc" className="block text-sm font-medium text-text-secondary mb-2">Product/Service Description</label>
                        <textarea id="product-desc" rows={4} placeholder="e.g., An AI-powered OS for creative professionals" value={productDescription} onChange={e => setProductDescription(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-md p-2 focus:ring-2 focus:ring-primary-pink focus:outline-none resize-none" />
                    </div>
                    <div>
                        <label htmlFor="target-audience" className="block text-sm font-medium text-text-secondary mb-2">Target Audience</label>
                        <input type="text" id="target-audience" placeholder="e.g., Tech enthusiasts, designers" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-md p-2 focus:ring-2 focus:ring-primary-pink focus:outline-none" />
                    </div>
                </div>
                 <button onClick={handleGenerateAd} disabled={isLoading} className="w-full font-bold py-3 px-4 rounded-lg bg-gradient-to-r from-primary-pink to-rose-500 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50">
                    {isLoading ? 'Generating Ad...' : 'Generate AI Ad Copy'}
                </button>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </div>
            <div className="lg:col-span-2 bg-black/20 rounded-lg border border-border-color p-4 overflow-y-auto">
                {isLoading ? (
                     <div className="flex items-center justify-center h-full gap-3 text-primary-pink">
                        <SparklesIcon className="w-8 h-8 animate-pulse" />
                        <p className="text-lg">Crafting your perfect ad...</p>
                    </div>
                ) : adCopy ? (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-display text-lg font-bold mb-2 text-primary-pink">Headline</h3>
                            <p className="bg-bg-tertiary p-3 rounded text-sm italic">"{adCopy.headline}"</p>
                        </div>
                        <div>
                            <h3 className="font-display text-lg font-bold mb-2 text-primary-pink">Body Copy</h3>
                            <p className="bg-bg-tertiary p-3 rounded text-sm text-text-secondary">{adCopy.body}</p>
                        </div>
                        <div>
                             <h3 className="font-display text-lg font-bold mb-2 text-primary-pink">Call to Action</h3>
                             <p className="bg-bg-tertiary p-3 rounded text-sm font-semibold text-center">{adCopy.cta}</p>
                        </div>
                        <button className="w-full py-2 font-bold rounded-lg bg-accent/20 text-accent hover:bg-accent/40 transition-colors">Launch Campaign (Simulated)</button>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted">
                        <h2 className="text-xl font-bold">Your AI-Generated Ad Campaign</h2>
                        <p>Results will appear here once you provide details.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SocialAnalyticsView: React.FC = () => (
    <div className="h-full w-full p-6 text-center flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-9xl mb-4 text-purple-400/20">analytics</span>
        <h2 className="text-2xl font-bold font-display">Social Analytics for Nexus</h2>
        <p className="text-text-muted max-w-md">Track your post performance, engagement rates, and audience growth on the Nexus social platform.</p>
        <p className="text-sm text-text-secondary mt-4">Feature coming soon: Real-time dashboards and detailed insights into your social impact.</p>
    </div>
);

export default MarketingApp;