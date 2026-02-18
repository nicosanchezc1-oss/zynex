
import React, { useState, useEffect } from 'react';
import { CloudSun, MapPin } from 'lucide-react';

interface ClockProps {
    onClick?: () => void;
}

export const Clock: React.FC<ClockProps> = ({ onClick }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
        onClick={onClick}
        className="flex items-center gap-8 select-none cursor-pointer group hover:opacity-100 transition-opacity"
    >
        {/* Weather Widget */}
        <div className="hidden md:flex flex-col items-end text-right border-r border-[var(--border)] pr-8 mr-2 opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase font-tech">Buenos Aires</span>
                <MapPin size={10} className="text-[var(--accent)]" />
            </div>
            <div className="flex items-center gap-3 mt-1">
                <CloudSun size={20} className="text-[var(--text-main)]" />
                <span className="text-2xl font-tech font-bold text-[var(--text-main)]">24°</span>
            </div>
        </div>

        {/* Time Widget */}
        <div className="text-right">
            <div className="text-6xl font-bold text-[var(--text-main)] tracking-tight leading-none font-tech drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:text-[var(--accent)] transition-colors">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-[var(--accent)] font-bold uppercase tracking-[0.3em] mt-1 group-hover:text-[var(--text-main)]">
                {time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}
            </div>
        </div>
    </div>
  );
};
