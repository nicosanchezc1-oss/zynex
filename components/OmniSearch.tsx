
import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, AppWindow, Film, Settings, ShoppingBag, Command } from 'lucide-react';
import { LauncherItem, ItemType } from '../types';
import { playSound } from '../utils/sound';

interface OmniSearchProps {
  isOpen: boolean;
  onClose: () => void;
  items: LauncherItem[]; // All searchable items
  onLaunch: (item: LauncherItem) => void;
}

export const OmniSearch: React.FC<OmniSearchProps> = ({ isOpen, onClose, items, onLaunch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LauncherItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
        setQuery('');
        setResults([]);
        setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
        setResults([]);
        return;
    }

    const filtered = items.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.description?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to 5 results for TV UI

    setResults(filtered);
    setSelectedIndex(0);
  }, [query, items]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(results.length - 1, prev + 1));
            playSound('hover');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(0, prev - 1));
            playSound('hover');
        } else if (e.key === 'Enter') {
            if (results[selectedIndex]) {
                onLaunch(results[selectedIndex]);
                onClose();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const getIcon = (type: ItemType) => {
      switch(type) {
          case ItemType.APP: return <AppWindow size={16} className="text-blue-400"/>;
          case ItemType.MOVIE: return <Film size={16} className="text-red-400"/>;
          case ItemType.SETTING: return <Settings size={16} className="text-gray-400"/>;
          case ItemType.STORE: return <ShoppingBag size={16} className="text-emerald-400"/>;
          default: return <Command size={16} className="text-white"/>;
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-32 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-2xl bg-[#111] border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slideUp">
            
            {/* Input Area */}
            <div className="flex items-center gap-4 p-6 border-b border-white/10">
                <Search size={24} className="text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar apps, películas, ajustes..."
                    className="flex-1 bg-transparent border-none outline-none text-2xl text-white font-tech placeholder:text-gray-600 uppercase tracking-widest"
                    autoFocus
                />
                <div className="px-2 py-1 bg-white/10 rounded text-[10px] text-gray-400 font-bold uppercase">ESC para cerrar</div>
            </div>

            {/* Results Area */}
            <div className="max-h-[400px] overflow-y-auto p-2">
                {results.length > 0 ? (
                    results.map((item, idx) => (
                        <button
                            key={item.id}
                            onClick={() => { onLaunch(item); onClose(); }}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`
                                w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200
                                ${selectedIndex === idx ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]' : 'text-gray-400 hover:bg-white/5'}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${selectedIndex === idx ? 'bg-white/20' : 'bg-white/5'}`}>
                                    {getIcon(item.type)}
                                </div>
                                <div className="text-left">
                                    <div className={`font-bold text-lg ${selectedIndex === idx ? 'text-white' : 'text-gray-200'}`}>{item.title}</div>
                                    <div className={`text-xs uppercase tracking-wider ${selectedIndex === idx ? 'text-indigo-200' : 'text-gray-500'}`}>{item.type}</div>
                                </div>
                            </div>
                            
                            {selectedIndex === idx && <ArrowRight size={20} className="animate-pulse" />}
                        </button>
                    ))
                ) : query ? (
                    <div className="p-8 text-center text-gray-500 font-tech uppercase tracking-widest">
                        No se encontraron resultados en el sistema
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-600 font-tech uppercase tracking-widest text-sm">
                        Escribe para comenzar la búsqueda global
                    </div>
                )}
            </div>
            
            {/* Footer Hints */}
            <div className="bg-white/5 p-2 flex justify-between px-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest border-t border-white/5">
                <span className="font-brand">Zynex Indexer v1.0</span>
                <span>{results.length} Objetos encontrados</span>
            </div>
        </div>
    </div>
  );
};
