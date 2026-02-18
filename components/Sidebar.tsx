
import React from 'react';
import { Category } from '../types';
import * as Icons from 'lucide-react';

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: string;
  isFocused: boolean;
  onSelectCategory: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategoryId, isFocused, onSelectCategory }) => {
  return (
    <div 
      className={`
        relative h-full flex flex-col py-12 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] z-30
        ${isFocused ? 'w-80 bg-[var(--bg-main)]/90 backdrop-blur-2xl border-r border-[var(--border)] shadow-2xl' : 'w-24 bg-transparent'}
      `}
    >
      {/* Brand */}
      <div className="flex items-center gap-5 mb-16 px-8 group cursor-default select-none">
        <div className={`
            relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 
            bg-gradient-to-br from-indigo-600 to-violet-700 shadow-[0_0_30px_rgba(99,102,241,0.4)]
            transition-transform duration-500 group-hover:scale-110 overflow-hidden
        `}>
          {/* Custom Logo Image */}
          <img 
            src="https://i.imgur.com/mNF4rFq.png" 
            alt="Zynex Logo" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
        </div>
        
        <div className={`overflow-hidden transition-all duration-500 ${isFocused ? 'opacity-100 max-w-[200px] translate-x-0' : 'opacity-0 max-w-0 -translate-x-4'}`}>
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-wider text-[var(--text-main)] leading-none font-brand">
              ZYNEX
            </span>
            <span className="text-[9px] font-bold tracking-[0.4em] text-[var(--accent)] uppercase mt-1 font-tech">
              VISION
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4">
        {categories.map((cat) => {
          const Icon = (Icons as any)[cat.icon];
          const isActive = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`
                relative flex items-center gap-5 p-4 rounded-xl w-full text-left outline-none group
                transition-all duration-300 ease-out
                ${isActive 
                  ? 'bg-[var(--bg-surface)] shadow-lg border border-[var(--border)]' 
                  : 'hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border)]'}
              `}
            >
              {/* Active Bar */}
              <div className={`
                absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[var(--accent)] rounded-r-full shadow-[0_0_15px_var(--accent)]
                transition-all duration-300 ${isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}
              `} />

              <Icon 
                size={22} 
                className={`
                  shrink-0 transition-all duration-300 
                  ${isActive ? 'text-[var(--text-main)] scale-110' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}
                `} 
              />
              
              <div className={`overflow-hidden transition-all duration-300 ${isFocused ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-4'}`}>
                <span className={`text-base font-medium tracking-wide ${isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}>
                  {cat.name}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className={`mt-auto px-8 transition-all duration-500 delay-100 ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] backdrop-blur-md">
            <div className="flex items-center gap-3 text-[var(--text-muted)] mb-2">
            <Icons.Wifi size={14} className="text-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase font-tech">Conectado</span>
            </div>
            <div className="h-0.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-3/4 shadow-[0_0_10px_#10b981]" />
            </div>
        </div>
      </div>
    </div>
  );
};
