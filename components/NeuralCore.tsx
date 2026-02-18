
import React, { useEffect, useRef, useState } from 'react';
import { X, Activity, Globe, Terminal, Cpu, Database, Shield, Radio } from 'lucide-react';

interface NeuralCoreProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NeuralCore: React.FC<NeuralCoreProps> = ({ isOpen, onClose }) => {
  const [loadLevel, setLoadLevel] = useState(0); // 0 to 1
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Track Mouse Speed for "Load" simulation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculation Loop
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const dx = mouseRef.current.x - lastMouseRef.current.x;
      const dy = mouseRef.current.y - lastMouseRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      // Decay or Spike load based on movement
      setLoadLevel(prev => {
        const target = Math.min(1, speed / 50); // Sensitivity
        return prev + (target - prev) * 0.1; // Smooth lerp
      });

      lastMouseRef.current = { ...mouseRef.current };
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black text-green-500 font-mono overflow-hidden animate-fadeIn">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-8 border-b border-green-900/50 bg-green-900/10 backdrop-blur-md">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 border border-green-500/50 rounded flex items-center justify-center animate-pulse">
                <Cpu size={24} />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-white shadow-green-glow">Neural Core v9.0</h1>
                <div className="text-xs text-green-400 opacity-70 flex gap-4">
                    <span>KERNEL: ACTIVE</span>
                    <span>UPTIME: 99.99%</span>
                    <span>ENCRYPTION: AES-4096</span>
                </div>
            </div>
        </div>
        <button onClick={onClose} className="p-4 hover:bg-green-500/20 rounded-full transition-colors text-white border border-green-500/30 hover:border-green-400">
            <X size={32} />
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="relative z-10 grid grid-cols-12 grid-rows-2 h-[calc(100vh-100px)] p-8 gap-8">
        
        {/* LEFT COL: NETWORK MAP */}
        <div className="col-span-4 row-span-2 bg-black/40 border border-green-900 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-4 left-4 flex items-center gap-2 text-green-400">
                <Globe size={16} />
                <span className="text-xs font-bold tracking-widest uppercase">Global Network Map</span>
            </div>
            <HoloGlobe />
            
            {/* Overlay Data */}
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <div className="flex justify-between text-xs text-green-600">
                    <span>LATENCY</span>
                    <span className="text-white">12ms</span>
                </div>
                <div className="w-full h-1 bg-green-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full animate-progress-indeterminate" />
                </div>
                <div className="flex justify-between text-xs text-green-600">
                     <span>NODES CONNECTED</span>
                     <span className="text-white animate-pulse">8,402</span>
                </div>
            </div>
        </div>

        {/* TOP RIGHT: CPU WAVEFORM */}
        <div className="col-span-8 row-span-1 bg-black/40 border border-green-900 rounded-2xl relative overflow-hidden flex flex-col">
             <div className="absolute top-4 left-4 flex items-center gap-2 text-green-400 z-10">
                <Activity size={16} />
                <span className="text-xs font-bold tracking-widest uppercase">Neural Processor Load</span>
            </div>
            
