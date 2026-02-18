
import React, { useState, useEffect } from 'react';
import { playSound } from '../utils/sound';

interface BootSequenceProps {
  onComplete: () => void;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Cronología AJUSTADA para mayor impacto
    const timeline = [
      { t: 200, p: 1, s: 'hover' },    // 1. Punto de luz nace
      { t: 1200, p: 2, s: 'hover' },   // 2. Horizonte se expande violentamente
      { t: 2200, p: 3, s: 'select' },  // 3. Texto ZYNEX emerge
      { t: 4000, p: 4, s: 'hover' },   // 4. Carga de subsistemas
      { t: 5500, p: 5, s: 'success' }, // 5. FLASH DE LUZ (Cegador)
      { t: 6500, p: 6, s: null }       // 6. Fin (Desmontar componente)
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    timeline.forEach(({ t, p, s }) => {
      const timer = setTimeout(() => {
        setPhase(p);
        if (s) playSound(s as any);
        if (p === 6) onComplete();
      }, t);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden cursor-none select-none">
      
      {/* 1. Fondo Atmosférico con "Noise" vivo */}
      <div className={`absolute inset-0 transition-opacity duration-[2000ms] ${phase >= 2 ? 'opacity-40' : 'opacity-0'}`}>
         <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 via-transparent to-black" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay animate-noise" />
      </div>

      {/* 2. El Núcleo de Energía */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        
        {/* El Horizonte de Eventos (Línea de luz) */}
        <div className="relative mb-6 h-1 flex items-center justify-center w-full">
            {/* Punto central */}
            <div className={`
                absolute bg-white rounded-full shadow-[0_0_50px_white] transition-all duration-[1200ms] cubic-bezier(0.19, 1, 0.22, 1)
                ${phase === 0 ? 'w-0 h-0 opacity-0' : ''}
                ${phase === 1 ? 'w-1 h-1 opacity-100 scale-150' : ''}
                ${phase >= 2 ? 'w-full max-w-3xl h-[1px] opacity-60 shadow-[0_0_20px_#6366f1]' : ''} 
                ${phase >= 5 ? 'h-[2px] opacity-100 blur-sm scale-x-110 duration-200 bg-indigo-200' : ''}
            `} />
            
            {/* Destello secundario (flare) */}
            <div className={`
                absolute w-64 h-[1px] bg-indigo-400 blur-md transition-all duration-1000 delay-100
                ${phase >= 2 ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
                ${phase >= 5 ? 'opacity-0 duration-100' : ''}
            `} />
        </div>

        {/* 3. Tipografía ZYNEX con "Cinematic Tracking" - USO DE FONT-BRAND AQUI */}
        <div className="relative overflow-hidden py-2 mix-blend-screen">
            <h1 className={`
                text-7xl md:text-9xl font-black font-brand text-white leading-none
                transition-all duration-[3000ms] ease-out transform origin-center
                ${phase < 3 ? 'translate-y-10 opacity-0 blur-lg tracking-normal' : 'translate-y-0 opacity-100 blur-0 tracking-[0.2em]'}
                ${phase >= 5 ? 'scale-105 opacity-100 blur-md text-indigo-100 duration-200' : ''}
            `}>
                ZYNEX
            </h1>
            
            {/* Reflejo de luz que pasa sobre el texto */}
            <div className={`
                absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]
                transition-transform duration-[1500ms] ease-in-out
                ${phase < 3 ? '-translate-x-full' : ''}
                ${phase >= 3 ? 'translate-x-[200%]' : ''}
            `} />
        </div>

        {/* 4. Subtítulo Técnico Minimalista */}
        <div className={`
            mt-8 flex flex-col items-center gap-4 transition-all duration-700 delay-500
            ${phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            ${phase >= 5 ? 'opacity-0 duration-200' : ''}
        `}>
            <div className="flex items-center gap-3">
                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.6em] text-gray-500 font-sans font-medium">
                    VISION
                </span>
                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
            </div>
            
            {/* Barra de carga ultra-fina */}
            <div className="h-[1px] w-24 bg-gray-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent w-1/2 animate-shimmer" />
            </div>
        </div>

      </div>

      {/* 5. EL FLASHBANG FINAL (La transición perfecta) */}
      <div className={`
        absolute inset-0 bg-white z-[1000] pointer-events-none transition-opacity duration-[800ms] ease-in
        ${phase === 5 ? 'opacity-100' : 'opacity-0'}
      `} />

      <style>{`
        @keyframes noise {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-5%, -5%); }
            20% { transform: translate(-10%, 5%); }
            30% { transform: translate(5%, -10%); }
            40% { transform: translate(-5%, 15%); }
            50% { transform: translate(-10%, 5%); }
            60% { transform: translate(15%, 0); }
            70% { transform: translate(0, 10%); }
            80% { transform: translate(-15%, 0); }
            90% { transform: translate(10%, 5%); }
        }
        .animate-noise {
            animation: noise 0.5s steps(10) infinite;
        }
        @keyframes shimmer {
            0% { transform: translateX(-150%); }
            100% { transform: translateX(250%); }
        }
        .animate-shimmer {
            animation: shimmer 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};
