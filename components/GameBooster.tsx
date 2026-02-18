
import React, { useEffect, useState } from 'react';
import { Rocket, Cpu, Wifi, Zap, Check } from 'lucide-react';

interface GameBoosterProps {
  isOpen: boolean;
  appName: string;
  onComplete: () => void;
}

export const GameBooster: React.FC<GameBoosterProps> = ({ isOpen, appName, onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
        setStep(0);
        return;
    }

    const timings = [800, 1600, 2400, 3000]; // Durations for each step

    const t1 = setTimeout(() => setStep(1), timings[0]); // Clear RAM
    const t2 = setTimeout(() => setStep(2), timings[1]); // Optimize CPU
    const t3 = setTimeout(() => setStep(3), timings[2]); // Network Prio
    const t4 = setTimeout(() => {
        onComplete();
    }, timings[3]);

    return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = [
      { icon: Rocket, label: 'Iniciando HyperLaunch...', color: 'text-white' },
      { icon: Zap, label: 'Liberando memoria RAM...', color: 'text-amber-400' },
      { icon: Cpu, label: 'CPU overclocking: Activado', color: 'text-red-400' },
      { icon: Wifi, label: 'Prioridad de Red: Alta', color: 'text-emerald-400' },
  ];

  const currentStep = steps[Math.min(step, 3)];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-tech">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 w-full max-w-lg text-center">
            <h2 className="text-4xl font-bold text-white mb-2 uppercase tracking-widest">{appName}</h2>
            <div className="h-0.5 w-24 bg-indigo-500 mx-auto mb-12" />

            {/* Central Graphic */}
            <div className="relative w-48 h-48 mx-auto mb-12 flex items-center justify-center">
                {/* Spinning Rings */}
                <div className="absolute inset-0 border-4 border-indigo-900 rounded-full" />
                <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-4 border-b-4 border-purple-500 rounded-full animate-spin-slow" />
                
                {/* Icon Transition */}
                <div className="relative z-10 p-6 bg-[#111] rounded-full border border-white/10 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                    <currentStep.icon size={48} className={`${currentStep.color} transition-all duration-300 animate-pulse`} />
                </div>
            </div>

            {/* Steps List */}
            <div className="space-y-4 text-left pl-12">
                {steps.map((s, idx) => (
                    <div key={idx} className={`flex items-center gap-4 transition-all duration-300 ${idx > step ? 'opacity-20 translate-x-4' : 'opacity-100 translate-x-0'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${idx < step ? 'bg-emerald-500' : idx === step ? 'bg-indigo-500 animate-pulse' : 'bg-gray-800'}`}>
                             {idx < step ? <Check size={14} className="text-black" /> : <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={`text-lg uppercase tracking-wider ${idx === step ? 'text-white font-bold' : 'text-gray-500'}`}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-10 w-full px-20">
            <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-300 ease-linear" 
                    style={{ width: `${(step / 3) * 100}%` }} 
                />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono uppercase">
                <span>HyperLaunch Engine v2.4</span>
                <span>Optimizing System Resources</span>
            </div>
        </div>
    </div>
  );
};
