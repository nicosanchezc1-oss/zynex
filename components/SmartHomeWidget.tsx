
import React, { useState } from 'react';
import { Lightbulb, Thermometer, Video, Lock, Power } from 'lucide-react';
import { playSound } from '../utils/sound';

interface SmartHomeWidgetProps {
  isFocused: boolean;
  onToggleLights: (isOn: boolean) => void;
}

export const SmartHomeWidget: React.FC<SmartHomeWidgetProps> = ({ isFocused, onToggleLights }) => {
  const [lightsOn, setLightsOn] = useState(true);
  const [temp, setTemp] = useState(24);
  const [cameraActive, setCameraActive] = useState(false);

  // We only allow interaction if the widget itself is focused or active
  const toggleLights = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newState = !lightsOn;
    setLightsOn(newState);
    onToggleLights(newState);
    playSound(newState ? 'success' : 'back');
  };

  const changeTemp = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    setTemp(prev => Math.min(30, Math.max(16, prev + delta)));
    playSound('hover');
  };

  const toggleCamera = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCameraActive(!cameraActive);
      playSound('select');
  };

  return (
    <div 
        className={`
            relative w-full h-[180px] rounded-2xl overflow-hidden transition-all duration-300 group
            ${isFocused ? 'bg-[#1a1a1a] shadow-[0_0_40px_rgba(99,102,241,0.3)] scale-105 ring-2 ring-white/20 z-10' : 'bg-[#111]'}
        `}
    >
        {/* Background Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-purple-900/10" />

        <div className="relative z-10 p-5 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-500/20 p-1.5 rounded-lg text-indigo-400">
                        <Lock size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nexus Home</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
            </div>

            <div className="flex gap-3 mt-2">
                {/* Lights Module */}
                <button 
                    onClick={toggleLights}
                    className={`
                        flex-1 rounded-xl p-3 flex flex-col justify-between transition-all duration-300 border
                        ${lightsOn 
                            ? 'bg-amber-500/20 border-amber-500/30 text-amber-200' 
                            : 'bg-white/5 border-white/5 text-gray-500'}
                    `}
                >
                    <div className="flex justify-between items-start w-full">
                        <Lightbulb size={18} className={lightsOn ? 'fill-current' : ''} />
                        <Power size={12} />
                    </div>
                    <span className="text-xs font-bold text-left mt-2">{lightsOn ? 'ON' : 'OFF'}</span>
                </button>

                {/* Temp Module */}
                <div className="flex-1 rounded-xl bg-white/5 border border-white/5 p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-gray-400">
                        <Thermometer size={18} />
                        <span className="text-[10px]">{temp}°C</span>
                    </div>
                    <div className="flex justify-between items-center gap-1 mt-1">
                        <button onClick={(e) => changeTemp(e, -1)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold">-</button>
                        <div className="h-1 flex-1 bg-gradient-to-r from-blue-500 to-red-500 rounded-full opacity-50" />
                        <button onClick={(e) => changeTemp(e, 1)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold">+</button>
                    </div>
                </div>

                {/* Cam Module */}
                <button 
                    onClick={toggleCamera}
                    className={`
                        flex-1 rounded-xl p-0 overflow-hidden relative border transition-all duration-300
                        ${cameraActive ? 'border-red-500/50' : 'border-white/5 bg-white/5'}
                    `}
                >
                    {cameraActive ? (
                        <div className="absolute inset-0">
                            <img src="https://images.unsplash.com/photo-1558008258-3256797b43f3?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" />
                            <span className="absolute bottom-2 left-2 text-[8px] font-mono bg-black/50 px-1 rounded text-red-400">REC ●</span>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white">
                            <Video size={18} />
                            <span className="text-[8px] uppercase font-bold">Cam 1</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    </div>
  );
};
