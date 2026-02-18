
import React from 'react';
import { MOODS } from '../constants';
import { MoodType } from '../types';
import * as Icons from 'lucide-react';

interface MoodSelectorProps {
  currentMood: MoodType;
  onSelect: (mood: MoodType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ currentMood, onSelect, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center animate-fadeIn" onClick={onClose}>
        <div 
            className="relative flex gap-8 items-center animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
        >
            <h2 className="absolute -top-20 w-full text-center text-white font-tech text-2xl tracking-[0.3em] uppercase opacity-80">
                Selecciona tu Ambiente
            </h2>

            {MOODS.map((mood) => {
                const Icon = (Icons as any)[mood.icon];
                const isActive = currentMood === mood.id;
                
                return (
                    <button
                        key={mood.id}
                        onClick={() => onSelect(mood.id)}
                        className={`
                            relative w-40 h-64 rounded-3xl overflow-hidden group transition-all duration-500 ease-out border
                            ${isActive 
                                ? `scale-110 border-[${mood.glowColor}] shadow-[0_0_50px_${mood.glowColor}]` 
                                : 'scale-100 border-white/10 hover:border-white/30 hover:scale-105 opacity-60 hover:opacity-100'}
                        `}
                        style={{
                            borderColor: isActive ? mood.glowColor : undefined
                        }}
                    >
                        {/* Background Gradient */}
                        <div 
                            className={`absolute inset-0 bg-gradient-to-b opacity-40 transition-colors duration-500`}
                            style={{
                                background: `linear-gradient(to top, ${mood.glowColor}, transparent)`
                            }}
                        />

                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 z-10">
                            <div className={`
                                p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-transform duration-500
                                ${isActive ? 'scale-125' : 'group-hover:scale-110'}
                            `}>
                                <Icon size={32} className="text-white" />
                            </div>
                            <span className="text-white font-bold tracking-widest uppercase text-sm font-tech">
                                {mood.label}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    </div>
  );
};
