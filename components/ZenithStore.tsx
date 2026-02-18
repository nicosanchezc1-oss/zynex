
import React, { useState, useEffect } from 'react';
import { LauncherItem } from '../types';
import { STORE_APPS } from '../constants';
import { Download, Check, Loader2, Play } from 'lucide-react';
import { playSound } from '../utils/sound';

interface ZenithStoreProps {
  isFocused: boolean;
  focusedIndex: number;
  onInstall: (app: LauncherItem) => void;
  onHover: (index: number) => void;
  installedApps: LauncherItem[]; // New prop to sync state
  onLaunch: (app: LauncherItem) => void; // Capability to launch directly
}

export const ZenithStore: React.FC<ZenithStoreProps> = ({ isFocused, focusedIndex, onInstall, onHover, installedApps, onLaunch }) => {
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleAction = (app: LauncherItem) => {
    // Check if already installed in the main list
    const isAlreadyInstalled = installedApps.some(a => a.id === app.id);

    if (isAlreadyInstalled) {
        playSound('select');
        onLaunch(app);
        return;
    }

    if (installingId) {
        playSound('error');
        return;
    }

    playSound('select');
    setInstallingId(app.id);
    setProgress(0);
  };

  useEffect(() => {
    if (!installingId) return;

    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                finishInstall(installingId);
                return 100;
            }
            // Random increments for realism
            return prev + Math.floor(Math.random() * 15) + 5;
        });
    }, 200);

    return () => clearInterval(interval);
  }, [installingId]);

  const finishInstall = (id: string) => {
    playSound('success');
    setInstallingId(null);
    
    // Find app and trigger install in parent
    const app = STORE_APPS.find(a => a.id === id);
    if (app) onInstall(app);
  };

  return (
    <div className="grid grid-cols-4 gap-8 pb-40 px-16">
        {STORE_APPS.map((app, index) => {
            const isItemFocused = isFocused && focusedIndex === index;
            const isInstalling = installingId === app.id;
            // Check global state for installation status
            const isInstalled = installedApps.some(a => a.id === app.id);

            return (
                <div 
                    key={app.id}
                    onMouseMove={() => onHover(index)}
                    onClick={() => handleAction(app)}
                    className={`
                        relative h-[300px] rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer
                        ${isItemFocused 
                            ? 'scale-105 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-2 ring-white/20 z-10' 
                            : 'scale-100 opacity-80 hover:opacity-100'}
                    `}
                >
                    <img src={app.imageUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    {/* Progress Overlay */}
                    {isInstalling && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm animate-fadeIn">
                            <div className="w-16 h-16 relative flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="4" fill="transparent" className="opacity-10" />
                                    <circle 
                                        cx="32" cy="32" r="28" 
                                        stroke="#6366f1" strokeWidth="4" fill="transparent" 
                                        strokeDasharray={175} 
                                        strokeDashoffset={175 - (progress / 100) * 175}
                                        strokeLinecap="round"
                                        className="transition-all duration-200"
                                    />
                                </svg>
                                <span className="absolute text-xs font-bold">{progress}%</span>
                            </div>
                            <span className="text-xs uppercase tracking-widest mt-2 font-bold text-gray-400 animate-pulse">Descargando...</span>
                        </div>
                    )}

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-2xl font-bold font-tech text-white mb-1 drop-shadow-md">{app.title}</h3>
                        <p className="text-xs text-gray-300 mb-4 line-clamp-1">{app.description}</p>
                        
                        <button 
                            className={`
                                w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all duration-300
                                ${isInstalled 
                                    ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400' 
                                    : isItemFocused ? 'bg-white text-black' : 'bg-white/20 text-white backdrop-blur-md'}
                            `}
                        >
                            {isInstalled ? (
                                <><Play size={14} fill="currentColor" /> Abrir</>
                            ) : (
                                <><Download size={14} /> Instalar</>
                            )}
                        </button>
                    </div>
                </div>
            );
        })}
    </div>
  );
};
