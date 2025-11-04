import React, { useState, useEffect, useCallback } from 'react';
import { ChronoVaultIcon, SparklesIcon, SendIcon, /*Trash2Icon,*/ /*Edit3Icon,*/ /*PlusCircleIcon,*/ SearchIcon, TagIcon } from '../Icons';
import { useAuth } from '../../contexts/AuthContext';
import QuantumFoamBackground from '../QuantumFoamBackground';
import { getRecentKnowledge, saveKnowledge, updateKnowledge, deleteKnowledge } from '../../services/knowledgeService';
import { supabase } from '../../services/supabaseClient';

export interface Knowledge {
    id: string;
    title: string;
    content: string;
    tags: string[];
    created_at: string;
}

const ChronoVaultApp: React.FC = () => {
    const { user } = useAuth();
    const [knowledgeEntries, setKnowledgeEntries] = useState<Knowledge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingEntry, setEditingEntry] = useState<Knowledge | null>(null);

    const fetchKnowledge = useCallback(async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            const data = await getRecentKnowledge(user.id);
            setKnowledgeEntries(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchKnowledge();
    }, [fetchKnowledge]);

    const handleSaveKnowledge = async (title: string, content: string, tags: string[]) => {
        if (!user) return;
        try {
            const newEntry = await saveKnowledge(user.id, title, content, tags);
            if (newEntry) {
                setKnowledgeEntries([newEntry, ...knowledgeEntries]);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleUpdateKnowledge = async (id: string, updates: Partial<Knowledge>) => {
        try {
            const updatedEntry = await updateKnowledge(id, updates);
            if (updatedEntry) {
                setKnowledgeEntries(knowledgeEntries.map(e => e.id === id ? updatedEntry : e));
                setEditingEntry(null);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteKnowledge = async (id: string) => {
        try {
            await deleteKnowledge(id);
            setKnowledgeEntries(knowledgeEntries.filter(e => e.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const searchKnowledge = async (query: string) => {
        if (!user) return;
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('knowledge_base')
                .select()
                .textSearch('content', query);

            if (error) throw error;
            setKnowledgeEntries(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Real-time subscriptions
    useEffect(() => {
        const channel = supabase.channel('knowledge_base_changes');
        channel
            .on<Knowledge>(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'knowledge_base' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setKnowledgeEntries(entries => [payload.new as Knowledge, ...entries]);
                    } else if (payload.eventType === 'UPDATE') {
                        setKnowledgeEntries(entries =>
                            entries.map(e => e.id === (payload.new as Knowledge).id ? payload.new as Knowledge : e)
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setKnowledgeEntries(entries =>
                            entries.filter(e => e.id !== (payload.old as { id: string }).id)
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [getRecentKnowledge]);

    const filteredEntries = knowledgeEntries.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full w-full flex flex-col bg-transparent rounded-b-md text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/50 -z-20"></div>
            <QuantumFoamBackground />
            <header className="flex-shrink-0 p-4 border-b border-white/10 flex items-center justify-between gap-3 bg-black/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <ChronoVaultIcon className="w-8 h-8 text-primary-purple"/>
                    <h1 className="font-display text-2xl font-bold">Chrono Vault</h1>
                </div>
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"/>
                    <input
                        type="text"
                        placeholder="Search vault..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-black/20 border border-white/10 rounded-md py-2 pl-10 pr-4 w-64 focus:ring-1 focus:ring-primary-purple focus:outline-none"
                    />
                </div>
            </header>
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                    {isLoading && <div className="text-center">Loading knowledge base...</div>}
                    {error && <div className="text-center text-red-500">Error: {error}</div>}
                    {!isLoading && !error && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredEntries.map(entry => (
                                <div key={entry.id} className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-white/10 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg mb-2">{entry.title}</h3>
                                        <p className="text-sm text-text-secondary mb-3 line-clamp-3">{entry.content}</p>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {entry.tags?.map(tag => <span key={tag} className="bg-primary-purple/20 text-primary-purple text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>)}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-text-secondary mt-2">
                                        <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                                        <div className="flex gap-3">
                                            <button onClick={() => setEditingEntry(entry)} className="hover:text-primary-cyan"><Edit3Icon size={16}/></button>
                                             <button onClick={() => handleDeleteKnowledge(entry.id)} className="hover:text-primary-pink"><Trash2Icon size={16}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                 <aside className="w-full md:w-80 flex-shrink-0 bg-black/30 backdrop-blur-sm p-4 md:p-6 border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto">
                    <KnowledgeForm
                        onSubmit={editingEntry ? (d) => updateKnowledge(editingEntry.id, d) : (d) => saveKnowledge(d.title, d.content, d.tags)}
                        initialData={editingEntry}
                        onCancel={() => setEditingEntry(null)}
                        key={editingEntry?.id || 'new'}
                    />
                 </aside>
            </div>
        </div>
    );
};

interface KnowledgeFormProps {
    onSubmit: (data: { title: string; content: string; tags: string[] }) => void;
    initialData?: Knowledge | null;
    onCancel?: () => void;
}

const KnowledgeForm: React.FC<KnowledgeFormProps> = ({ onSubmit, initialData, onCancel }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        onSubmit({ title, content, tags: tagsArray });
        if (!initialData) {
            setTitle('');
            setContent('');
            setTags('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold font-display mb-3 flex items-center gap-2">
                {initialData ? <Edit3Icon/> : <PlusCircleIcon/>}
                {initialData ? 'Edit Entry' : 'Add New Knowledge'}
            </h2>
            <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Supabase Integration"
                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 focus:ring-1 focus:ring-primary-purple focus:outline-none"
                    required
                />
            </div>
             <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1">Content</label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Details about the knowledge..."
                    rows={5}
                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 focus:ring-1 focus:ring-primary-purple focus:outline-none"
                    required
                />
            </div>
            <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., react, supabase, typescript"
                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 focus:ring-1 focus:ring-primary-purple focus:outline-none"
                />
            </div>
            <div className="flex gap-2">
                <button type="submit" className="flex-grow flex items-center justify-center gap-2 py-2 font-semibold rounded-lg bg-primary-purple text-white hover:brightness-110 transition-colors">
                    {initialData ? 'Save Changes' : 'Save to Vault'}
                </button>
                {onCancel && <button type="button" onClick={onCancel} className="py-2 px-4 font-semibold rounded-lg bg-black/20 hover:bg-black/40 transition-colors">Cancel</button>}
            </div>
        </form>
    )
}
export default ChronoVaultApp;