
import React, { useState } from 'react';
import { X, UserPlus, Camera, Palette, Check } from 'lucide-react';
import { playSound } from '../utils/sound';

interface ProfileCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileCreator: React.FC<ProfileCreatorProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('indigo');

  if (!isOpen) return null;

  const colors = ['indigo', 'red', 'emerald', 'amber', 'pink', 'cyan'];

  const handleSave = () => {
    if(!name) return;
    playSound('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fadeIn">
        <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 relative shadow-2xl animate-scaleIn">
            
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white">
                <X size={24} />
            </button>

            <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.4)] relative group cursor-pointer">
                    <UserPlus size={32} className="text-white" />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white font-tech uppercase tracking-widest">Nuevo Perfil</h2>
                <p className="text-gray-500 text-sm">Personaliza tu espacio en Zynex</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nombre de Usuario</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Escribe tu nombre..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 outline-none focus:border-indigo-500 transition-colors"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Palette size={12} /> Color del Tema
                    </label>
                    <div className="flex justify-between gap-2">
                        {colors.map(c => (
                            <button
                                key={c}
                                onClick={() => { setColor(c); playSound('select'); }}
                                className={`w-10 h-10 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                style={{ backgroundColor: `var(--color-${c}-500, ${c === 'indigo' ? '#6366f1' : c === 'red' ? '#ef4444' : c === 'emerald' ? '#10b981' : c === 'amber' ? '#f59e0b' : c === 'pink' ? '#ec4899' : '#06b6d4'})` }} 
                            >
                                {color === c && <Check size={16} className="text-white mx-auto" />}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleSave}
                    className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-4"
                >
                    Crear Perfil
                </button>
            </div>
        </div>
    </div>
  );
};
