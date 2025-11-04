import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToAllChanges } from '../../packages/supabase/src';
import {
  FileMetadata,
  getUserFiles,
  uploadUserFile,
  deleteUserFile,
  downloadUserFile,
  formatFileSize,
} from '../../services/fileService';
import { TrashIcon } from '../Icons';

const FileIcon: React.FC<{ type: string }> = ({ type }) => {
  let iconName = 'draft';
  const ext = type.toLowerCase();
  
  switch (ext) {
    case 'pdf':
      iconName = 'picture_as_pdf';
      break;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      iconName = 'image';
      break;
    case 'txt':
    case 'md':
      iconName = 'description';
      break;
    case 'mp4':
    case 'mov':
    case 'avi':
      iconName = 'movie';
      break;
    case 'mp3':
    case 'wav':
      iconName = 'audio_file';
      break;
    case 'zip':
    case 'rar':
      iconName = 'folder_zip';
      break;
    default:
      iconName = 'draft';
  }
  
  return <span className="material-symbols-outlined text-gray-400">{iconName}</span>;
};

const FilesApp: React.FC = () => {
    const { user } = useAuth();
    const [files, setFiles] = useState<FileMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadFiles = useCallback(async () => {
        if (!user) return;
        
        try {
            const data = await getUserFiles(user.id);
            setFiles(data);
        } catch (error) {
            console.error('Failed to load files:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    useEffect(() => {
        if (!user) return;

        // Subscribe to real-time updates
        const channel = subscribeToAllChanges('file_metadata', (payload) => {
            if (payload.eventType === 'INSERT') {
                setFiles((prev) => [payload.new as FileMetadata, ...prev]);
            } else if (payload.eventType === 'DELETE') {
                setFiles((prev) => prev.filter((f) => f.id !== payload.old.id));
            } else if (payload.eventType === 'UPDATE') {
                setFiles((prev) =>
                    prev.map((f) => (f.id === payload.new.id ? (payload.new as FileMetadata) : f))
                );
            }
        });

        return () => {
            channel.unsubscribe();
        };
    }, [user]);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles || !user || uploading) return;

        setUploading(true);
        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                await uploadUserFile(user.id, file);
            }
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (file: FileMetadata) => {
        if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;
        
        try {
            await deleteUserFile(file.id, file.path);
        } catch (error) {
            console.error('Failed to delete file:', error);
            alert('Failed to delete file. Please try again.');
        }
    };

    const handleDownload = async (file: FileMetadata) => {
        try {
            const blob = await downloadUserFile(file);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download file:', error);
            alert('Failed to download file. Please try again.');
        }
    };

    if (!user) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-bg-secondary rounded-b-md text-white">
                <p className="text-text-secondary">Please sign in to access Files</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col bg-bg-secondary rounded-b-md text-white">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex justify-between items-center">
                <h2 className="font-semibold text-lg">My Files</h2>
                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className={`px-3 py-2 text-sm font-semibold rounded-md bg-primary-blue hover:brightness-110 flex items-center gap-2 cursor-pointer transition-colors ${
                            uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-base">upload_file</span>
                                Upload Files
                            </>
                        )}
                    </label>
                </div>
            </header>
            
            <main className="flex-grow p-4 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <span className="material-symbols-outlined text-6xl text-text-secondary">cloud_upload</span>
                        <p className="text-text-secondary">No files yet. Upload your first file!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {files.map((file) => {
                            const ext = file.name.split('.').pop() || '';
                            return (
                                <div
                                    key={file.id}
                                    className="group relative p-4 flex flex-col items-center gap-3 rounded-lg border border-border-color bg-black/20 hover:border-primary-blue/50 transition-colors"
                                >
                                    <div className="w-16 h-16 flex items-center justify-center">
                                        <FileIcon type={ext} />
                                    </div>
                                    <div className="flex-grow w-full text-center">
                                        <p className="text-sm font-medium truncate" title={file.name}>
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-text-secondary mt-1">
                                            {formatFileSize(file.size)}
                                        </p>
                                        <p className="text-xs text-text-secondary/60 mt-0.5">
                                            {new Date(file.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={() => handleDownload(file)}
                                            className="flex-1 px-2 py-1.5 text-xs font-semibold rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            Download
                                        </button>
                                        <button
                                            onClick={() => handleDelete(file)}
                                            className="px-2 py-1.5 rounded-md bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                            title="Delete file"
                                        >
                                            <TrashIcon className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default FilesApp;
