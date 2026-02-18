import React from 'react';

export const VoiceVisualizer: React.FC<{ isListening: boolean }> = ({ isListening }) => {
  if (!isListening) return null;

  return (
    <div className="flex items-center gap-1 h-6">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-red-500 rounded-full animate-voice-wave"
          style={{
            height: '100%',
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
      <style>{`
        @keyframes voice-wave {
          0%, 100% { height: 20%; opacity: 0.5; }
          50% { height: 100%; opacity: 1; }
        }
        .animate-voice-wave {
          animation: voice-wave infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};