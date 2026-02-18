
import React, { useState } from 'react';
import { LauncherItem } from '../types';
import { playSound } from '../utils/sound';

interface ZenithDockProps {
  items: LauncherItem[];
  onLaunch: (item: LauncherItem) => void;
}

export const ZenithDock: React.FC<ZenithDockProps> = ({ items, onLaunch }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // We filter only "Essential" apps for the dock to simulate favorites
  const dockItems = items.filter(i => ['netflix', 'spotify', 'youtube', 'browser', 'hbo', 'disney'].includes(i.id));

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] group">
      {/* Interaction Zone (Invisible trigger area) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-32 bg-transparent" />

      {/* The Dock */}
      <div 
        className={`
            flex items-end gap-3 px-6 py-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl
            transition-all duration-500 ease-out transform translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100
        `}
      >
        {dockItems.map((item, index) => {
            const isHovered = hoverIndex === index;
            // Neighbors logic for wave effect
            const isNeighbor = hoverIndex !== null && Math.abs(hoverIndex - index) === 1;

            return (
                <button
                    key={item.id}
                    onMouseEnter={() => { setHoverIndex(index); playSound('hover'); }}
                    onMouseLeave={() => setHoverIndex(null)}
                    onClick={() => onLaunch(item)}
                    className="relative transition-all duration-200 ease-out flex flex-col items-center gap-2"
                    style={{
                        transform: isHovered ? 'scale(1.5) translateY(-20px)' : isNeighbor ? 'scale(1.2) translateY(-10px)' : 'scale(1)',
                        margin: '0 4px'
                    }}
                >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/20">
                         {item.imageUrl ? (
                             <img src={item.imageUrl} className="w-full h-full object-cover" />
                         ) : (
                             <div className={`w-full h-full bg-gradient-to-br ${item.color}`} />
                         )}
                    </div>
                    {/* Tooltip */}
                    <span 
                        className={`
                            absolute -top-8 bg-black/80 text-white text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap transition-opacity duration-200
                            ${isHovered ? 'opacity-100' : 'opacity-0'}
                        `}
                    >
                        {item.title}
                    </span>
                    {/* Active Dot */}
                    <div className="w-1 h-1 bg-white/50 rounded-full" />
                </button>
            );
        })}
      </div>
    </div>
  );
};
