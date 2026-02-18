
import React, { useState, useEffect, useRef } from 'react';
import { X, Terminal } from 'lucide-react';

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({ isOpen, onClose }) => {
  const [lines, setLines] = useState<string[]>(['Welcome to Zynex Shell v3.0', 'Initializing root access...', '> ']);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    // Simulate typing activity
    const interval = setInterval(() => {
        const commands = [
            "fetching packages...", "checking integrity...", "mounting /dev/sda1...", 
            "ping 192.168.1.1 -t", "decrypting stream keys...", "rendering frame buffer..."
        ];
        
        setLines(prev => {
            const newLine = Math.random() > 0.7 ? `> ${commands[Math.floor(Math.random() * commands.length)]}` : `  [OK] Process ${Math.floor(Math.random()*9999)} started`;
            const updated = [...prev, newLine];
            if (updated.length > 20) updated.shift();
            return updated;
        });
    }, 800);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn">
         <div className="w-[70%] h-[60%] bg-black border border-green-500/30 rounded-lg shadow-[0_0_50px_rgba(34,197,94,0.1)] flex flex-col font-mono text-sm overflow-hidden">
             {/* Header */}
             <div className="bg-green-900/10 border-b border-green-500/20 p-2 flex justify-between items-center px-4">
                 <div className="flex items-center gap-2 text-green-500">
                     <Terminal size={14} />
                     <span className="font-bold">root@zynex-box:~</span>
                 </div>
                 <button onClick={onClose} className="text-green-700 hover:text-green-400">
                     <X size={16} />
                 </button>
             </div>
             
             {/* Content */}
             <div className="flex-1 p-4 text-green-400 space-y-1 overflow-hidden relative">
                 {lines.map((line, i) => (
                     <div key={i} className="break-all">{line}</div>
                 ))}
                 <div ref={bottomRef} />
                 
                 {/* CRT Effect */}
                 <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />
             </div>
         </div>
    </div>
  );
};
