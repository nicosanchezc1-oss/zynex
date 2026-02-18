import React from 'react';
import { Trash2, Heart, Info, Share2, PlayCircle } from 'lucide-react';
import { LauncherItem } from '../types';

interface ContextMenuProps {
  position: { x: number, y: number } | null;
  item: LauncherItem | null;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ position, item, onClose }) => {
  if (!position || !item) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div 
        className="fixed z-50 w-64 bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-scaleIn origin-top-left"
        style={{ top: position.y, left: position.x }}
      >
        <div className="p-3 border-b border-white/10 bg-white/5">
            <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.type}</p>
        </div>
        <div className="p-1">
            <MenuItem icon={PlayCircle} label="Abrir" onClick={onClose} primary />
            <MenuItem icon={Heart} label="Añadir a Favoritos" onClick={onClose} />
            <MenuItem icon={Share2} label="Compartir" onClick={onClose} />
            <MenuItem icon={Info} label="Ver Detalles" onClick={onClose} />
            <div className="h-px bg-white/10 my-1" />
            <MenuItem icon={Trash2} label="Desinstalar" onClick={onClose} danger />
        </div>
      </div>
    </>
  );
};

const MenuItem: React.FC<{ icon: any, label: string, onClick: () => void, danger?: boolean, primary?: boolean }> = ({ icon: Icon, label, onClick, danger, primary }) => (
    <button 
        onClick={onClick}
        className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${danger ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:bg-white/10 hover:text-white'}
            ${primary ? 'text-indigo-400 hover:bg-indigo-500/10' : ''}
        `}
    >
        <Icon size={16} />
        {label}
    </button>
);