            <div className="absolute top-4 right-4 z-10 text-right">
                <div className={`text-4xl font-bold transition-colors duration-300 ${loadLevel > 0.5 ? 'text-red-500' : 'text-green-500'}`}>
                    {(loadLevel * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Realtime Usage</div>
            </div>

            <WaveformVisualizer load={loadLevel} />
        </div>

        {/* BOTTOM RIGHT: TERMINAL & SECURITY */}
        <div className="col-span-8 row-span-1 grid grid-cols-2 gap-8">
            
            {/* Terminal */}
            <div className="bg-black/80 border border-green-900/50 rounded-2xl p-4 font-mono text-xs overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 text-gray-500 mb-2 border-b border-gray-800 pb-2">
                    <Terminal size={12} />
                    <span>SYS_ROOT:/logs/kernel</span>
                </div>
                <TerminalLog />
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            </div>

            {/* Security Modules */}
            <div className="grid grid-rows-2 gap-4">
                 <div className="bg-green-900/5 border border-green-500/20 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-green-400 mb-1">
                            <Shield size={18} />
                            <span className="font-bold tracking-wider">FIREWALL</span>
                        </div>
                        <div className="text-2xl font-bold text-white">SECURE</div>
                    </div>
                    <div className="relative z-10 text-right">
                        <div className="text-xs text-green-600">THREATS BLOCKED</div>
                        <div className="text-xl text-green-400">14,209</div>
                    </div>
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-green-500/10 rounded-full blur-xl animate-pulse" />
                 </div>

                 <div className="bg-blue-900/5 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                            <Database size={18} />
                            <span className="font-bold tracking-wider">DATA STREAM</span>
                        </div>
                        <div className="text-2xl font-bold text-white">12.5 TB</div>
                    </div>
                    <div className="relative z-10">
                        <Radio size={24} className="text-blue-500 animate-ping" style={{ animationDuration: '2s' }}/>
                    </div>
                 </div>
            </div>
        </div>
      </div>
      
      <style>{`
        .shadow-green-glow { text-shadow: 0 0 10px rgba(74, 222, 128, 0.5); }
        @keyframes progress-indeterminate {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .animate-progress-indeterminate {
            animation: progress-indeterminate 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

// --- SUB COMPONENTS ---

const TerminalLog = () => {
    const [logs, setLogs] = useState<string[]>([
        "INIT: System core modules loaded...",
        "MOUNT: /dev/sda1 mounted on /root",
        "NET: Establishing secure handshake...",
        "AUTH: User biometric verified."
    ]);

    useEffect(() => {
        const commands = [
            "SCANNING PORTS...", "DECRYPTING STREAM...", "PACKET LOSS DETECTED [RETRYING]", 
            "PING 8.8.8.8 [0.4ms]", "OPTIMIZING CACHE...", "ALLOCATING MEMORY BLOCKS...",
            "RENDER_ENGINE: GPU SYNC OK", "AI_MODEL: INFERENCE STARTED", "DOWNLOADING ASSETS..."
        ];

        const interval = setInterval(() => {
            setLogs(prev => {
                const newLog = `[${new Date().toLocaleTimeString()}] ${commands[Math.floor(Math.random() * commands.length)]}`;
                const newLogs = [...prev, newLog];
                if (newLogs.length > 12) newLogs.shift();
                return newLogs;
            });
        }, 300);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-1 text-[10px] text-green-300/80 font-mono leading-tight">
            {logs.map((log, i) => (
                <div key={i} className="truncate animate-slideUp">{log}</div>
            ))}
            <div className="w-2 h-4 bg-green-500 animate-pulse mt-1" />
        </div>
    );
};

const WaveformVisualizer = ({ load }: { load: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;
            timeRef.current += 0.05 + (load * 0.2); // Time moves faster with load

            ctx.clearRect(0, 0, width, height);
            
            // Color Shift: Blue/Green -> Red/Orange
            const r = Math.floor(load * 255);
            const g = Math.floor(255 - (load * 100));
            const b = Math.floor(255 - (load * 255));
            const color = `rgb(${r},${g},${b})`;

            ctx.lineWidth = 2;
            
            // Draw 3 waves
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.strokeStyle = i === 0 ? color : `rgba(${r},${g},${b},0.3)`;
                
                for (let x = 0; x < width; x++) {
                    // Complex Sine Wave Math
                    // Y = Center + Amplitude * sin(frequency + time)
                    const baseFreq = 0.02 + (i * 0.01);
                    const amplitude = (height / 4) * (0.5 + load); // Amp grows with load
                    const noise = (Math.sin(x * 0.1 + timeRef.current) * 5) * load; // Jitter with load
                    
                    const y = (height / 2) + 
                              Math.sin(x * baseFreq + timeRef.current + (i * 2)) * amplitude +
                              noise;
                    
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            requestAnimationFrame(draw);
        };
        
        const animation = requestAnimationFrame(draw);
        
        // Handle Resize
        const resize = () => {
            canvas.width = canvas.parentElement?.clientWidth || 300;
            canvas.height = canvas.parentElement?.clientHeight || 200;
        };
        window.addEventListener('resize', resize);
        resize();

        return () => {
            cancelAnimationFrame(animation);
            window.removeEventListener('resize', resize);
        };
    }, [load]);

    return <canvas ref={canvasRef} className="w-full h-full" />;
};

const HoloGlobe = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const angleRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Generate Points
        const points: {x: number, y: number, z: number}[] = [];
        const numPoints = 400;
        for(let i=0; i<numPoints; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 100; // Radius
            points.push({
                x: r * Math.sin(phi) * Math.cos(theta),
                y: r * Math.sin(phi) * Math.sin(theta),
                z: r * Math.cos(phi)
            });
        }

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;
            const cx = width / 2;
            const cy = height / 2;
            
            angleRef.current += 0.005;
            
            ctx.clearRect(0, 0, width, height);

            // Lines shooting out (Random "Pings")
            if (Math.random() > 0.90) {
                 const randomPoint = points[Math.floor(Math.random() * points.length)];
                 // Projected coordinates for the ping would be complex, simplifying for effect:
                 // Just drawing random lines from center to rough direction
                 ctx.beginPath();
                 ctx.moveTo(cx, cy);
                 ctx.lineTo(cx + (Math.random() - 0.5) * 200, cy + (Math.random() - 0.5) * 200);
                 ctx.strokeStyle = "rgba(74, 222, 128, 0.2)"; // faint green
                 ctx.stroke();
            }

            // Draw Points
            points.forEach(p => {
                // Rotate Y
                const x1 = p.x * Math.cos(angleRef.current) - p.z * Math.sin(angleRef.current);
                const z1 = p.x * Math.sin(angleRef.current) + p.z * Math.cos(angleRef.current);
                
                // Rotate X (Tilt)
                const tilt = 0.3;
                const y2 = p.y * Math.cos(tilt) - z1 * Math.sin(tilt);
                const z2 = p.y * Math.sin(tilt) + z1 * Math.cos(tilt);

                // Project
                const scale = 200 / (200 + z2);
                const x2D = x1 * scale + cx;
                const y2D = y2 * scale + cy;
                const alpha = (z2 + 100) / 200; // Fade back points

                if (alpha > 0) {
                    ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`; // Green
                    ctx.fillRect(x2D, y2D, 1.5, 1.5);
                }
                
                // Draw Connections (Wireframe effect for close points)
                // Doing this for all points is heavy, let's do randomly
                if(Math.random() > 0.995) {
                     ctx.beginPath();
                     ctx.moveTo(cx, cy); // From core
                     ctx.lineTo(x2D, y2D);
                     ctx.strokeStyle = `rgba(34, 197, 94, ${alpha * 0.3})`;
                     ctx.stroke();
                }
            });

            requestAnimationFrame(draw);
        };
        
        const animation = requestAnimationFrame(draw);
        const resize = () => {
            canvas.width = canvas.parentElement?.clientWidth || 300;
            canvas.height = canvas.parentElement?.clientHeight || 300;
        };
        window.addEventListener('resize', resize);
        resize();

        return () => {
             cancelAnimationFrame(animation);
             window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full" />;
};
