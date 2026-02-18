
import React, { useState, useEffect, useCallback } from 'react';
import { Delete, Check, ArrowBigUp } from 'lucide-react';

interface VirtualKeyboardProps {
  isVisible: boolean;
  initialValue?: string;
  placeholder?: string;
  onEnter: (text: string) => void;
  onCancel: () => void;
  title?: string;
}

const KEYS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '-'],
  ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK', 'ENTER']
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ isVisible, initialValue = '', placeholder, onEnter, onCancel, title }) => {
  const [text, setText] = useState(initialValue);
  const [rowIndex, setRowIndex] = useState(1);
  const [colIndex, setColIndex] = useState(0);
  const [isShift, setIsShift] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isVisible) {
      setText(initialValue);
      setRowIndex(1);
      setColIndex(0);
    }
  }, [isVisible, initialValue]);

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'BACK') {
      setText(prev => prev.slice(0, -1));
    } else if (key === 'ENTER') {
      onEnter(text);
    } else if (key === 'SHIFT') {
      setIsShift(prev => !prev);
    } else {
      setText(prev => prev + (isShift ? key.toUpperCase() : key.toLowerCase()));
    }
  }, [text, isShift, onEnter]);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const currentRow = KEYS[rowIndex];

      switch (e.key) {
        case 'ArrowUp':
          setRowIndex(prev => Math.max(0, prev - 1));
          setColIndex(prev => Math.min(prev, KEYS[Math.max(0, rowIndex - 1)].length - 1));
          break;
        case 'ArrowDown':
          setRowIndex(prev => Math.min(KEYS.length - 1, prev + 1));
          setColIndex(prev => Math.min(prev, KEYS[Math.min(KEYS.length - 1, rowIndex + 1)].length - 1));
          break;
        case 'ArrowLeft':
          setColIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          setColIndex(prev => Math.min(currentRow.length - 1, prev + 1));
          break;
        case 'Enter':
          handleKeyPress(currentRow[colIndex]);
          break;
        case 'Escape':
          onCancel();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, rowIndex, colIndex, handleKeyPress, onCancel]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-xl flex flex-col justify-end pb-12 animate-fadeIn">
      <div className="w-full max-w-4xl mx-auto px-12">
        {/* Input Display */}
        <div className="mb-8">
            {title && <h3 className="text-gray-400 font-bold uppercase tracking-widest mb-2">{title}</h3>}
            <div className="bg-white/10 border border-white/20 rounded-xl p-6 flex items-center justify-between">
                <span className="text-3xl font-mono text-white tracking-widest min-h-[40px]">
                    {text || <span className="text-gray-600">{placeholder}</span>}
                    <span className="animate-pulse text-indigo-400">|</span>
                </span>
                <span className="text-xs text-gray-500 uppercase font-bold">Teclado Virtual</span>
            </div>
        </div>

        {/* Keyboard Grid */}
        <div className="grid gap-3 bg-[#111] p-6 rounded-3xl border border-white/10 shadow-2xl">
          {KEYS.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-3 justify-center">
              {row.map((key, cIdx) => {
                const isFocused = rowIndex === rIdx && colIndex === cIdx;
                let widthClass = 'w-16'; // standard key
                if (key === 'SPACE') widthClass = 'flex-1';
                if (key === 'ENTER' || key === 'SHIFT') widthClass = 'w-32';
                if (key === 'BACK') widthClass = 'w-24';

                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    className={`
                      ${widthClass} h-16 rounded-xl font-bold text-xl flex items-center justify-center transition-all duration-200
                      ${isFocused 
                        ? 'bg-white text-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)] z-10' 
                        : 'bg-white/5 text-gray-300 border border-white/5'}
                    `}
                  >
                    {key === 'BACK' ? <Delete size={20} /> : 
                     key === 'ENTER' ? <Check size={20} /> :
                     key === 'SHIFT' ? <ArrowBigUp size={24} className={isShift ? 'fill-current' : ''} /> :
                     (isShift ? key : key.toLowerCase())}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6 text-gray-500 text-xs uppercase tracking-[0.2em]">
            Usa las flechas para navegar • Enter para seleccionar • Escape para salir
        </div>
      </div>
    </div>
  );
};
