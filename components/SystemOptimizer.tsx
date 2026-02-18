
import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Zap, CheckCircle2, RotateCw } from 'lucide-react';

interface SystemOptimizerProps {
  isFocused: boolean;
  onClick: () => void;
}

export const SystemOptimizer: React.FC<SystemOptimizerProps> = ({ isFocused, onClick }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  // Fake Stats
  const [ramUsage, setRamUsage] = useState(78);
  const [storageUsage, setStorageUsage] = useState(45);

  const handleOptimize = () => {
    if (isOptimizing || isDone) return;
    setIsOptimizing(true);
    onClick(); // Notify parent of click if needed

    // Simulation
    setTimeout(() => {
        setRamUsage(35); // Optimized
        setStorageUsage(42); // Slightly optimized
        setIsOptimizing(false);
        setIsDone(true);
        setTimeout(() => setIsDone(false), 5000); // Reset done state after 5s
    }, 3000);
  };

  // Allow triggering via Enter key when focused from parent Grid
  useEffect(() => {
    if (isFocused) {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') handleOptimize();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFocused, isOptimizing, isDone]);

  // SVG Chart Helper
  const CircleChart = ({ percent, color }: { percent: number, color: string }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="transform -rotate-90 w-20 h-20">
                <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10" />
                <circle 
                    cx="40" cy="40" r={radius} 
                    stroke="currentColor" strokeWidth="6" fill="transparent" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    className={`${color} transition-all duration-1000 ease-out`}
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute text-sm font-bold text-white">{percent}%</span>
        </div>
    );
  };

  return (
    <div 
        className={`
            relative w-full h-[180px] rounded-2xl p-6 overflow-hidden transition-all duration-300 group
            ${isFocused ? 'bg-[#1a1a1a] shadow-[0_0_40px_rgba(99,102,241,0.3)] scale-105 ring-2 ring-white/20' : 'bg-[#111]'}
            ${isOptimizing ? 'ring-2 ring-emerald-500' : ''}
        `}
        onClick={handleOptimize}
    >
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />

        <div className="relative z-10 flex h-full">
            {/* Left: Info */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={18} className={isOptimizing ? "text-emerald-400 animate-pulse" : "text-indigo-400"} />
                        <h3 className="font-tech font-bold text-lg text-white uppercase tracking-wider">Device Care</h3>
                    </div>
                    <p className="text-xs text-gray-400">
                        {isOptimizing ? 'Analizando sistema...' : isDone ? 'Sistema Optimizado' : 'Mantenimiento sugerido'}
                    </p>
                </div>

                <button 
                    className={`
                        mt-auto px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 w-fit transition-all
                        ${isOptimizing ? 'bg-emerald-500/20 text-emerald-400' : isDone ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white group-hover:bg-white/20'}
                    `}
                >
                    {isOptimizing ? (
                        <><RotateCw size={14} className="animate-spin" /> Escaneando...</>
                    ) : isDone ? (
                        <><CheckCircle2 size={14} /> Listo</>
                    ) : (
                        'Liberar Espacio'
                    )}
                </button>
            </div>

            {/* Right: Charts */}
            <div className="flex gap-2 items-center">
                 <div className="flex flex-col items-center gap-2">
                    <CircleChart percent={ramUsage} color="text-indigo-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Cpu size={10}/> RAM</span>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <CircleChart percent={storageUsage} color="text-purple-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><HardDrive size={10}/> SSD</span>
                 </div>
            </div>
        </div>

        {/* Scan Line Effect */}
        {isOptimizing && (
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan" />
        )}
        <style>{`
            @keyframes scan {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
            }
            .animate-scan { animation: scan 1.5s linear infinite; }
        `}</style>
    </div>
  );
};
