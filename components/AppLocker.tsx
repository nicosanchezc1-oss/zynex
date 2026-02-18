
import React, { useState, useEffect } from 'react';
import { Fingerprint, Lock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { playSound } from '../utils/sound';

interface AppLockerProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  appName: string;
}

export const AppLocker: React.FC<AppLockerProps> = ({ isOpen, onSuccess, onCancel, appName }) => {
  const [state, setState] = useState<'SCAN' | 'SCANNING' | 'SUCCESS' | 'FAIL'>('SCAN');

  useEffect(() => {
    if (isOpen) setState('SCAN');
  }, [isOpen]);

  const handleScan = () => {
    playSound('select');
    setState('SCANNING');
    
    // Simulate scan
    setTimeout(() => {
        playSound('success');
        setState('SUCCESS');
        setTimeout(onSuccess, 800);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-fadeIn">
        <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
                <div className="bg-red-500/10 p-4 rounded-full border border-red-500/30">
                    <Lock size={32} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white font-tech tracking-wider uppercase mt-4">Acceso Restringido</h3>
                <p className="text-gray-400">La aplicación <span className="text-white font-bold">{appName}</span> está protegida.</p>
            </div>

            <button 
                onClick={handleScan}
                disabled={state !== 'SCAN'}
                className={`
                    w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden
                    ${state === 'SCAN' ? 'border-white/20 hover:border-white/50 bg-white/5' : ''}
                    ${state === 'SCANNING' ? 'border-cyan-500 animate-pulse bg-cyan-900/20' : ''}
                    ${state === 'SUCCESS' ? 'border-emerald-500 bg-emerald-900/20' : ''}
                `}
            >
                {state === 'SUCCESS' ? (
                    <ShieldCheck size={48} className="text-emerald-500 animate-scaleIn" />
                ) : (
                    <Fingerprint 
                        size={48} 
                        className={`
                            ${state === 'SCAN' ? 'text-gray-400' : 'text-cyan-400'}
                            ${state === 'SCANNING' ? 'animate-pulse' : ''}
                        `} 
                    />
                )}
                
                {/* Scanner bar */}
                {state === 'SCANNING' && (
                    <div className="absolute inset-0 w-full h-1 bg-cyan-400 opacity-50 animate-scan-fast" />
                )}
            </button>

            <div className="text-center h-8">
                {state === 'SCAN' && <span className="text-xs uppercase tracking-[0.2em] text-gray-500 animate-pulse">Toque para escanear</span>}
                {state === 'SCANNING' && <span className="text-xs uppercase tracking-[0.2em] text-cyan-500">Verificando Biometría...</span>}
                {state === 'SUCCESS' && <span className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-bold">Identidad Confirmada</span>}
            </div>

            <button onClick={onCancel} className="mt-8 text-gray-500 hover:text-white uppercase text-xs tracking-widest font-bold">
                Cancelar
            </button>
        </div>
        <style>{`
            @keyframes scan-fast {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(400%); }
            }
            .animate-scan-fast { animation: scan-fast 1s linear infinite; }
        `}</style>
    </div>
  );
};
