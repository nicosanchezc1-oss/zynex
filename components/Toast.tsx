import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClear: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClear }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClear, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[80] animate-slideUpFade">
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
        <div className="bg-emerald-500 rounded-full p-1 text-black">
            <Check size={12} strokeWidth={4} />
        </div>
        <span className="font-medium tracking-wide text-sm">{message}</span>
      </div>
    </div>
  );
};