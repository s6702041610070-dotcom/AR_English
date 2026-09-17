import React from 'react';
import { Volume2, VolumeX, RotateCcw, Hand, Award, Flame, BookOpen } from 'lucide-react';

interface HUDProps {
  score: number;
  combo: number;
  clearedCount: number;
  totalWords: number;
  handDetected: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onRestart: () => void;
  onOpenDeck: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  combo,
  clearedCount,
  totalWords,
  handDetected,
  isMuted,
  onToggleMute,
  onRestart,
  onOpenDeck
}) => {
  return (
    <header className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      {/* Left: Score & Combo */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div
          id="hud-score-card"
          className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2.5"
        >
          <Award className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Score</div>
            <div className="text-xl font-black text-amber-300 font-['Fredoka'] leading-none">
              {score}
            </div>
          </div>
        </div>

        {combo > 1 && (
          <div
            id="hud-combo-card"
            className="bg-gradient-to-r from-orange-500/80 to-amber-500/80 backdrop-blur-md border border-amber-300/40 px-3 py-2 rounded-2xl shadow-lg flex items-center gap-2 animate-bounce"
          >
            <Flame className="w-4 h-4 text-yellow-200 fill-yellow-300" />
            <span className="text-sm font-black text-white font-['Fredoka']">
              {combo}x Streak!
            </span>
          </div>
        )}
      </div>

      {/* Center: Progress */}
      <div
        id="hud-progress-card"
        className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-3"
      >
        <div className="text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Progress</div>
          <div className="text-sm font-black text-cyan-300 font-['Fredoka']">
            {clearedCount} / {totalWords} <span className="text-xs font-normal text-slate-400">words</span>
          </div>
        </div>
        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, (clearedCount / totalWords) * 100)}%` }}
          />
        </div>
      </div>

      {/* Right: Controls & Hand status */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Hand Status Indicator */}
        <div
          id="hud-hand-indicator"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl backdrop-blur-md text-xs font-semibold border transition-all ${
            handDetected
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/70 border-rose-500/40 text-rose-300 animate-pulse'
          }`}
        >
          <Hand className="w-4 h-4" />
          <span className="hidden sm:inline">{handDetected ? 'Hand Active' : 'No Hand'}</span>
        </div>

        {/* Cargo Deck Button */}
        <button
          id="hud-cargo-btn"
          onClick={onOpenDeck}
          title="ดูคำศัพท์ที่เก็บได้ในเรือ"
          className="bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-white p-2.5 rounded-2xl backdrop-blur-md transition-colors shadow-md flex items-center justify-center cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-cyan-300" />
        </button>

        {/* Sound Toggle */}
        <button
          id="hud-sound-toggle-btn"
          onClick={onToggleMute}
          title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
          className="bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-white p-2.5 rounded-2xl backdrop-blur-md transition-colors shadow-md flex items-center justify-center cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
        </button>

        {/* Restart Button */}
        <button
          id="hud-restart-btn"
          onClick={onRestart}
          title="เริ่มเกมใหม่"
          className="bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-white p-2.5 rounded-2xl backdrop-blur-md transition-colors shadow-md flex items-center justify-center cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </header>
  );
};
