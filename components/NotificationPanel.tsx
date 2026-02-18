import React from 'react';
import { X, Bell, Download, ShieldAlert, CheckCircle } from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const notifications = [
    { id: 1, type: 'system', title: 'Actualización de Sistema', desc: 'Zenith OS 2.1 está listo para instalar.', time: 'Hace 2 min', icon: Download, color: 'text-blue-400' },
    { id: 2, type: 'security', title: 'Escaneo Completado', desc: 'No se encontraron amenazas en el sistema.', time: 'Hace 1 hora', icon: ShieldAlert, color: 'text-emerald-400' },
    { id: 3, type: 'app', title: 'Netflix', desc: 'Descarga de contenido en segundo plano finalizada.', time: 'Hace 3 horas', icon: CheckCircle, color: 'text-purple-400' },
    { id: 4, type: 'system', title: 'Dispositivo Conectado', desc: 'Mando PS5 detectado vía Bluetooth.', time: 'Ayer', icon: Bell, color: 'text-gray-400' },
  ];

  return (
    <>
        {/* Backdrop */}
        <div 
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        />
        
        {/* Panel */}
        <div className={`
            fixed top-0 right-0 h-full w-[400px] bg-[#0a0a0a]/95 backdrop-blur-2xl border-l border-white/10 z-50 
            shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
            <div className="p-8 h-full flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <Bell size={20} />
                        </div>
                        <h2 className="text-2xl font-bold font-tech text-white uppercase tracking-wider">Notificaciones</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {notifications.map((item) => (
                        <div key={item.id} className="group p-4 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 rounded-xl transition-all duration-300 cursor-default">
                            <div className="flex justify-between items-start mb-2">
                                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${item.color}`}>
                                    <item.icon size={12} />
                                    <span>{item.type}</span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono">{item.time}</span>
                            </div>
                            <h3 className="text-white font-bold mb-1 group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                    
                    <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-gray-500 text-sm mt-8">
                        No hay más notificaciones recientes
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/10">
                    <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-colors">
                        Borrar Todo
                    </button>
                </div>
            </div>
        </div>
    </>
  );
};