import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const VolumeHUD: React.FC = () => {
  const [volume, setVolume] = useState(50);
  const [isVisible, setIsVisible] = useState(false);
  const [timer, setTimer] = useState<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=' || e.key === 'ArrowUp') { // Simulating Volume Up
         // Check if we are in a context where ArrowUp shouldn't trigger volume (like navigation)
         // For this demo, strictly using + and - for volume is safer to avoid conflict, 
         // but let's assume + and - are dedicated keys.
      }
      
      let change = 0;
      if (e.key === '+' || e.key === '=') change = 5;
      if (e.key === '-' || e.key === '_') change = -5;

      if (change !== 0) {
        setVolume(prev => Math.min(100, Math.max(0, prev + change)));
        setIsVisible(true);
        if (timer) clearTimeout(timer);
        setTimer(setTimeout(() => setIsVisible(false), 2000));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timer]);

  if (!isVisible) return null;

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 bg-[#111]/90 backdrop-blur-xl border-l border-y border-white/10 p-6 rounded-l-2xl shadow-2xl z-[70] animate-slideLeft flex flex-col items-center gap-4 transition-all">
      <div className="p-3 bg-indigo-600 rounded-full text-white shadow-[0_0_15px_#6366f1]">
        {volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </div>
      
      <div className="h-48 w-2 bg-gray-800 rounded-full relative overflow-hidden">
         <div 
            className="absolute bottom-0 left-0 w-full bg-white transition-all duration-150"
            style={{ height: `${volume}%` }}
         />
      </div>

      <span className="text-white font-bold font-tech text-xl">{volume}</span>
    </div>
  );
};