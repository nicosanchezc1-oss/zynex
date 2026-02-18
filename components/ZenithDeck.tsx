
import React, { useState, useEffect } from 'react';
import { X, Cpu, Wifi, Activity, Bell, Home, Music, Settings, Power, Battery, Thermometer, ChevronRight } from 'lucide-react';
import { playSound } from '../utils/sound';

interface ZenithDeckProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchSettings: () => void;
}

export const ZenithDeck: React.FC<ZenithDeckProps> = ({ isOpen, onClose, onLaunchSettings }) => {
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'HOME' | 'NOTIFICATIONS'>('SYSTEM');
  const [cpuHistory, setCpuHistory] = useState<number[]>(new Array(20).fill(20));

  // Simulation for graphs
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
        setCpuHistory(prev => {
            const newVal = Math.floor(Math.random() * 40) + 10;
            return [...prev.slice(1), newVal];
        });
    }, 500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] animate-fadeIn" onClick={onClose} />
        
        <div className="fixed top-0 right-0 h-full w-[450px] bg-[#080808]/95 backdrop-blur-2xl border-l border-white/10 z-[100] shadow-[-50px_0_100px_rgba(0,0,0,0.8)] animate-slideLeft flex flex-col font-tech">
            
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_#4f46e5]">
                        <Activity className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-widest font-brand">Zynex Deck</h2>
                        <span className="text-[10px] text-indigo-400 font-mono">SYSTEM MONITORING ACTIVE</span>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Quick Actions (Top) */}
            <div className="grid grid-cols-4 gap-2 p-4 border-b border-white/10">
                <QuickAction icon={Wifi} label="Wi-Fi" active />
                <QuickAction icon={Power} label="Reposo" />
                <QuickAction icon={Settings} label="Ajustes" onClick={onLaunchSettings} />
                <QuickAction icon={Battery} label="Eco" />
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-2 bg-black/40">
                <DeckTab label="Sistema" icon={Cpu} isActive={activeTab === 'SYSTEM'} onClick={() => setActiveTab('SYSTEM')} />
                <DeckTab label="Hogar" icon={Home} isActive={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')} />
                <DeckTab label="Alertas" icon={Bell} isActive={activeTab === 'NOTIFICATIONS'} onClick={() => setActiveTab('NOTIFICATIONS')} />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                
                {activeTab === 'SYSTEM' && (
                    <div className="space-y-6">
                        {/* CPU Graph */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Carga de CPU</span>
                                <span className="text-emerald-400 font-mono text-sm">{cpuHistory[cpuHistory.length - 1]}%</span>
                            </div>
                            <div className="h-24 flex items-end gap-1">
                                {cpuHistory.map((h, i) => (
                                    <div key={i} className="flex-1 bg-indigo-500/50 rounded-t-sm transition-all duration-300" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>

                        {/* Storage */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Almacenamiento</span>
                                <span className="text-white text-xs">450GB / 1TB</span>
                            </div>
                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-[45%] bg-purple-500 shadow-[0_0_10px_#a855f7]" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'HOME' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3 text-amber-400">
                                <Thermometer size={20} />
                                <span className="font-bold">Termostato</span>
                            </div>
                            <span className="text-2xl font-bold text-white">24°C</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-32 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                <Power className="text-emerald-400 mb-2" size={24} />
                                <span className="text-xs font-bold text-gray-300">Luces Salón</span>
                                <span className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Encendido</span>
                            </div>
                            <div className="h-32 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                <Power className="text-gray-600 mb-2" size={24} />
                                <span className="text-xs font-bold text-gray-300">Luces Cocina</span>
                                <span className="text-[10px] text-gray-600 font-bold uppercase mt-1">Apagado</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'NOTIFICATIONS' && (
                    <div className="space-y-3">
                         {[1, 2, 3].map((n) => (
                             <div key={n} className="p-4 bg-white/5 border-l-2 border-indigo-500 rounded-r-xl">
                                 <h4 className="text-sm font-bold text-white mb-1">Actualización completada</h4>
                                 <p className="text-xs text-gray-400">El parche de seguridad de Octubre se ha instalado correctamente.</p>
                                 <span className="text-[10px] text-gray-600 mt-2 block">Hace 10 min</span>
                             </div>
                         ))}
                    </div>
                )}

            </div>

            {/* Footer Media */}
            <div className="p-4 bg-black/40 border-t border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-gray-800 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">Nada reproduciendo</div>
                        <div className="text-xs text-gray-500">Selecciona contenido</div>
                    </div>
                    <ChevronRight className="text-gray-500" />
                </div>
            </div>
        </div>
    </>
  );
};

const QuickAction = ({ icon: Icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${active ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
        <Icon size={18} className="mb-1" />
        <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
);

const DeckTab = ({ label, icon: Icon, isActive, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}
    >
        <Icon size={14} /> {label}
    </button>
);
