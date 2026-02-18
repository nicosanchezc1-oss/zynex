
import React, { useState } from 'react';
import { X, Wifi, Monitor, User, Volume2, Shield, Zap, ArrowLeft, Palette, Bluetooth, Smartphone, Headphones, Gamepad2, Sun, Scale } from 'lucide-react';
import { LauncherItem, ThemeType } from '../types';
import { THEMES } from '../constants';
import { WifiManager } from './WifiManager';
import { playSound } from '../utils/sound';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: LauncherItem | null;
  onWifiConnect: (ssid: string) => void;
  currentSsid: string | null;
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ 
    isOpen, onClose, activeItem, onWifiConnect, currentSsid, currentTheme, onThemeChange 
}) => {
  const [toggles, setToggles] = useState({
    hdr: true,
    notifications: true,
    ai: true
  });
  
  // Internal navigation state
  const [view, setView] = useState<'main' | 'wifi' | 'themes' | 'bluetooth' | 'display'>('main');

  if (!isOpen) return null;

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBack = () => {
    if (view !== 'main') setView('main');
    else onClose();
  };

  React.useEffect(() => {
    if (isOpen) {
        if (activeItem?.id === 'wifi') setView('wifi');
        else if (activeItem?.id === 'display') setView('display');
        else setView('main');
    }
  }, [isOpen, activeItem]);

  const getTitle = () => {
      switch(view) {
          case 'wifi': return 'Wi-Fi';
          case 'themes': return 'Personalización';
          case 'bluetooth': return 'Dispositivos';
          case 'display': return 'Pantalla';
          default: return activeItem?.title || 'Ajustes';
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-[500px] h-full bg-[var(--bg-main)]/95 backdrop-blur-2xl border-l border-[var(--border)] shadow-2xl animate-slideLeft flex flex-col text-[var(--text-main)]">
        
        {/* Header */}
        <div className="p-8 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-surface)]">
          <div className="flex items-center gap-4">
            {view !== 'main' && (
                <button onClick={() => { handleBack(); playSound('back'); }} className="p-2 -ml-2 hover:bg-[var(--bg-surface)] rounded-full transition-colors text-[var(--text-main)]">
                    <ArrowLeft size={20} />
                </button>
            )}
            <div>
                <h2 className="text-3xl font-bold font-tech uppercase tracking-wider">
                {getTitle()}
                </h2>
                <p className="text-[var(--text-muted)] text-sm mt-1">Configuración del Sistema</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-[var(--bg-surface)] rounded-full transition-colors text-[var(--text-main)]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-8 relative">
          
          {view === 'main' && (
              <div className="space-y-8 overflow-y-auto h-full pr-2 custom-scrollbar">
                {/* Section: Themes */}
                 <section>
                    <h3 className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-[0.2em] mb-4">Apariencia</h3>
                    <div className="space-y-3">
                        <ToggleItem 
                            icon={Palette} 
                            label="Temas Dinámicos" 
                            sublabel={`Tema actual: ${currentTheme}`} 
                            isActive={true} 
                            onClick={() => { setView('themes'); playSound('select'); }} 
                            isLink
                        />
                    </div>
                 </section>

                {/* Section: Connectivity */}
                <section>
                    <h3 className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-[0.2em] mb-4">Conectividad</h3>
                    <div className="space-y-3">
                    <ToggleItem 
                        icon={Wifi} 
                        label="Gestor Wi-Fi" 
                        sublabel={currentSsid ? `Conectado a ${currentSsid}` : "Sin conexión"} 
                        isActive={!!currentSsid} 
                        onClick={() => { setView('wifi'); playSound('select'); }} 
                        isLink
                    />
                    <ToggleItem 
                        icon={Bluetooth} 
                        label="Bluetooth" 
                        sublabel="Mandos y Audio" 
                        isActive={true} 
                        onClick={() => { setView('bluetooth'); playSound('select'); }} 
                        isLink
                    />
                    </div>
                </section>

                {/* Section: Display */}
                <section>
                    <h3 className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-[0.2em] mb-4">Pantalla & Sonido</h3>
                    <div className="space-y-3">
                    <ToggleItem 
                        icon={Monitor} 
                        label="Ajustes de Pantalla" 
                        sublabel="Resolución y Escala" 
                        isActive={true} 
                        onClick={() => { setView('display'); playSound('select'); }}
                        isLink 
                    />
                    <ToggleItem 
                        icon={Volume2} 
                        label="Dolby Atmos" 
                        sublabel="Sonido envolvente espacial" 
                        isActive={true} 
                        onClick={() => {}} 
                    />
                    </div>
                </section>
              </div>
          )}

          {view === 'wifi' && (
              <WifiManager 
                 currentSsid={currentSsid}
                 onConnect={(ssid) => onWifiConnect(ssid)} 
              />
          )}

          {view === 'bluetooth' && (
               <div className="space-y-4">
                   <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] flex items-center justify-between">
                       <span className="font-bold">Buscar dispositivos</span>
                       <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                   </div>
                   <h3 className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-[0.2em] mt-6 mb-2">Conectados</h3>
                   <DeviceItem icon={Gamepad2} name="DualSense Wireless" status="Conectado" battery={80} />
                   <DeviceItem icon={Headphones} name="Sony WH-1000XM4" status="Conectado" battery={45} />
                   
                   <h3 className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-[0.2em] mt-6 mb-2">Disponibles</h3>
                   <DeviceItem icon={Smartphone} name="iPhone 15 Pro" status="Vinculable" />
                   <DeviceItem icon={Monitor} name="LG Smart TV" status="Vinculable" />
               </div>
          )}

          {view === 'display' && (
               <div className="space-y-4">
                   <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border)] flex flex-col gap-4">
                       <div className="flex justify-between items-center">
                           <div className="flex items-center gap-3">
                               <Monitor className="text-[var(--accent)]" />
                               <span className="font-bold">Resolución</span>
                           </div>
                           <span className="text-[var(--accent)] font-mono">4K 60Hz</span>
                       </div>
                       <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                           <div className="w-full h-full bg-[var(--accent)]" />
                       </div>
                   </div>

                   <ToggleItem icon={Sun} label="HDR10+" sublabel="Mejora de contraste dinámico" isActive={toggles.hdr} onClick={() => toggle('hdr')} />
                   
                   <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)]">
                       <div className="flex items-center gap-3 mb-4">
                           <Scale size={20} className="text-[var(--text-muted)]" />
                           <span className="font-bold">Escala de Interfaz</span>
                       </div>
                       <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2 font-mono">
                           <span>Pequeño</span>
                           <span>Grande</span>
                       </div>
                       <input type="range" className="w-full accent-[var(--accent)]" />
                   </div>
               </div>
          )}

          {view === 'themes' && (
              <div className="grid grid-cols-1 gap-4">
                  {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => { onThemeChange(theme.id); playSound('success'); }}
                        className={`
                            relative p-4 rounded-xl border flex items-center justify-between transition-all
                            ${currentTheme === theme.id 
                                ? 'bg-[var(--bg-surface)] border-[var(--accent)] shadow-[0_0_15px_var(--bg-surface)]' 
                                : 'border-[var(--border)] hover:border-[var(--text-muted)]'}
                        `}
                      >
                          <div className="flex items-center gap-4">
                              <div 
                                className="w-12 h-12 rounded-lg border border-white/10 shadow-inner"
                                style={{ background: theme.vars['--bg-main'] }}
                              />
                              <div className="text-left">
                                  <div className="font-bold text-[var(--text-main)]">{theme.label}</div>
                                  <div className="text-xs text-[var(--text-muted)]">{theme.font === 'font-mono' ? 'Monospace' : 'Sans Serif'}</div>
                              </div>
                          </div>
                          {currentTheme === theme.id && <div className="w-3 h-3 bg-[var(--accent)] rounded-full animate-pulse" />}
                      </button>
                  ))}
              </div>
          )}

        </div>

        {/* Footer */}
        {view === 'main' && (
            <div className="p-8 border-t border-[var(--border)] bg-[var(--bg-surface)]">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white font-brand">
                Z
                </div>
                <div>
                <div className="text-[var(--text-main)] font-bold font-brand">Zynex ID</div>
                <div className="text-xs text-[var(--text-muted)]">Premium Account</div>
                </div>
            </div>
            </div>
        )}

      </div>
    </div>
  );
};

