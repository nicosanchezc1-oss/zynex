
import React, { useEffect, useState } from 'react';
import { Cpu, Activity, HardDrive, ShieldCheck } from 'lucide-react';

interface SystemStatusBarProps {
    onOpenNeuralCore?: () => void;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({ onOpenNeuralCore }) => {
  const [stats, setStats] = useState({ cpu: 12, ram: 45, net: '1.2 Gbps' });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(Math.random() * (35 - 5) + 5),
        ram: Math.floor(Math.random() * (48 - 40) + 40),
        net: `${(Math.random() * (1.5 - 0.9) + 0.9).toFixed(1)} Gbps`
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#050505]/90 backdrop-blur-xl border-t border-white/5 flex items-center px-16 justify-between z-50 select-none">
      
      {/* Ticker */}
      <div className="flex items-center gap-6 overflow-hidden">
        <div className="flex items-center gap-2 text-indigo-400">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold tracking-widest uppercase font-tech">Sistema Seguro</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="text-[10px] text-[var(--text-muted)] font-mono tracking-wider uppercase animate-pulse">
             ● Sincronización en la nube completada hace 2 min
        </div>
      </div>

      {/* Stats - Clickable to open Neural Core */}
      <button 
        onClick={onOpenNeuralCore}
        className="flex items-center gap-8 hover:bg-white/5 px-4 py-1 rounded-lg transition-colors group cursor-pointer"
        title="Abrir Neural Core"
      >
        <StatItem icon={Cpu} label="CPU" value={`${stats.cpu}%`} />
        <StatItem icon={HardDrive} label="RAM" value={`${stats.ram}%`} />
        <StatItem icon={Activity} label="NET" value={stats.net} />
        <div className="w-px h-4 bg-white/10" />
        <span className="text-[10px] font-bold text-[var(--text-muted)] font-tech group-hover:text-[var(--accent)] transition-colors">V 2.0.4 ALPHA</span>
      </button>
    </div>
  );
};

const StatItem: React.FC<{ icon: any, label: string, value: string }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <Icon size={12} className="text-[var(--text-muted)]" />
        <div className="flex items-baseline gap-1">
            <span className="text-[9px] font-bold uppercase">{label}</span>
            <span className="text-[10px] font-mono text-[var(--accent)]">{value}</span>
        </div>
    </div>
);
