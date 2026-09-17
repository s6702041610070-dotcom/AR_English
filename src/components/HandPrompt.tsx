import React from 'react';
import { Hand } from 'lucide-react';

interface HandPromptProps {
  show: boolean;
}

export const HandPrompt: React.FC<HandPromptProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div
      id="hand-detection-prompt"
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-300 animate-pulse"
    >
      <div className="bg-slate-900/85 backdrop-blur-xl border border-cyan-500/40 text-cyan-200 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 border border-cyan-400/40">
          <Hand className="w-5 h-5 text-cyan-300 animate-bounce" />
        </div>
        <div className="text-sm font-medium">
          <span className="font-bold text-white">กำลังหามือของคุณ...</span>
          <span className="text-xs text-cyan-300 block opacity-90">
            (กรุณายื่นมือมาหน้ากล้อง แล้วจีบนิ้วชี้กับนิ้วโป้งเพื่อจับปลา)
          </span>
        </div>
      </div>
    </div>
  );
};
