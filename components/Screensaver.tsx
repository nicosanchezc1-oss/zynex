import React, { useState, useEffect } from 'react';
import { Cloud, Wind } from 'lucide-react';

interface ScreensaverProps {
  isActive: boolean;
  onWake: () => void;
}

export const Screensaver: React.FC<ScreensaverProps> = ({ isActive, onWake }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div 
        className="fixed inset-0 z-[100] bg-black cursor-none overflow-hidden animate-fadeIn"
        onClick={onWake}
        onMouseMove={onWake}
        onKeyDown={onWake}
    >
        {/* Background Animation */}
        <div className="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2600&auto=format&fit=crop" 
                className="w-full h-full object-cover opacity-60 animate-[zoomIn_60s_linear_infinite]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-20">
            {/* Top Info */}
            <div className="flex justify-between items-start opacity-70">
                <div className="flex items-center gap-4">
                    <Cloud size={48} className="text-white" />
                    <div>
                        <div className="text-4xl font-light text-white">24°</div>
                        <div className="text-sm font-bold text-gray-300 uppercase tracking-widest">Despejado</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-1">Buenos Aires</div>
                    <div className="flex items-center justify-end gap-2 text-indigo-400">
                        <Wind size={16} />
                        <span className="font-mono text-xs">12 km/h</span>
                    </div>
                </div>
            </div>

            {/* Center Clock */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-[12rem] font-bold text-white leading-none font-tech drop-shadow-2xl tracking-tighter mix-blend-overlay opacity-90">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-2xl font-light text-gray-300 tracking-[0.5em] uppercase mt-4">
                    {time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
            </div>

            {/* Bottom Quote */}
            <div className="text-center opacity-60">
                <p className="text-xl italic text-white font-light">"El futuro pertenece a quienes creen en la belleza de sus sueños."</p>
                <div className="flex justify-center gap-2 mt-4">
                    <div className="w-2 h-2 rounded-full bg-white/50" />
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <div className="w-2 h-2 rounded-full bg-white/50" />
                </div>
            </div>
        </div>
    </div>
  );
};