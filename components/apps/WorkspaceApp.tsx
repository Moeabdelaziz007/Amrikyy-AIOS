import React, { useState, useEffect, useRef } from 'react';
import { Workspace, User } from '../../types';
import { SparklesIcon, SendIcon, YouTubeIcon } from '../Icons';
import { useNotification } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';

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
                                    <p className="font-semibold">{song.title}</p>
                                    <p className="text-sm text-text-muted">{song.artist}</p>
                                </div>
                                <button><span className="material-symbols-outlined">play_arrow</span></button>
                            </div>
                        ))}
                    </div>
                );
            case 'youtube':
                return <iframe src={workspace.youtubeUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>;
            case 'whiteboard':
                return <canvas ref={canvasRef} width="800" height="600" className="w-full h-full bg-transparent"></canvas>;
            case 'notes':
            default:
                return (
                    <textarea
                        value={workspace.notes}
                        onChange={(e) => setWorkspace(w => ({ ...w, notes: e.target.value }))}
                        className="w-full h-full bg-transparent text-text-primary resize-none focus:outline-none leading-relaxed p-4"
                    />
                );
        }
    };
    
    type TabID = 'notes' | 'music' | 'youtube' | 'whiteboard';
    const tabs: {id: TabID, label: string, icon: string}[] = [
        {id: 'notes', label: 'Notes', icon: 'description'},
        {id: 'music', label: 'Music', icon: 'music_note'},
        {id: 'youtube', label: 'YouTube', icon: 'play_circle'},
        {id: 'whiteboard', label: 'Whiteboard', icon: 'draw'},
    ];

    return (
        <div className="h-full w-full flex flex-col bg-bg-secondary rounded-b-md text-white overflow-hidden">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
                <header className="flex-shrink-0 p-4 border-b border-border-color flex justify-between items-center">
                    <h1 className="font-display text-2xl font-bold">{workspace.title}</h1>
                    <div className="flex items-center">
                        <div className="flex -space-x-2 mr-4">
                            {workspace.members.map(member => (
                                <img key={member.id} src={member.avatarUrl} alt={member.name} title={member.name} className="w-8 h-8 rounded-full border-2 border-bg-secondary" />
                            ))}
                        </div>
                    </div>
                </header>
                <div className="flex-grow flex overflow-hidden">
                     <aside className="w-48 border-r border-border-color p-2 flex flex-col gap-1">
                        {tabs.map(tab => (
                             <button key={tab.id} onClick={() => setWorkspace(w => ({...w, activeTab: tab.id}))} className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm font-semibold text-left transition-colors ${workspace.activeTab === tab.id ? 'bg-accent/20 text-accent' : 'hover:bg-white/5'}`}>
                                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                                {tab.label}
                             </button>
                        ))}
                    </aside>
                    <div className="flex-1 bg-black/20">{renderContent()}</div>
                </div>
            </main>
        </div>
    );
};

export default WorkspaceApp;