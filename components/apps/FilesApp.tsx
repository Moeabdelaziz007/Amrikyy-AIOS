import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface FileMetadata {
    id: string;
    user_id: string;
    path: string;
    name: string;
    size: number;
    mime_type: string;
    created_at: string;
}

const BUCKET_NAME = 'user_files';

const FileIcon: React.FC<{ type: 'folder' | 'file'; name: string }> = ({ type, name }) => {
  let iconName = 'draft';
  if (type === 'folder') {
    iconName = 'folder';
  } else {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': iconName = 'picture_as_pdf'; break;
      case 'jpg': case 'jpeg': case 'png': case 'gif': iconName = 'image'; break;
      case 'txt': case 'md': iconName = 'description'; break;
      default: iconName = 'draft';
    }
  }
  return <span className={`material-symbols-outlined ${type === 'folder' ? 'text-amber-400' : 'text-gray-400'}`}>{iconName}</span>;
};

const FilesApp: React.FC = () => {
    const { user } = useAuth();
    const [files, setFiles] = useState<FileMetadata[]>([]);
    const [currentPath, setCurrentPath] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const listFiles = useCallback(async (path: string) => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('file_metadata')
                .select('*')
                .eq('user_id', user.id)
                .eq('path', path);
            if (error) throw error;
            setFiles(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        listFiles(currentPath);

        const channel = supabase.channel('files-changes');
        channel
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'file_metadata', filter: `user_id=eq.${user?.id}` },
                () => listFiles(currentPath)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentPath, listFiles, user]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        const filePath = `${currentPath ? currentPath + '/' : ''}${file.name}`;

        try {
            // Upload file to storage
            const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
            if (uploadError) throw uploadError;

            // Add metadata to database
            const { error: metadataError } = await supabase.from('file_metadata').insert({
                user_id: user.id,
                path: currentPath,
                name: file.name,
                size: file.size,
                mime_type: file.type,
            });
            if (metadataError) throw metadataError;

            listFiles(currentPath);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteFile = async (file: FileMetadata) => {
        if (!user) return;
        if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;

        const filePath = `${file.path ? file.path + '/' : ''}${file.name}`;

        try {
            // Delete from storage
            const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
            if (storageError) throw storageError;

            // Delete metadata
            const { error: metadataError } = await supabase.from('file_metadata').delete().eq('id', file.id);
            if (metadataError) throw metadataError;

            setFiles(files.filter(f => f.id !== file.id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDownloadFile = async (file: FileMetadata) => {
        const filePath = `${file.path ? file.path + '/' : ''}${file.name}`;
        try {
            const { data, error } = await supabase.storage.from(BUCKET_NAME).download(filePath);
            if (error) throw error;
            const blob = new Blob([data], { type: file.mime_type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const formatSize = (size: number) => {
        if (size < 1024) return `${size} B`;
        if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / 1048576).toFixed(1)} MB`;
    }

    // This is a simplified folder navigation. A real app would need a more robust tree structure.
    const folders = useMemo(() => {
        const folderSet = new Set<string>();
        files.forEach(file => {
            const parts = file.path.split('/');
            if (parts.length > 1) {
                folderSet.add(parts[0]);
            }
        });
        return Array.from(folderSet);
    }, [files]);


    return (
        <div className="h-full w-full flex bg-bg-secondary rounded-b-md text-white">
            <aside className="w-64 border-r border-border-color p-3 space-y-1 overflow-y-auto">
                <div onClick={() => setCurrentPath('')} className={`p-1.5 rounded-md cursor-pointer ${currentPath === '' ? 'bg-accent/20' : ''}`}>Home</div>
                {folders.map(folder => (
                    <div key={folder} onClick={() => setCurrentPath(folder)} className={`p-1.5 rounded-md cursor-pointer ${currentPath === folder ? 'bg-accent/20' : ''}`}>{folder}</div>
                ))}
            </aside>
            <main className="flex-1 flex flex-col">
                <header className="flex-shrink-0 p-3 border-b border-border-color flex justify-between items-center">
                    <h2 className="font-semibold">/{currentPath}</h2>
                    <div className="flex items-center gap-2">
                        <label className="px-2 py-1 text-xs font-semibold rounded-md bg-white/5 hover:bg-white/10 flex items-center gap-1 cursor-pointer">
                            <span className="material-symbols-outlined text-base">add</span> Upload File
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                </header>
                <div className="flex-grow p-4 overflow-y-auto">
                    {isLoading && <p>Loading...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
                        {files.map(item => (
                            <div key={item.id} className="group relative p-3 flex flex-col items-center justify-center text-center gap-2 rounded-lg hover:bg-white/5 cursor-pointer">
                                <FileIcon type='file' name={item.name} />
                                <p className="text-xs break-all">{item.name}</p>
                                <p className="text-xs text-text-secondary">{formatSize(item.size)}</p>
                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDownloadFile(item)} className="p-1 rounded-full bg-blue-500/80 text-white">
                                        <span className="material-symbols-outlined text-sm">download</span>
                                    </button>
                                    <button onClick={() => handleDeleteFile(item)} className="p-1 rounded-full bg-red-500/80 text-white">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!isLoading && files.length === 0 && (
                            <p className="text-sm text-text-muted col-span-full text-center mt-8">This folder is empty.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FilesApp;
