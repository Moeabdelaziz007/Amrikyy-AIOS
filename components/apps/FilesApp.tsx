import React from 'react';
import { FileIcon } from '../Icons';

/**
 * The FilesApp component represents a file explorer application.
 * It currently displays a placeholder message indicating future development.
 * @returns {JSX.Element} The FilesApp component.
 */
const FilesApp: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-bg-tertiary rounded-b-md text-white p-6">
       <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-2xl">
                <FileIcon className="w-12 h-12" />
            </div>
            <h1 className="font-display text-3xl font-bold">File Explorer</h1>
            <p className="text-text-secondary max-w-sm">
                This feature is currently under development. Soon you'll be able to manage your local and cloud files directly within Amrikyy AI OS.
            </p>
        </div>
    </div>
  );
};

export default FilesApp;