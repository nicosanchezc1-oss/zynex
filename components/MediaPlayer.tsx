
import React, { useState, useEffect } from 'react';
import { Play, Pause, Disc, Maximize2, X } from 'lucide-react';

interface MediaPlayerProps {
  pipMode?: boolean;
  onExpand?: () => void;
  onClose?: () => void;
  initialState?: boolean;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ pipMode, onExpand, onClose, initialState = false }) => {
  const [isPlaying, setIsPlaying] = useState(initialState);
  const [progress, setProgress] = useState(30);

  // Simulate progress
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 0.5));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Si está en modo PiP y cerrado (simulamos que no hay media), no renderizar
  // Pero para la demo siempre mostramos el widget si no es PiP, o si es PiP activado
  
  const containerClass = pipMode 
    ? "fixed top-24 right-16 w-64 z-50 bg-black border border-white/20 rounded-xl overflow-hidden shadow-2xl animate-scaleIn origin-top-right"
    : "absolute bottom-16 right-16 z-40 w-80 bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-slideUp";

  return (
    <div className={containerClass}>
      {pipMode && (
          <div className="absolute top-2 right-2 z-20 flex gap-2">
              <button onClick={onExpand} className="p-1 bg-black/50 rounded-full text-white hover:bg-white/20"><Maximize2 size={12} /></button>
              <button onClick={onClose} className="p-1 bg-black/50 rounded-full text-white hover:bg-red-500/50"><X size={12} /></button>
          </div>
      )}

      {/* Media Content */}
      <div className={`relative ${pipMode ? 'h-36' : 'p-4 flex items-center gap-4'}`}>
        
        {pipMode ? (
            // PiP Video Preview Mock
            <div className="absolute inset-0 bg-gray-900 group cursor-move">
                 <img 
                    src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop" 
                    className="w-full h-full object-cover opacity-60"
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform"
                    >
                         {isPlaying ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="ml-0.5 text-white" />}
                    </button>
                 </div>
            </div>
        ) : (
            // Standard Widget
            <>
                <div className="relative w-14 h-14 rounded-lg overflow-hidden group">
                <img 
                    src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop" 
                    className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : 'scale-100'}`}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Disc size={20} className={`text-white ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}/>
                </div>
                </div>

                <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase">Spotify</span>
                </div>
                <h4 className="text-white font-bold truncate text-sm leading-tight">Midnight City</h4>
                <p className="text-gray-400 text-xs truncate">M83 • Hurry Up, We're Dreaming</p>
                </div>

                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                >
                    {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
                </button>
            </>
        )}
      </div>

      {/* Progress Bar (Shared) */}
      <div className="h-1 bg-white/10 w-full cursor-pointer group">
        <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 relative transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
        >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};
