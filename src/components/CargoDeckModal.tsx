import React from 'react';
import { X, Ship, CheckCircle2 } from 'lucide-react';

interface CargoDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordsA: string[];
  wordsAn: string[];
}

export const CargoDeckModal: React.FC<CargoDeckModalProps> = ({
  isOpen,
  onClose,
  wordsA,
  wordsAn
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="cargo-deck-modal"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
    >
      <div className="relative max-w-lg w-full bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-cyan-300" />
            <h3 className="font-bold text-lg text-white font-['Fredoka']">Cargo Deck (คำศัพท์บนดาดฟ้าเรือ)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 text-xs">
          {/* Boat 'a' */}
          <div className="bg-slate-800/60 border border-cyan-500/25 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-bold text-cyan-300 text-sm">
                Boat 'a' ({wordsA.length} / 30 คำ)
              </span>
              <span className="text-[11px] text-slate-400">พยัญชนะ (Consonant sound)</span>
            </div>
            {wordsA.length === 0 ? (
              <p className="text-slate-400 italic">ยังไม่มีคำศัพท์บนเรือ 'a' — จีบจับปลาแล้วลากมาใส่ที่นี่</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {wordsA.map((w, i) => (
                  <span
                    key={i}
                    className="bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 px-2 py-0.5 rounded-lg text-xs"
                  >
                    a {w}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Boat 'an' */}
          <div className="bg-slate-800/60 border border-amber-500/25 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-bold text-amber-300 text-sm">
                Boat 'an' ({wordsAn.length} / 30 คำ)
              </span>
              <span className="text-[11px] text-slate-400">สระ (Vowel sound: a, e, i, o, u)</span>
            </div>
            {wordsAn.length === 0 ? (
              <p className="text-slate-400 italic">ยังไม่มีคำศัพท์บนเรือ 'an' — จีบจับปลาแล้วลากมาใส่ที่นี่</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {wordsAn.map((w, i) => (
                  <span
                    key={i}
                    className="bg-amber-950/80 border border-amber-500/40 text-amber-200 px-2 py-0.5 rounded-lg text-xs"
                  >
                    an {w}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shrink-0"
        >
          กลับสู่เกม (Close)
        </button>
      </div>
    </div>
  );
};
