import React from 'react';
import { X, CloudRain, CloudSun, Sun, Cloud, Wind, Droplets } from 'lucide-react';

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const forecast = [
    { day: 'Hoy', temp: '24°', icon: CloudSun, label: 'Parcialmente Nublado' },
    { day: 'Mañana', temp: '22°', icon: CloudRain, label: 'Lluvias Dispersas' },
    { day: 'Mié', temp: '26°', icon: Sun, label: 'Soleado' },
    { day: 'Jue', temp: '21°', icon: Cloud, label: 'Nublado' },
    { day: 'Vie', temp: '23°', icon: CloudSun, label: 'Mayormente Soleado' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111]/90 border border-white/10 p-12 rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden animate-scaleIn">
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-white"
        >
            <X size={24} />
        </button>

        <div className="grid grid-cols-2 gap-12">
            {/* Left: Current */}
            <div className="flex flex-col justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-white font-tech uppercase tracking-widest mb-1">Buenos Aires</h2>
                    <p className="text-gray-400 text-lg">Lunes, 12 de Octubre</p>
                </div>
                
                <div className="flex items-center gap-6 my-8">
                    <CloudSun size={80} className="text-indigo-400" />
                    <div>
                        <div className="text-8xl font-bold text-white leading-none font-tech">24°</div>
                        <div className="text-xl text-indigo-300 font-medium mt-2">Sensación térmica 26°</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl flex items-center gap-4">
                        <Wind className="text-gray-400" />
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Viento</div>
                            <div className="text-white font-bold">12 km/h</div>
                        </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl flex items-center gap-4">
                        <Droplets className="text-gray-400" />
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Humedad</div>
                            <div className="text-white font-bold">45%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Forecast */}
            <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Pronóstico extendido</h3>
                <div className="space-y-4">
                    {forecast.map((day, idx) => (
                        <div key={idx} className="flex items-center justify-between group hover:bg-white/5 p-2 rounded-lg transition-colors">
                            <span className="text-white w-16 font-medium">{day.day}</span>
                            <div className="flex items-center gap-3 flex-1 justify-center">
                                <day.icon size={20} className="text-indigo-400" />
                                <span className="text-sm text-gray-400">{day.label}</span>
                            </div>
                            <span className="text-white font-bold font-tech text-lg">{day.temp}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-4 border-t border-white/10 text-center">
                    <button className="text-indigo-400 text-sm font-bold uppercase tracking-wider hover:text-indigo-300 transition-colors">
                        Ver Radar Doppler
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};