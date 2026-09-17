import React from 'react';
import { Trophy, RotateCcw, CheckCircle2, Sparkles, Ship } from 'lucide-react';

interface VictoryModalProps {
  score: number;
  maxCombo: number;
  totalWords: number;
  wordsA: string[];
  wordsAn: string[];
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  maxCombo,
  totalWords,
  wordsA,
  wordsAn,
  onPlayAgain
}) => {
  return (
    <div
      id="victory-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
    >
      <div className="relative max-w-xl w-full bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-5 shrink-0">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
            <Trophy className="w-9 h-9 text-slate-950" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Victory Complete!
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300 font-['Fredoka']">
            All Clear!
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            ยอดเยี่ยมมาก! คุณจำแนกคำศัพท์ได้ครบทั้ง {totalWords} คำอย่างสมบูรณ์แบบ
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5 shrink-0">
          <div className="bg-slate-800/70 border border-amber-500/30 rounded-2xl p-3 text-center">
            <div className="text-[11px] text-slate-400 font-medium">Final Score</div>
            <div className="text-2xl font-black text-amber-300 font-['Fredoka']">{score}</div>
          </div>
          <div className="bg-slate-800/70 border border-orange-500/30 rounded-2xl p-3 text-center">
            <div className="text-[11px] text-slate-400 font-medium">Max Streak</div>
            <div className="text-2xl font-black text-orange-400 font-['Fredoka']">{maxCombo}x</div>
          </div>
          <div className="bg-slate-800/70 border border-emerald-500/30 rounded-2xl p-3 text-center">
            <div className="text-[11px] text-slate-400 font-medium">Classified</div>
            <div className="text-2xl font-black text-emerald-300 font-['Fredoka']">{totalWords}</div>
          </div>
        </div>

        {/* Scrollable word collection review */}
        <div className="flex-1 overflow-y-auto pr-1 mb-5 space-y-4 text-xs">
          {/* Boat 'a' Collection */}
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-sm">
                <Ship className="w-4 h-4" /> Boat 'a' ({wordsA.length} คำ)
              </span>
              <span className="text-[10px] text-slate-400">Consonant sounds</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {wordsA.map((w, idx) => (
                <span
                  key={idx}
                  className="bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 px-2 py-0.5 rounded-lg text-[11px]"
                >
                  a {w}
                </span>
              ))}
            </div>
          </div>

          {/* Boat 'an' Collection */}
          <div className="bg-slate-800/50 border border-amber-500/20 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                <Ship className="w-4 h-4" /> Boat 'an' ({wordsAn.length} คำ)
              </span>
              <span className="text-[10px] text-slate-400">Vowel sounds</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {wordsAn.map((w, idx) => (
                <span
                  key={idx}
                  className="bg-amber-950/60 border border-amber-500/30 text-amber-200 px-2 py-0.5 rounded-lg text-[11px]"
                >
                  an {w}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          id="btn-play-again"
          onClick={onPlayAgain}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-black text-base tracking-wide shadow-lg hover:shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer font-['Fredoka'] shrink-0"
        >
          <RotateCcw className="w-5 h-5" />
          <span>เล่นอีกครั้ง (Play Again)</span>
        </button>
      </div>
    </div>
  );
};
