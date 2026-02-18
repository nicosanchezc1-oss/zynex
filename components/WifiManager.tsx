
import React, { useState, useEffect } from 'react';
import { Wifi, Lock, Loader2, Check, RefreshCw, Signal, SignalHigh, SignalMedium, SignalLow, Router } from 'lucide-react';
import { VirtualKeyboard } from './VirtualKeyboard';
import { playSound } from '../utils/sound';

interface WifiManagerProps {
  onConnect: (ssid: string) => void;
  currentSsid: string | null;
}

export const WifiManager: React.FC<WifiManagerProps> = ({ onConnect, currentSsid }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [networks, setNetworks] = useState<{ ssid: string, signal: number, secure: boolean }[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected'>('idle');

  // Simulate Scan on Mount
  useEffect(() => {
    scanNetworks();
  }, []);

  const scanNetworks = () => {
    playSound('select');
    setIsScanning(true);
    setNetworks([]);
    
    // Scan simulation time
    setTimeout(() => {
        const mockNetworks = [
            { ssid: 'FBI Surveillance Van #4', signal: 95, secure: true },
            { ssid: 'Virus Gratis', signal: 80, secure: false },
            { ssid: 'Casa de Juan', signal: 70, secure: true },
            { ssid: 'Skynet Global', signal: 60, secure: true },
            { ssid: 'No robar WiFi', signal: 45, secure: true },
            { ssid: 'Area 51 Guest', signal: 90, secure: true },
            { ssid: 'Martin Router King', signal: 30, secure: true },
        ];
        // Sort by signal
        mockNetworks.sort((a, b) => b.signal - a.signal);
        setNetworks(mockNetworks);
        setIsScanning(false);
        playSound('success');
    }, 3000);
  };

  const handleNetworkClick = (ssid: string, secure: boolean) => {
    playSound('select');
    if (ssid === currentSsid) return;
    
    setSelectedNetwork(ssid);
    if (secure) {
        setShowKeyboard(true);
    } else {
        simulateConnection(ssid);
    }
  };

  const simulateConnection = (ssid: string) => {
    setConnectionState('connecting');
    setTimeout(() => {
        setConnectionState('connected');
        playSound('success');
        onConnect(ssid);
        setTimeout(() => setConnectionState('idle'), 2000); // Reset UI state
    }, 2000);
  };

  const handlePasswordSubmit = (password: string) => {
    setShowKeyboard(false);
    if (password.length > 0 && selectedNetwork) {
        simulateConnection(selectedNetwork);
    }
  };

  // Helper for signal icons
  const getSignalIcon = (strength: number) => {
      if (strength > 80) return <SignalHigh size={20} />;
      if (strength > 50) return <SignalMedium size={20} />;
      if (strength > 20) return <SignalLow size={20} />;
      return <Signal size={20} className="opacity-50" />;
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
          <h3 className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-[0.2em]">Redes Disponibles</h3>
          <button 
            onClick={scanNetworks} 
            className="p-2 hover:bg-[var(--bg-surface)] rounded-full transition-colors group text-[var(--text-muted)] hover:text-[var(--text-main)]"
            title="Escanear de nuevo"
            disabled={isScanning}
          >
            <RefreshCw size={16} className={`transition-all ${isScanning ? 'animate-spin' : ''}`} />
          </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {isScanning ? (
            <div className="flex flex-col items-center justify-center h-64 gap-8">
                {/* Radar Animation */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Concentric Circles */}
                    <div className="absolute inset-0 border border-[var(--border)] rounded-full opacity-30" />
                    <div className="absolute inset-4 border border-[var(--border)] rounded-full opacity-30" />
                    <div className="absolute inset-8 border border-[var(--border)] rounded-full opacity-30" />
                    <div className="absolute inset-[38%] bg-[var(--accent)] rounded-full animate-pulse shadow-[0_0_20px_var(--accent)]" />
                    
                    {/* Rotating Sweep */}
                    <div className="absolute inset-0 rounded-full animate-spin-slow" 
                        style={{ 
                            background: `conic-gradient(from 0deg, transparent 0deg, var(--accent) 360deg)`,
                            maskImage: 'radial-gradient(transparent 30%, black 70%)',
                            opacity: 0.2
                        }} 
                    />
                    
                    {/* Blips */}
                    <div className="absolute top-4 right-8 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}/>
                    <div className="absolute bottom-6 left-6 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1.2s' }}/>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] animate-pulse">Escaneando espectro...</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Buscando señales 2.4GHz / 5GHz</span>
                </div>
            </div>
        ) : (
            networks.map((net) => {
                const isConnected = currentSsid === net.ssid;
                const isConnecting = connectionState === 'connecting' && selectedNetwork === net.ssid;
                
                return (
                    <button
                        key={net.ssid}
                        onClick={() => handleNetworkClick(net.ssid, net.secure)}
                        className={`
                            w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group
                            ${isConnected 
                                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                                : 'bg-[var(--bg-surface)] border-transparent hover:border-[var(--border)] hover:translate-x-1'}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`${isConnected ? 'text-emerald-400' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}>
                                {getSignalIcon(net.signal)}
                            </div>
                            <div className="text-left">
                                <div className={`font-medium ${isConnected ? 'text-emerald-400' : 'text-[var(--text-main)]'}`}>
                                    {net.ssid}
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider group-hover:text-[var(--text-main)]/70">
                                    {isConnected ? 'Conectado' : isConnecting ? 'Obteniendo IP...' : net.secure ? 'WPA2 Segura' : 'Abierta'}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {net.secure && !isConnected && <Lock size={14} className="text-[var(--text-muted)]" />}
                            {isConnected && <Check size={18} className="text-emerald-400" />}
                            {isConnecting && <Loader2 size={18} className="text-[var(--accent)] animate-spin" />}
                        </div>
                    </button>
                );
            })
        )}
      </div>

      <VirtualKeyboard 
        isVisible={showKeyboard} 
        title={`Contraseña para ${selectedNetwork}`}
        placeholder="Introduce la contraseña WPA2"
        onEnter={handlePasswordSubmit}
        onCancel={() => {
            setShowKeyboard(false);
            playSound('back');
        }}
      />
    </div>
  );
};