const ToggleItem: React.FC<{ icon: any, label: string, sublabel: string, isActive: boolean, onClick: () => void, isLink?: boolean }> = ({ icon: Icon, label, sublabel, isActive, onClick, isLink }) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border group
      ${isActive && !isLink
        ? 'bg-[var(--bg-surface)] border-[var(--accent)] shadow-[0_0_15px_rgba(var(--accent),0.2)]' 
        : 'bg-[var(--bg-surface)] border-transparent hover:border-[var(--border)]'}
    `}
  >
    <div className={`p-2 rounded-lg ${isActive ? 'bg-[var(--accent)] text-white' : 'bg-gray-800 text-gray-400'}`}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <div className={`font-semibold text-[var(--text-main)]`}>{label}</div>
      <div className="text-xs text-[var(--text-muted)]">{sublabel}</div>
    </div>
    
    {isLink ? (
         <div className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
             <ArrowLeft size={16} className="rotate-180" />
         </div>
    ) : (
        <div className={`
        w-12 h-6 rounded-full relative transition-colors duration-300
        ${isActive ? 'bg-[var(--accent)]' : 'bg-gray-700'}
        `}>
        <div className={`
            absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300
            ${isActive ? 'left-7' : 'left-1'}
        `} />
        </div>
    )}
  </div>
);

const DeviceItem = ({ icon: Icon, name, status, battery }: any) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => playSound('hover')}>
        <div className="flex items-center gap-3">
            <Icon size={18} className="text-[var(--text-muted)]" />
            <span className="text-sm font-medium text-[var(--text-main)]">{name}</span>
        </div>
        <div className="flex items-center gap-2">
            {battery && <span className="text-[10px] text-emerald-400 font-mono">{battery}%</span>}
            <span className="text-[10px] text-[var(--text-muted)] uppercase">{status}</span>
        </div>
    </div>
);
