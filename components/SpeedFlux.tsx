
import React, { useState, useEffect } from 'react';
import { X, ArrowDown, ArrowUp, Activity, ArrowLeft, RefreshCw } from 'lucide-react';
import { playSound } from '../utils/sound';

interface SpeedFluxProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpeedFlux: React.FC<SpeedFluxProps> = ({ isOpen, onClose }) => {
  const [stage, setStage] = useState<'IDLE' | 'PING' | 'DOWNLOAD' | 'UPLOAD' | 'DONE'>('IDLE');
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const [graphPoints, setGraphPoints] = useState<number[]>(new Array(40).fill(50));

  useEffect(() => {
    if (!isOpen) {
        setStage('IDLE');
        setDownloadSpeed(0);
        setUploadSpeed(0);
        setPing(0);
        return;
    }
  }, [isOpen]);

  const startTest = () => {
    playSound('select');
    setStage('PING');
    setPing(0);
    
    // NOTA: Esto es una simulación visual. 
    // Para datos reales se requeriría una API de Speedtest o descargar archivos reales.
    let p = 0;
    const pingInterval = setInterval(() => {
        p += Math.floor(Math.random() * 5);
        setPing(p);
        if (p > 12) {
            clearInterval(pingInterval);
            setPing(Math.floor(Math.random() * 10) + 5); // Final realistic ping
            startDownload();
        }
    }, 100);
  };

  const startDownload = () => {
      setStage('DOWNLOAD');
      let speed = 0;
      const target = 850; // 850 Mbps target simulation
      
      const interval = setInterval(() => {
          speed += (target - speed) * 0.1 + Math.random() * 20;
          setDownloadSpeed(Math.floor(speed));
          updateGraph(speed);
          
          if (speed > target - 20) {
              clearInterval(interval);
              startUpload();
          }
      }, 100);
  };

  const startUpload = () => {
      setStage('UPLOAD');
      let speed = 0;
      const target = 600; // 600 Mbps target simulation
      
      const interval = setInterval(() => {
        speed += (target - speed) * 0.1 + Math.random() * 20;
        setUploadSpeed(Math.floor(speed));
        updateGraph(speed);
        
        if (speed > target - 20) {
            clearInterval(interval);
            setStage('DONE');
            playSound('success');
        }
    }, 100);
  };

  const updateGraph = (val: number) => {
      setGraphPoints(prev => {
          const arr = [...prev.slice(1), val / 10]; // Scale down for graph height
          return arr;
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn font-tech">
      <div className="relative w-full max-w-4xl p-12 flex flex-col items-center">
          
          {/* Top Bar */}
          <div className="absolute top-8 right-12">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest mr-4">Server: Zynex Virtual Node (Simulated)</span>
          </div>

          <h2 className="text-4xl font-bold text-white tracking-[0.3em] uppercase mb-12 flex items-center gap-4 font-brand">
              <Activity className="text-cyan-400" size={32} /> Zynex SpeedFlux
          </h2>

          {/* Main Guage */}
          <div className="relative w-80 h-80 flex items-center justify-center mb-12">
              {/* Outer Ring */}
              <div className="absolute inset-0 border-4 border-gray-800 rounded-full" />
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                 <circle
                    cx="160" cy="160" r="150"
                    stroke="currentColor" strokeWidth="8" fill="transparent"
                    strokeDasharray={942} // 2*PI*150
                    strokeDashoffset={942 - ((stage === 'DOWNLOAD' ? downloadSpeed / 1000 : uploadSpeed / 1000) * 942)}
                    className={`${stage === 'UPLOAD' ? 'text-purple-500' : 'text-cyan-500'} transition-all duration-200`}
                    strokeLinecap="round"
                 />
              </svg>

              <div className="text-center">
                  <div className="text-8xl font-black text-white leading-none">
                      {stage === 'DOWNLOAD' || stage === 'DONE' ? Math.floor(downloadSpeed) : Math.floor(uploadSpeed)}
                  </div>
                  <div className="text-xl text-gray-400 uppercase tracking-widest mt-2">Mbps</div>
              </div>
          </div>

          {/* Graph */}
          <div className="w-full h-24 flex items-end gap-1 mb-8 opacity-50 bg-white/5 rounded-lg overflow-hidden p-2">
              {graphPoints.map((h, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-t-sm transition-all duration-100 ${stage === 'UPLOAD' ? 'bg-purple-500' : 'bg-cyan-500'}`} 
                    style={{ height: `${Math.min(100, h)}%` }} 
                  />
              ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-8 w-full">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center">
                  <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Ping</div>
                  <div className="text-3xl font-bold text-white">{ping} <span className="text-sm font-normal text-gray-500">ms</span></div>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center">
                  <div className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><ArrowDown size={14}/> Download</div>
                  <div className="text-3xl font-bold text-white">{Math.floor(downloadSpeed)} <span className="text-sm font-normal text-gray-500">Mbps</span></div>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center">
                  <div className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><ArrowUp size={14}/> Upload</div>
                  <div className="text-3xl font-bold text-white">{Math.floor(uploadSpeed)} <span className="text-sm font-normal text-gray-500">Mbps</span></div>
              </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex items-center gap-6">
              {stage === 'IDLE' || stage === 'DONE' ? (
                  <button 
                    onClick={startTest}
                    className="flex items-center gap-3 px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all hover:scale-105"
                  >
                      {stage === 'DONE' ? <RefreshCw size={20} /> : <Activity size={20} />}
                      {stage === 'IDLE' ? 'Iniciar Test' : 'Reiniciar'}
                  </button>
              ) : (
                <div className="px-10 py-4 bg-white/5 text-cyan-400 animate-pulse font-bold tracking-widest uppercase rounded-xl border border-cyan-500/30">
                    Procesando datos...
                </div>
              )}

              <button 
                onClick={() => { onClose(); playSound('back'); }}
                className="flex items-center gap-3 px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest rounded-xl border border-white/10 transition-all hover:scale-105"
              >
                  <ArrowLeft size={20} /> Volver
              </button>
          </div>

      </div>
    </div>
  );
};
