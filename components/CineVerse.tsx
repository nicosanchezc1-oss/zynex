
import React, { useEffect, useState } from 'react';
import { Play, Plus, ThumbsUp, X, Star, Clock, Calendar, Globe, Film } from 'lucide-react';
import { LauncherItem } from '../types';
import { playSound } from '../utils/sound';

interface CineVerseProps {
  isOpen: boolean;
  movie: LauncherItem | null;
  onClose: () => void;
  onPlay: () => void;
}

export const CineVerse: React.FC<CineVerseProps> = ({ isOpen, movie, onClose, onPlay }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setTimeout(() => setAnimate(true), 100);
    } else {
        setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black text-white overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
          <img 
            src={movie.imageUrl} 
            className={`w-full h-full object-cover transition-transform duration-[20s] ease-out ${animate ? 'scale-110' : 'scale-100'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-12 flex justify-between items-start z-20">
           <div className="flex items-center gap-2 text-red-600 font-black tracking-tighter text-3xl font-brand">
                <Film size={32} /> ZYNEX CINE
           </div>
           <button 
                onClick={() => { setAnimate(false); setTimeout(onClose, 300); playSound('back'); }}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
           >
               <X size={24} />
           </button>
      </div>

      {/* Content */}
      <div className={`
          absolute bottom-0 left-0 w-full max-w-4xl p-16 z-20 flex flex-col gap-6
          transition-all duration-700 delay-200
          ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
      `}>
          {/* Metadata Badges */}
          <div className="flex items-center gap-4 text-sm font-bold tracking-wider text-gray-300">
              <span className="text-green-400 flex items-center gap-1"><Star size={14} fill="currentColor" /> 98% Match</span>
              <span>2024</span>
              <span className="bg-gray-800 px-2 py-0.5 rounded text-xs border border-gray-600">TV-MA</span>
              <span className="flex items-center gap-1"><Clock size={14} /> 2h 35m</span>
              <span className="bg-white text-black px-2 py-0.5 rounded text-xs font-black">4K HDR</span>
          </div>

          {/* Title */}
          <h1 className="text-8xl font-black font-tech leading-none drop-shadow-2xl">
              {movie.title}
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-200 leading-relaxed max-w-2xl drop-shadow-lg">
              {movie.description || "En un futuro distópico, la humanidad lucha por sobrevivir. Una experiencia cinematográfica revolucionaria que redefine el género de ciencia ficción."}
          </p>

          {/* Cast / Details */}
          <div className="flex items-center gap-6 text-sm text-gray-400 font-medium">
              <span className="text-white"><span className="text-gray-500">Protagonistas:</span> Timothée Chalamet, Zendaya</span>
              <span className="text-white"><span className="text-gray-500">Director:</span> Denis Villeneuve</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-4">
              <button 
                onClick={() => { onPlay(); onClose(); }}
                className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg flex items-center gap-3 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                  <Play size={24} fill="black" /> Reproducir
              </button>
              
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg flex items-center gap-3 hover:bg-white/20 transition-colors border border-white/10">
                  <Plus size={24} /> Mi Lista
              </button>
              
              <button className="p-4 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-colors border border-white/10">
                  <ThumbsUp size={24} />
              </button>
          </div>
      </div>
      
      {/* Background Gradient Mesh overlay for cinematic feel */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-transparent pointer-events-none mix-blend-overlay" />
    </div>
  );
};
