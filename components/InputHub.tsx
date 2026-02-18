
import React, { useState } from 'react';
import { HdmiPort, Gamepad2, Laptop, Tv, X, Loader2 } from 'lucide-react';
import { playSound } from '../utils/sound';

interface InputHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InputHub: React.FC<InputHubProps> = ({ isOpen, onClose }) => {
  const [activeInput, setActiveInput] = useState('HDMI 1');
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  const inputs = [
      { id: 'HDMI 1', label: 'PlayStation 5', icon: Gamepad2, color: 'text-blue-400', preview: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=600&auto=format&fit=crop' },
      { id: 'HDMI 2', label: 'Xbox Series X', icon: Gamepad2, color: 'text-green-400', preview: 'https://images.unsplash.com/photo-1621259182902-885f6e3a51f6?q=80&w=600&auto=format&fit=crop' },
      { id: 'HDMI 3', label: 'MacBook Pro', icon: Laptop, color: 'text-gray-400', preview: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=600&auto=format&fit=crop' },
      { id: 'AV', label: 'Cable TV', icon: Tv, color: 'text-yellow-400', preview: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=600&auto=format&fit=crop' },
  ];

  const handleSwitch = (id: string) => {
      if (id === activeInput) return;
      playSound('select');
      setSwitchingTo(id);
      
      // Simulate switching delay
      setTimeout(() => {
          setActiveInput(id);
          setSwitchingTo(null);
          playSound('success');
      }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end justify-center pb-20 animate-fadeIn">
        <div className="absolute top-10 right-10">
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="w-full max-w-6xl px-12">
            <h2 className="text-2xl font-bold text-white font-tech uppercase tracking-widest mb-8 border-l-4 border-[var(--accent)] pl-4">
                Selector de Entradas
            </h2>

            <div className="grid grid-cols-4 gap-6">
                {inputs.map((input) => {
                    const isActive = activeInput === input.id;
                    const isSwitching = switchingTo === input.id;

                    return (
                        <button
                            key={input.id}
                            onClick={() => handleSwitch(input.id)}
                            className={`
                                relative group h-64 rounded-2xl overflow-hidden transition-all duration-300 border
                                ${isActive 
                                    ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/50 scale-105' 
                                    : 'border-white/10 hover:border-white/30 hover:scale-105'}
                            `}
                        >
                            {/* Preview Image */}
                            <img src={input.preview} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                            {/* Signal Noise Effect if Switching */}
                            {isSwitching && (
                                <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center gap-4">
                                    <Loader2 size={32} className="text-white animate-spin" />
                                    <span className="text-xs uppercase font-bold text-white tracking-widest animate-pulse">Estableciendo Señal...</span>
                                </div>
                            )}

                            {/* Active Indicator */}
                            {isActive && !isSwitching && (
                                <div className="absolute top-4 right-4 bg-emerald-500 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg">
                                    Activo
                                </div>
                            )}

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 w-full p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg bg-white/10 backdrop-blur-md ${input.color}`}>
                                        <input.icon size={20} />
                                    </div>
                                    <span className="text-2xl font-bold text-white font-tech">{input.id}</span>
                                </div>
                                <p className="text-gray-400 text-sm font-medium">{input.label}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
  );
};
