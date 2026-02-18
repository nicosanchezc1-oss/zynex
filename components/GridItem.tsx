
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { LauncherItem, ItemType } from '../types';
import * as Icons from 'lucide-react';

interface GridItemProps {
  item: LauncherItem;
  isFocused: boolean;
  index: number;
  onHover: (index: number) => void;
  onClick: (item: LauncherItem) => void;
}

export const GridItem: React.FC<GridItemProps> = ({ item, isFocused, index, onHover, onClick }) => {
  const IconComponent = item.icon ? (Icons as any)[item.icon] : null;
  const isApp = item.type === ItemType.APP || item.type === ItemType.SETTING;
  const heightClass = isApp ? 'h-[180px]' : 'h-[340px]';

  // Video Preview Logic
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (isFocused && item.videoUrl) {
        // Delay playing video to avoid chaos when scrolling fast
        timeout = setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.play().then(() => setIsPlayingPreview(true)).catch(e => console.log("Autoplay blocked", e));
            }
        }, 800);
    } else {
        setIsPlayingPreview(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }

    return () => clearTimeout(timeout);
  }, [isFocused, item.videoUrl]);

  // Random data for "Mock" functionality (only calculated once)
  const meta = useMemo(() => ({
    progress: Math.random() > 0.5 ? Math.floor(Math.random() * 90) + 10 : 0,
    isNew: Math.random() > 0.7,
    notifications: isApp && Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0
  }), []);

  // 3D Tilt Logic
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    onHover(index);

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Smoother, subtler tilt
    const rotateX = ((y - centerY) / centerY) * -8; 
    const rotateY = ((x - centerX) / centerX) * 8;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div 
      className={`relative group ${heightClass} perspective-1000 z-auto`}
      style={{ perspective: '1200px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(item)}
    >
      <div
        ref={cardRef}
        className={`
          relative w-full h-full rounded-2xl transition-all duration-300 ease-out transform-gpu
          ${isFocused 
            ? 'z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-105 ring-2 ring-[var(--accent)]' 
            : 'z-auto shadow-lg scale-100 ring-0 ring-transparent'}
        `}
        style={{
          transform: isFocused 
             ? `scale(1.05) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
             : `scale(1) rotateX(0) rotateY(0)`,
          transformStyle: 'preserve-3d',
          filter: isFocused ? 'brightness(1.1)' : 'brightness(0.9)'
        }}
      >
        {/* Animated Glow Border */}
        <div className={`
            absolute -inset-[3px] rounded-[20px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 transition-opacity duration-300 blur-md
            ${isFocused ? 'opacity-60 animate-gradient-xy' : 'opacity-0'}
        `} />

        {/* Main Content */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden bg-[var(--bg-main)] backface-hidden ring-1 ring-[var(--border)]">
            
            {/* Dynamic Shine */}
            <div 
                className={`absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent z-40 pointer-events-none transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    transform: `translateX(${rotation.y * -4}px) translateY(${rotation.x * -4}px)`,
                }}
            />

            {/* Video Layer (CineMotion) */}
            {item.videoUrl && (
                <video
                    ref={videoRef}
                    src={item.videoUrl}
                    loop
                    muted
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 z-10 ${isPlayingPreview ? 'opacity-100' : 'opacity-0'}`}
                />
            )}

            {/* Image Layer */}
            {item.imageUrl ? (
            <img 
                src={item.imageUrl} 
                alt={item.title} 
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${isPlayingPreview ? 'opacity-0' : 'opacity-100'}`}
            />
            ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color || 'from-gray-800 to-gray-900'}`} />
            )}

            {/* Badge: New Episode / Notification */}
            {item.type === ItemType.MOVIE && meta.isNew && (
                <div className="absolute top-3 right-3 z-30 bg-indigo-600/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider font-tech border border-white/10">
                    Nuevo
                </div>
            )}
            {item.type === ItemType.APP && meta.notifications > 0 && (
                <div className="absolute top-3 right-3 z-30 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-lg border-2 border-black animate-pulse">
                    {meta.notifications}
                </div>
            )}

            {/* Content Overlay */}
            <div 
                className={`
                    absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-5 flex flex-col justify-end z-20
                    transition-all duration-300
                `}
                style={{ transform: 'translateZ(20px)' }}
            >
            {IconComponent && (
                <div className={`
                    mb-auto mt-2 p-3 bg-[var(--bg-surface)] backdrop-blur-md border border-[var(--border)] rounded-xl w-fit shadow-lg
                    transition-all duration-300 ${isFocused ? 'bg-white text-indigo-600 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-[var(--text-main)]'}
                `}>
                <IconComponent size={28} />
                </div>
            )}
            
            <h3 className={`font-tech font-bold text-white drop-shadow-lg truncate tracking-wide transition-all duration-300 ${isFocused ? 'text-2xl mb-1 translate-y-0' : 'text-lg text-gray-200 translate-y-1'}`}>
                {item.title}
            </h3>
            
            {/* Metadata Footer */}
            <div className={`mt-2 transition-all duration-300 ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-2'}`}>
                 {item.type === ItemType.MOVIE ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-gray-300 font-medium uppercase tracking-wider">
                            <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10">4K</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10">HDR</span>
                            <span className="text-emerald-400 font-bold shadow-emerald-500/20 drop-shadow-sm">98% Match</span>
                        </div>
                        {/* Progress Bar */}
                        {meta.progress > 0 && (
                            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_#6366f1]" style={{ width: `${meta.progress}%` }} />
                            </div>
                        )}
                    </div>
                 ) : (
                    isFocused && <span className="text-indigo-300 text-xs font-bold tracking-widest uppercase animate-pulse">Pulsa para abrir</span>
                 )}
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};
