
import React, { useState } from 'react';
import { X, Folder, File, HardDrive, Image, Music, Film, ChevronRight } from 'lucide-react';
import { playSound } from '../utils/sound';

interface FileManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileManager: React.FC<FileManagerProps> = ({ isOpen, onClose }) => {
  const [path, setPath] = useState(['Internal Storage']);

  if (!isOpen) return null;

  const folders = [
      { name: 'DCIM', type: 'folder', items: '124 items' },
      { name: 'Downloads', type: 'folder', items: '12 items' },
      { name: 'Movies', type: 'folder', items: '45 items' },
      { name: 'Music', type: 'folder', items: '320 items' },
      { name: 'Documents', type: 'folder', items: '8 items' },
      { name: 'Android', type: 'folder', items: 'System' },
  ];

  const files = [
      { name: 'backup_config.json', type: 'file', size: '2 KB' },
      { name: 'wallpaper_4k.png', type: 'image', size: '12 MB' },
      { name: 'project_zenith.mp4', type: 'video', size: '1.2 GB' },
  ];

  const getIcon = (type: string) => {
      switch(type) {
          case 'folder': return <Folder className="text-amber-400" size={32} fill="currentColor" />;
          case 'image': return <Image className="text-purple-400" size={32} />;
          case 'video': return <Film className="text-red-400" size={32} />;
          case 'music': return <Music className="text-pink-400" size={32} />;
          default: return <File className="text-gray-400" size={32} />;
      }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-lg animate-fadeIn">
        <div className="w-[80%] h-[80%] bg-[#111] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                        <HardDrive className="text-orange-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white font-tech uppercase tracking-wider">File Core</h2>
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                            {path.map((p, i) => (
                                <React.Fragment key={i}>
                                    <span className="hover:text-white cursor-pointer">{p}</span>
                                    {i < path.length - 1 && <ChevronRight size={12} />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Storage Bar */}
            <div className="px-6 py-4 border-b border-white/5">
                <div className="flex justify-between text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
                    <span>Almacenamiento Interno</span>
                    <span>45GB / 128GB</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden flex">
                    <div className="w-[30%] bg-purple-500" />
                    <div className="w-[15%] bg-blue-500" />
                    <div className="w-[10%] bg-green-500" />
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-6 gap-6 content-start custom-scrollbar">
                {folders.map((folder, i) => (
                    <button 
                        key={i} 
                        className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                        onClick={() => playSound('hover')}
                    >
                        <div className="transform group-hover:scale-110 transition-transform duration-300">
                            {getIcon(folder.type)}
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-medium text-gray-200 truncate w-full max-w-[100px]">{folder.name}</div>
                            <div className="text-[10px] text-gray-500">{folder.items}</div>
                        </div>
                    </button>
                ))}
                {files.map((file, i) => (
                    <button 
                        key={`f-${i}`} 
                        className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                        onClick={() => playSound('hover')}
                    >
                         <div className="transform group-hover:scale-110 transition-transform duration-300">
                            {getIcon(file.type)}
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-medium text-gray-200 truncate w-full max-w-[100px]">{file.name}</div>
                            <div className="text-[10px] text-gray-500">{file.size}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};
