import React, { useState, useMemo } from 'react';

interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileSystemNode[];
}

const initialFileSystem: FileSystemNode = {
  id: 'root',
  name: 'Home',
  type: 'folder',
  children: [
    {
      id: 'docs',
      name: 'Documents',
      type: 'folder',
      children: [
        { id: 'resume', name: 'Resume.pdf', type: 'file' },
        { id: 'notes', name: 'Meeting Notes.txt', type: 'file', content: '- Discuss Q3 roadmap\n- AI agent integration' },
      ],
    },
    {
      id: 'pics',
      name: 'Pictures',
      type: 'folder',
      children: [
        { id: 'vacation', name: 'Vacation.jpg', type: 'file' },
        { id: 'logo', name: 'Logo.png', type: 'file' },
      ],
    },
    { id: 'readme', name: 'README.md', type: 'file', content: '# Welcome to your file system!' },
  ],
};

const findNode = (node: FileSystemNode, id: string): FileSystemNode | null => {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
};

const addNodeToTree = (node: FileSystemNode, parentId: string, newNode: FileSystemNode): FileSystemNode => {
    if (node.id === parentId) {
        return { ...node, children: [...(node.children || []), newNode] };
    }
    if (node.children) {
        return { ...node, children: node.children.map(child => addNodeToTree(child, parentId, newNode)) };
    }
    return node;
};

const deleteNodeFromTree = (node: FileSystemNode, nodeId: string): FileSystemNode => {
    if (node.children) {
        const newChildren = node.children
            .filter(child => child.id !== nodeId)
            .map(child => deleteNodeFromTree(child, nodeId));
        return { ...node, children: newChildren };
    }
    return node;
};

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

const TreeNode: React.FC<{
  node: FileSystemNode;
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  openFolders: Set<string>;
  onToggleFolder: (id: string) => void;
}> = ({ node, selectedFolderId, onSelectFolder, openFolders, onToggleFolder }) => {
  if (node.type !== 'folder') return null;

  const isOpen = openFolders.has(node.id);
  const isSelected = selectedFolderId === node.id;

  return (
    <div className="text-sm">
      <div 
        onClick={() => onSelectFolder(node.id)}
        className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer ${isSelected ? 'bg-accent/20 text-accent' : 'hover:bg-white/5'}`}
      >
        <span onClick={(e) => { e.stopPropagation(); onToggleFolder(node.id); }} className="w-4 h-4 flex items-center justify-center">
            {node.children && node.children.length > 0 && (
                <span className={`material-symbols-outlined text-base transition-transform ${isOpen ? 'rotate-90' : ''}`}>chevron_right</span>
            )}
        </span>
        <FileIcon type="folder" name={node.name} />
        <span>{node.name}</span>
      </div>
      {isOpen && node.children && (
        <div className="pl-4 border-l border-white/10 ml-3">
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              openFolders={openFolders}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
};


const FilesApp: React.FC = () => {
    const [fileSystem, setFileSystem] = useState<FileSystemNode>(initialFileSystem);
    const [selectedFolderId, setSelectedFolderId] = useState<string>('root');
    const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(['root']));

    const selectedFolder = useMemo(() => findNode(fileSystem, selectedFolderId), [fileSystem, selectedFolderId]);

    const handleToggleFolder = (id: string) => {
        setOpenFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    const handleCreate = (type: 'file' | 'folder') => {
        const name = prompt(`Enter name for new ${type}:`);
        if (name) {
            const newNode: FileSystemNode = {
                id: `${type}-${Date.now()}`,
                name,
                type,
                children: type === 'folder' ? [] : undefined,
            };
            setFileSystem(prev => addNodeToTree(prev, selectedFolderId, newNode));
        }
    };

    const handleDelete = (nodeId: string, nodeName: string) => {
        if (confirm(`Are you sure you want to delete "${nodeName}"?`)) {
            setFileSystem(prev => deleteNodeFromTree(prev, nodeId));
        }
    };

    return (
        <div className="h-full w-full flex bg-bg-secondary rounded-b-md text-white">
            <aside className="w-64 border-r border-border-color p-3 space-y-1 overflow-y-auto">
                <TreeNode
                    node={fileSystem}
                    selectedFolderId={selectedFolderId}
                    onSelectFolder={setSelectedFolderId}
                    openFolders={openFolders}
                    onToggleFolder={handleToggleFolder}
                />
            </aside>
            <main className="flex-1 flex flex-col">
                <header className="flex-shrink-0 p-3 border-b border-border-color flex justify-between items-center">
                    <h2 className="font-semibold">{selectedFolder?.name || '...'}</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleCreate('file')} className="px-2 py-1 text-xs font-semibold rounded-md bg-white/5 hover:bg-white/10 flex items-center gap-1"><span className="material-symbols-outlined text-base">add</span> New File</button>
                        <button onClick={() => handleCreate('folder')} className="px-2 py-1 text-xs font-semibold rounded-md bg-white/5 hover:bg-white/10 flex items-center gap-1"><span className="material-symbols-outlined text-base">create_new_folder</span> New Folder</button>
                    </div>
                </header>
                <div className="flex-grow p-4 overflow-y-auto">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
                        {selectedFolder?.children?.map(item => (
                            <div key={item.id} className="group relative p-3 flex flex-col items-center justify-center text-center gap-2 rounded-lg hover:bg-white/5 cursor-pointer">
                                <FileIcon type={item.type} name={item.name} />
                                <p className="text-xs break-all">{item.name}</p>
                                <button onClick={() => handleDelete(item.id, item.name)} className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        ))}
                        {(!selectedFolder?.children || selectedFolder.children.length === 0) && (
                            <p className="text-sm text-text-muted col-span-full text-center mt-8">This folder is empty.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FilesApp;
