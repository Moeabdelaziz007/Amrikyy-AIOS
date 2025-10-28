import React, { useState, useEffect, useRef } from 'react';
import { Workspace, User } from '../../types.ts';
import { SparklesIcon, SendIcon, YouTubeIcon } from '../Icons.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import { useLanguage } from '../../contexts/LanguageContext.tsx';

const mockUsers: User[] = [
    { id: '1', name: 'You', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { id: '2', name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
    { id: '3', name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
];

const mockPlaylist = [
    { title: "Starlight Echoes", artist: "Synthwave Dreams" },
    { title: "Neon Grid", artist: "Vector Hold" },
    { title: "Midnight Drive", artist: "The Midnight" },
];

const WorkspaceApp: React.FC = () => {
    const { addNotification } = useNotification();
    const { t } = useLanguage();
    const [workspace, setWorkspace] = useState<Workspace>({
        id: '1',
        title: 'Project Phoenix - Q3 Strategy',
        activeTab: 'notes',
        notes: 'Initial brainstorming for Q3 marketing campaign:\n\n- Target Audience: Developers & AI Enthusiasts\n- Key Message: "Build Faster with AI"\n- Channels: Tech blogs, YouTube, Twitter\n- Potential Video Idea: A tutorial on building a simple AI app using Amrikyy OS.\n',
        youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        musicPlaylist: mockPlaylist,
        members: mockUsers,
    });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Simulate real-time collaboration
    useEffect(() => {
        const joinTimer = setTimeout(() => {
            addNotification(t('notifications.collab_join', { userName: 'Jane Doe' }), 'info', 'App');
        }, 3000);

        const editTimer = setTimeout(() => {
            addNotification(t('notifications.collab_edit', { userName: 'John Smith' }), 'info', 'App');
            setWorkspace(w => ({ ...w, notes: w.notes + '\n\n- John S: Added a thought on influencer marketing.' }));
        }, 8000);

        return () => {
            clearTimeout(joinTimer);
            clearTimeout(editTimer);
        };
    }, [addNotification, t]);
    
    // Whiteboard drawing logic
    useEffect(() => {
        if (workspace.activeTab === 'whiteboard' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if(!ctx) return;
            // Basic drawing setup
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            let drawing = false;
            const startDrawing = (e: MouseEvent) => { drawing = true; draw(e); };
            const stopDrawing = () => { drawing = false; ctx.beginPath(); };
            const draw = (e: MouseEvent) => {
                if (!drawing) return;
                const rect = canvas.getBoundingClientRect();
                ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
            };
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mousemove', draw);
            
            return () => {
                canvas.removeEventListener('mousedown', startDrawing);
                canvas.removeEventListener('mouseup', stopDrawing);
                canvas.removeEventListener('mousemove', draw);
            }
        }
    }, [workspace.activeTab]);


    const renderContent = () => {
        switch (workspace.activeTab) {
            case 'music':
                return (
                    <div className="p-4 space-y-3">
                        {workspace.musicPlaylist?.map(song => (
                            <div key={song.title} className="bg-black/20 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    {/* FIX: Incomplete className 'font' corrected to 'font-semibold' */}
                                    <p className="font-semibold">{song.title}</p>
                                    <p className="text-xs text-text-muted">{song.artist}</p>
                                </div>
                                <button className="p-2 rounded-full hover:bg-white/10">
                                    <span className="material-symbols-outlined">play_arrow</span>
                                </button>
                            </div>
                        ))}
                    </div>
                );
            case 'youtube':
                return (
                     <div className="p-4 h-full">
                        <iframe
                            className="w-full h-full rounded-lg"
                            src={workspace.youtubeUrl}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen>
                        </iframe>
                    </div>
                );
            case 'whiteboard':
                return (
                    <div className="p-1 h-full">
                        <canvas ref={canvasRef} className="w-full h-full bg-black/20 rounded-lg" role="canvas"></canvas>
                    </div>
                );
            case 'notes':
            default:
                return (
                     <textarea
                        value={workspace.notes}
                        onChange={(e) => setWorkspace(w => ({ ...w, notes: e.target.value }))}
                        className="w-full h-full bg-transparent p-4 text-sm text-text-secondary font-mono focus:outline-none resize-none"
                    />
                );
        }
    };
    
    return (
        <div className="h-full w-full flex flex-col bg-bg-secondary rounded-b-md text-white overflow-hidden">
             <header className="flex-shrink-0 p-3 border-b border-border-color flex items-center justify-between">
                <h1 className="font-bold text-base truncate pr-4">{workspace.title}</h1>
                 <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {workspace.members.map(member => (
                            <img key={member.id} src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full border-2 border-bg-secondary" title={member.name}/>
                        ))}
                    </div>
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent/80">Share</button>
                </div>
            </header>
            <div className="flex-grow flex">
                <nav className="w-48 border-r border-border-color p-3 space-y-1">
                    <button onClick={() => setWorkspace(w => ({ ...w, activeTab: 'notes' }))} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${workspace.activeTab === 'notes' ? 'bg-accent/20 text-accent' : 'hover:bg-white/5'}`}>
                        <span className="material-symbols-outlined text-base">description</span> Notes
                    </button>
                    <button onClick={() => setWorkspace(w => ({ ...w, activeTab: 'music' }))} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${workspace.activeTab === 'music' ? 'bg-accent/20 text-accent' : 'hover:bg-white/5'}`}>
                        <span className="material-symbols-outlined text-base">music_note</span> Music
                    </button>
                     <button onClick={() => setWorkspace(w => ({ ...w, activeTab: 'youtube' }))} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${workspace.activeTab === 'youtube' ? 'bg-accent/20 text-accent' : 'hover:bg-white/5'}`}>
                        <YouTubeIcon className="w-4 h-4" /> YouTube
                    </button>
                     <button onClick={() => setWorkspace(w => ({ ...w, activeTab: 'whiteboard' }))} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${workspace.activeTab === 'whiteboard' ? 'bg-accent/20 text-accent' : 'hover:bg-white/5'}`}>
                        <span className="material-symbols-outlined text-base">draw</span> Whiteboard
                    </button>
                </nav>
                <main className="flex-1">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default WorkspaceApp;