import React, { useState, useEffect, useCallback } from 'react';
import { ChronoVaultIcon, SparklesIcon, TrashIcon } from '../Icons';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToAllChanges } from '../../packages/supabase/src';
import { 
  KnowledgeEntry, 
  getKnowledgeEntries, 
  createKnowledgeEntry, 
  deleteKnowledgeEntry 
} from '../../services/knowledgeService';
import QuantumFoamBackground from '../QuantumFoamBackground';

const ChronoVaultApp: React.FC = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const loadEntries = useCallback(async () => {
        if (!user) return;
        
        try {
            const data = await getKnowledgeEntries(user.id);
            setEntries(data);
        } catch (error) {
            console.error('Failed to load knowledge entries:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    useEffect(() => {
        if (!user) return;

        // Subscribe to real-time updates
        const channel = subscribeToAllChanges('knowledge_base', (payload) => {
            if (payload.eventType === 'INSERT') {
                setEntries((prev) => [payload.new as KnowledgeEntry, ...prev]);
            } else if (payload.eventType === 'DELETE') {
                setEntries((prev) => prev.filter((e) => e.id !== payload.old.id));
            } else if (payload.eventType === 'UPDATE') {
                setEntries((prev) =>
                    prev.map((e) => (e.id === payload.new.id ? (payload.new as KnowledgeEntry) : e))
                );
            }
        });

        return () => {
            channel.unsubscribe();
        };
    }, [user]);

    const handleCreate = async () => {
        if (!user || !title.trim() || !content.trim() || creating) return;
        
        setCreating(true);
        try {
            await createKnowledgeEntry(user.id, { title, content, tags: [] });
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Failed to create knowledge entry:', error);
            alert('Failed to create entry. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;
        
        try {
            await deleteKnowledgeEntry(id);
        } catch (error) {
            console.error('Failed to delete knowledge entry:', error);
            alert('Failed to delete entry. Please try again.');
        }
    };

    if (!user) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-bg-tertiary rounded-b-md text-white">
                <p className="text-text-secondary">Please sign in to access Knowledge Vault</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col bg-transparent rounded-b-md text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/50 -z-20"></div>
            <QuantumFoamBackground />
            <header className="flex-shrink-0 p-4 border-b border-white/10 flex items-center gap-3 bg-black/30 backdrop-blur-sm">
                <ChronoVaultIcon className="w-8 h-8 text-primary-purple"/>
                <h1 className="font-display text-2xl font-bold">Knowledge Vault</h1>
            </header>
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-text-secondary">No knowledge entries yet. Create your first one!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {entries.map((entry) => (
                                <div 
                                    key={entry.id} 
                                    className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-primary-purple/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-bold mb-2">{entry.title}</h3>
                                            <p className="text-text-secondary text-sm whitespace-pre-wrap">{entry.content}</p>
                                            <p className="text-xs text-text-secondary/60 mt-2">
                                                {new Date(entry.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-md transition-colors"
                                            title="Delete entry"
                                        >
                                            <TrashIcon className="w-5 h-5 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                <aside className="w-full md:w-80 flex-shrink-0 bg-black/30 backdrop-blur-sm p-4 md:p-6 border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto space-y-4">
                    <div>
                        <h2 className="text-xl font-bold font-display mb-3 flex items-center gap-2">
                            <SparklesIcon className="text-primary-pink"/>
                            New Entry
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="entry-title" className="text-sm font-medium block mb-1">
                                    Title
                                </label>
                                <input
                                    id="entry-title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Entry title..."
                                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 focus:ring-1 focus:ring-primary-pink focus:outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="entry-content" className="text-sm font-medium block mb-1">
                                    Content
                                </label>
                                <textarea 
                                    id="entry-content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write your knowledge entry..."
                                    rows={6}
                                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 focus:ring-1 focus:ring-primary-pink focus:outline-none text-sm resize-none"
                                />
                            </div>
                            <button 
                                onClick={handleCreate} 
                                disabled={creating || !title.trim() || !content.trim()} 
                                className="w-full flex items-center justify-center gap-2 py-2 font-semibold rounded-lg bg-primary-pink text-white hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creating ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <SparklesIcon />
                                )}
                                Create Entry
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ChronoVaultApp;